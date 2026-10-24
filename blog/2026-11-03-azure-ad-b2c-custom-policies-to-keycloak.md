---
slug: azure-ad-b2c-custom-policies-to-keycloak
title: "Porting Azure AD B2C custom policies to Keycloak"
date: 2026-11-03
authors: [jpatzer]
tags: [keycloak, migration, azure, authentication, spi]
description: A concept-by-concept map from Azure AD B2C custom policies (IEF) to Keycloak 26.8 — user journeys, technical profiles, claims transformations — and the three things that need Java.
keywords:
  - azure ad b2c custom policies keycloak
  - identity experience framework keycloak
  - b2c user journey keycloak authentication flow
  - b2c technical profile keycloak
  - keycloak authenticator spi
---

Most of an Azure AD B2C custom policy maps onto Keycloak configuration rather than code. A
user journey becomes an authentication flow, orchestration steps become executions,
preconditions become conditional subflows, the claims schema becomes the declarative user
profile, and page layouts become themes. None of that is Java.

Three things are not configuration. **RESTful technical profiles** called mid-journey become a
custom Authenticator. **Long claims-transformation chains** become either several protocol
mappers or one script mapper — and the script mapper is a JAR you build, not JavaScript you
paste into the console, which surprises people. And **orchestration that branches on a computed
value** rather than on the presence of a claim has no declarative equivalent at all.

Everything below was run against **Keycloak 26.8.1** in `start-dev`. The Java compiles against
26.8.1; every HTTP status and response body is copied from an actual run.

<!-- truncate -->

## The short version

| Azure AD B2C | Keycloak 26.8 | Code? |
|---|---|---|
| `<UserJourney>` | Authentication flow | No |
| `<OrchestrationStep>` | Execution, or a subflow | No |
| `<Precondition>` | `CONDITIONAL` subflow + a condition execution | No |
| Self-asserted technical profile | Built-in form authenticator + user profile | No |
| OIDC/SAML technical profile | [Identity provider](/docs/keycloak/idp/) | No |
| AAD read/write technical profile | Keycloak's own user store | No |
| RESTful technical profile | **Authenticator SPI** | **Yes** |
| `<ClaimsSchema>` / `<ClaimType>` | Declarative user profile | No |
| `<ClaimsTransformation>` | Protocol mapper | No |
| Chained transformations | Script mapper (**a deployed JAR**) | **Yes** |
| `<ContentDefinition>` / `LoadUri` | [Keycloak theme](/extensions/themes/) | No |
| `<LocalizedResources>` | Theme message bundles | No |
| `<RelyingParty>` output claims | Client scopes + protocol mappers | No |

Work down that table against your own `TrustFrameworkExtensions.xml` before estimating
anything. The count of rows in the "Yes" column is your project.

## User journeys become authentication flows

A B2C user journey is an ordered list of orchestration steps, each referencing a technical
profile, each optionally guarded by a precondition. A Keycloak authentication flow is an
ordered list of executions, each referencing an authenticator, each with a requirement, and
subflows can be guarded by conditions. The shapes match closely enough that you can usually
transcribe one into the other on paper first.

Built-in flows are read-only, so you start by copying one:

```bash
kcadm.sh create authentication/flows/browser/copy -r b2c -s newName=b2c-journey
```

Then add a subflow for each orchestration step that needs a guard, and the executions inside
it:

```bash
# The orchestration step
kcadm.sh create authentication/flows/b2c-journey/executions/flow -r b2c \
  -s alias=step-mfa -s type=basic-flow -s provider=registration-page-form \
  -s description='OrchestrationStep with Precondition'

# Its precondition, then the technical profile it guards
kcadm.sh create authentication/flows/step-mfa/executions/execution -r b2c \
  -s provider=conditional-user-attribute
kcadm.sh create authentication/flows/step-mfa/executions/execution -r b2c \
  -s provider=auth-otp-form
```

Read the flow back and you get this — the copied browser flow with the new subflow at the
bottom:

```
Cookie                                       ALTERNATIVE  auth-cookie
Kerberos                                     DISABLED     auth-spnego
Identity Provider Redirector                 ALTERNATIVE  identity-provider-redirector
b2c-journey Organization                     ALTERNATIVE  -
  b2c-journey Browser - Conditional Organization CONDITIONAL  -
    Condition - user configured                  REQUIRED     conditional-user-configured
    Organization Identity-First Login            ALTERNATIVE  organization
b2c-journey forms                            ALTERNATIVE  -
  Username Password Form                       REQUIRED     auth-username-password-form
  b2c-journey Browser - Conditional 2FA        CONDITIONAL  -
    Condition - user configured                  REQUIRED     conditional-user-configured
    Condition - credential                       REQUIRED     conditional-credential
    OTP Form                                     ALTERNATIVE  auth-otp-form
    WebAuthn Authenticator                       DISABLED     webauthn-authenticator
    Recovery Authentication Code Form            DISABLED     auth-recovery-authn-code-form
step-mfa                                     DISABLED     -
  Condition - user attribute                   DISABLED     conditional-user-attribute
  OTP Form                                     DISABLED     auth-otp-form
```

Two things in that output matter. The first is that **everything you just created arrived
`DISABLED`** — Keycloak does not infer a requirement from the fact that you added an execution,
and a flow that silently does nothing is the usual first failure. The second is that the stock
flow already demonstrates the pattern you want: a `CONDITIONAL` subflow whose first children
are conditions and whose remaining children only run if they pass.

Set the requirements as a separate step. The requirement model has four values and some
non-obvious interactions between them — [building a custom authentication
flow](/tutorials/authentication/custom-flows/) walks through the five ways it fails quietly,
which is worth reading before you transcribe a twelve-step journey.

## Preconditions become conditions

B2C preconditions come in two useful flavours: `ClaimsExist` and `ClaimEquals`, with
`ExecuteActionsIf` inverting them. Keycloak ships seven condition executions, and this is the
complete list on 26.8.1:

```
conditional-client-scope
conditional-credential
conditional-level-of-authentication
conditional-sub-flow-executed
conditional-user-attribute
conditional-user-configured
conditional-user-role
```

The mapping is mostly direct. `ClaimsExist` on a user attribute is
`conditional-user-attribute`. `ClaimEquals` is the same condition with a value configured.
A precondition on whether the user has MFA set up is `conditional-user-configured`. A
precondition on the requested authentication context is `conditional-level-of-authentication`.
A precondition that depends on an earlier step having run is `conditional-sub-flow-executed`.

What is *not* there is a condition on an arbitrary expression. If your precondition tests a
claim produced by a transformation two steps earlier, there is no declarative equivalent — you
either persist the value as a user attribute first and test it with
`conditional-user-attribute`, or you write a condition in Java. Persisting it is almost always
the better answer, because it is also the thing that makes the journey debuggable.

## The claims schema becomes the declarative user profile

A `<ClaimType>` with a `<DataType>`, a `<UserInputType>` and a predicate validation maps onto
one attribute in the realm's user profile. This is a closer match than it first appears:
Keycloak's user profile carries display names, input types, per-role view and edit
permissions, required-ness, and validators.

```bash
curl -X PUT "$KC/admin/realms/b2c/users/profile" -H "$A" -H 'Content-Type: application/json' -d '{
 "attributes":[
  {"name":"username","permissions":{"view":["admin","user"],"edit":["admin","user"]}},
  {"name":"email","required":{"roles":["user"]},
   "permissions":{"view":["admin","user"],"edit":["admin","user"]}},
  {"name":"firstName","permissions":{"view":["admin","user"],"edit":["admin","user"]}},
  {"name":"lastName","permissions":{"view":["admin","user"],"edit":["admin","user"]}},
  {"name":"extension_loyaltyId","displayName":"Loyalty ID","multivalued":false,
   "required":{"roles":["user"]},
   "validations":{"pattern":{"pattern":"^[A-Z]{2}[0-9]{8}$","error-message":"loyaltyId-invalid"},
                  "length":{"min":10,"max":10}},
   "permissions":{"view":["admin","user"],"edit":["admin","user"]},
   "annotations":{"inputType":"text"}}
 ]}'
# HTTP 200
```

The validators are enforced server-side, on the Admin API as well as on the login forms, which
is the part B2C predicates do not quite give you. A user that violates the pattern is rejected
with the field named:

```json
HTTP 400
{"errors":[
  {"field":"extension_loyaltyId","errorMessage":"error-invalid-length","params":["extension_loyaltyId",10,10]},
  {"field":"extension_loyaltyId","errorMessage":"loyaltyId-invalid","params":["extension_loyaltyId","^[A-Z]{2}[0-9]{8}$"]}]}
```

Note that B2C's `extension_` prefix is just a string here — keep the names identical to the
B2C ones during the migration and rename later, if at all. Reconciling two systems is hard
enough without a translation layer in the middle.

**Declare every attribute before you import anything.** An attribute the realm does not know
about is silently discarded on write, and the write still succeeds. That behaviour and the
four `unmanagedAttributePolicy` values are covered properly in [managed vs unmanaged
attributes](/tutorials/users/user-profile/); it is the single most expensive thing to discover
late in a B2C migration, and it comes up again in [migrating users without password
hashes](/blog/migrate-azure-ad-b2c-users-to-keycloak/).

## Technical profiles: four kinds, four destinations

"Technical profile" is one word covering four unrelated jobs. Separate them before you map
them.

**Self-asserted** profiles collect input from the user. In Keycloak these are form
authenticators plus the user profile above — the fields rendered on the login, registration
and update-profile pages come from the profile configuration, so a self-asserted technical
profile usually disappears into configuration you have already written.

**Azure Active Directory** profiles (`AAD-UserReadUsingObjectId`, `AAD-UserWriteUsingLogonEmail`
and friends) read and write the B2C directory. Keycloak has its own user store, so these have
no equivalent and need none. They vanish.

**OpenID Connect and SAML** profiles federate to another IdP. These become identity providers —
configuration, one per provider, with mappers to pull claims onto the user:

```bash
kcadm.sh create identity-provider/instances -r b2c \
  -s alias=partner-idp -s providerId=oidc -s enabled=true \
  -s 'config.authorizationUrl=https://idp.example.com/authorize' \
  -s 'config.tokenUrl=https://idp.example.com/token' \
  -s 'config.jwksUrl=https://idp.example.com/keys' \
  -s 'config.useJwksUrl=true' -s 'config.clientId=...' -s 'config.clientSecret=...'

kcadm.sh create identity-provider/instances/partner-idp/mappers -r b2c \
  -s name=loyalty -s identityProviderAlias=partner-idp \
  -s identityProviderMapper=oidc-user-attribute-idp-mapper \
  -s 'config.claim=extension_loyaltyId' \
  -s 'config.user.attribute=extension_loyaltyId' \
  -s 'config.syncMode=INHERIT'
```

Worth pausing here, because this is where the comparison with the other destination gets
sharp. Microsoft's [B2C-to-External-ID migration
guide](https://learn.microsoft.com/entra/external-id/customers/migrate-from-b2c-to-external-id)
says that "third-party identity providers configured through B2C custom policies aren't
supported" in External ID. In Keycloak a third-party IdP is four lines of configuration and
there is no supported-list to be on.

**RESTful** profiles are the ones that cost you. They need an authenticator.

## RESTful technical profiles become an Authenticator

A `RestfulProvider` technical profile called from an orchestration step does three things: send
some input claims to an HTTP endpoint, receive output claims, and fail the journey on a
non-success response. That is exactly an `Authenticator`.

The whole surface is two interfaces and a service file. Here is the core of it — the full class
compiles against Keycloak 26.8.1 as a `provided`-scope Maven build:

```java
@Override
public void authenticate(AuthenticationFlowContext context) {
  Map<String, String> cfg = context.getAuthenticatorConfig() == null
      ? Map.of() : context.getAuthenticatorConfig().getConfig();
  UserModel user = context.getUser();

  try {
    // InputClaims: what the technical profile would have sent.
    String body = JsonSerialization.writeValueAsString(Map.of(
        "email", user.getEmail() == null ? "" : user.getEmail(),
        "objectId", user.getFirstAttribute("b2c_object_id") == null
            ? "" : user.getFirstAttribute("b2c_object_id")));

    HttpResponse<String> res = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(5)).build()
        .send(HttpRequest.newBuilder(URI.create(cfg.get("endpointUrl")))
                .timeout(Duration.ofSeconds(10))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body)).build(),
            HttpResponse.BodyHandlers.ofString());

    // A technical profile that returns a conflict fails the journey. So does this.
    if (res.statusCode() == 409) {
      context.failure(AuthenticationFlowError.INVALID_USER);
      return;
    }
    if (res.statusCode() / 100 != 2) {
      // Not "the answer is no" -- "we did not get an answer". Different outcome.
      context.failure(AuthenticationFlowError.INTERNAL_ERROR);
      return;
    }

    // OutputClaims: persist what came back so a protocol mapper can emit it.
    Map<String, Object> out = JsonSerialization.readValue(res.body(), Map.class);
    Object claim = out.get(cfg.getOrDefault("outputClaim", "membershipTier"));
    if (claim != null) {
      user.setSingleAttribute(cfg.getOrDefault("outputClaim", "membershipTier"),
                              String.valueOf(claim));
    }
    context.success();
  } catch (Exception e) {
    context.failure(AuthenticationFlowError.INTERNAL_ERROR);
  }
}
```

The distinction in the middle is the one to copy deliberately. **A 409 and a timeout are not
the same result.** B2C's `UserMessageIfClaimsPrincipalDoesNotExist` metadata encourages you to
treat every non-200 as a user-facing "no"; in a flow that gates access, conflating "your API
said no" with "your API did not answer" is how an outage becomes a lockout, or worse, an
accidental allow.

Implement `AuthenticatorFactory` on the same class, expose the endpoint URL and the output
claim as `ProviderConfigProperty` entries so the step is configurable per realm, register it in
`META-INF/services/org.keycloak.authentication.AuthenticatorFactory`, and drop the JAR in
`providers/`. It then appears in the execution picker next to the 42 built-in authenticators
and takes per-execution configuration the way a built-in does.

## Claims transformations become protocol mappers

Most transformations are not transformations at all, they are claim plumbing, and Keycloak has
39 protocol mappers for exactly that. `CopyClaim` into the token is a user-attribute mapper.
`CreateStringClaim` with a constant is a hardcoded-claim mapper.

```bash
# CopyClaim: extension_loyaltyId -> loyalty_id
kcadm.sh create clients/$CID/protocol-mappers/models -r b2c \
  -s name=loyalty-id -s protocol=openid-connect \
  -s protocolMapper=oidc-usermodel-attribute-mapper \
  -s 'config."user.attribute"=extension_loyaltyId' \
  -s 'config."claim.name"=loyalty_id' -s 'config."jsonType.label"=String' \
  -s 'config."id.token.claim"=true' -s 'config."access.token.claim"=true'

# CreateStringClaim: a constant
kcadm.sh create clients/$CID/protocol-mappers/models -r b2c \
  -s name=tenant -s protocol=openid-connect \
  -s protocolMapper=oidc-hardcoded-claim-mapper \
  -s 'config."claim.name"=tid' -s 'config."claim.value"=contoso' \
  -s 'config."jsonType.label"=String' -s 'config."id.token.claim"=true'
```

Both return `HTTP 201`. Put them on a shared client scope rather than per-client if more than
one application needs the claim — that is the `<RelyingParty>` output-claims list, expressed
once.

### The script-mapper trap

For the transformations that genuinely compute something — string formatting, conditionals,
concatenating three claims into one — the documented answer is a script mapper. It does not
work the way the documentation implies.

Starting Keycloak with `--features=scripts` and creating a script mapper through the Admin API
gives you this:

```
HTTP 404
{"error":"ProtocolMapper provider not found"}
```

The feature is enabled — `SCRIPTS` shows up in the server's feature list — and the mapper
provider still is not registered. **Script mappers are deployed, not authored.** You package
the JavaScript in a JAR with a `META-INF/keycloak-scripts.json` descriptor naming it, drop the
JAR in `providers/`, and only then does the mapper appear. There is no console path and no API
path that takes a script body.

That is a reasonable security decision — arbitrary server-side JavaScript posted over the Admin
API would be remote code execution with extra steps — but it changes the estimate. A script
mapper is a build artifact on the same footing as the Authenticator above: same JAR, same
pipeline, same release process. If you were counting on script mappers to avoid writing Java,
count again; you are writing a deployable either way, and Java is easier to test.

Our practical advice is to **avoid script mappers for anything you can express as a user
attribute.** Compute the value where it is produced — in the Authenticator that called the
REST endpoint, or in the application that owns the data — persist it as an attribute, and emit
it with a plain attribute mapper. It is debuggable, it survives upgrades, and it does not need
a feature flag.

## Page layouts become themes

B2C's `<ContentDefinition>` points `LoadUri` at HTML you host, and B2C injects its form into a
container element. Keycloak inverts this: you override the templates themselves. Keycloak 26.8
has six theme types:

```
account  admin  common  email  login  welcome
```

The `login` theme is the one that corresponds to your content definitions, and `email` picks up
the verification and password-reset messages that B2C sends through a third-party provider via
custom policy. `<LocalizedResources>` becomes message bundles —
`messages_en.properties`, `messages_de.properties` — in the same theme.

This is more capable than what you have, and it is also more work, because you are theming
real templates rather than styling an injected form. **Do not schedule the theme work inside
the migration window.** Ship with a lightly branded stock theme, cut over, then do the design
pass. The one thing to get right on day one is the email theme, because those messages go to
users during cutover.

## What genuinely has no equivalent

Three things, and they are the honest answer to "can we automate this".

**Orchestration that branches on computed values.** Covered above: persist the value, then
condition on it, or write a condition authenticator.

**`<ValidationTechnicalProfile>` chains.** B2C lets a self-asserted profile validate its input
by running another technical profile, which can itself call REST and fail with a specific
user-facing message. Keycloak's equivalent is a form authenticator that does the validation
inline and re-renders the form with an error, which means the validation and the form are one
class rather than two composable pieces. Each chain is a small amount of Java.

**The IEF claims-transformation library itself.** There are dozens of transformation methods,
and Keycloak does not ship equivalents as a library. Most translate to nothing, because the
work moves somewhere better. The ones that do not become code.

There is also no converter, from anyone, in either direction. Microsoft's own migration guide
maps custom policies to External ID's custom authentication extensions as a *concept*, with no
tooling. Treat any claim of an automated IEF migration with suspicion.

## How long this takes

Estimate off the table at the top, not off the number of policy files — a tenant with six
policy files inheriting from one base is usually less work than a tenant with two that each
call three REST endpoints.

| Your tenant | Rough effort |
|---|---|
| Built-in user flows only, no custom policies | Days. There is nothing to port |
| Custom policies, no REST profiles, no transformation chains | One to two weeks of configuration |
| Custom policies with two or three REST profiles | Add a week per endpoint, including tests |
| Enterprise federation through custom policies | A few days per IdP, mostly spent on the other side |
| The lot, plus a bespoke theme | Two to four months end to end |

Those are ranges, not quotes. The variance is almost entirely in the REST profiles and in how
much undocumented behaviour your policies encode.

## Do this next

Export your policy files and count three things: orchestration steps, technical profiles by
protocol, and distinct claims transformations. That takes an hour with `grep` and it is the
only input anyone needs to give you a real estimate.

```bash
grep -c '<OrchestrationStep' TrustFrameworkExtensions.xml
grep -o 'Protocol Name="[A-Za-z]*"' TrustFrameworkExtensions.xml | sort | uniq -c
grep -o 'TransformationMethod="[A-Za-z]*"' TrustFrameworkExtensions.xml | sort | uniq -c
```

Then stand up Keycloak 26.8.1 locally and transcribe your simplest journey — usually sign-up or
sign-in — end to end. A day on the simplest one tells you more than a week of planning on the
hardest, and it is the only way to find out which of your preconditions test computed values.

The surrounding decisions — whether to move at all, and where — are in [what Azure AD B2C's end
of sale actually means](/blog/azure-ad-b2c-end-of-sale/), and the side-by-side is on [Keycloak
vs. Azure AD B2C](/keycloak-alternatives/azure-ad-b2c/). If you would rather hand the policy
files to someone who has read a few of them, [talk to us about migrating to
Keycloak](/support/migrate-to-keycloak/) — and if you want the result run for you afterwards,
that is [managed Keycloak](/hosting/dedicated-clusters/).
