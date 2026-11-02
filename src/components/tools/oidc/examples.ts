/**
 * Synthetic example data for the JWKS Verifier and OIDC Discovery Inspector.
 *
 * Everything here is fake and uses example.com hosts. The keys were generated
 * for this page only (the private keys were discarded); the sample token is
 * genuinely signed by EXAMPLE_JWKS key "demo-rs256-2026" so signature
 * verification can be demonstrated end to end. The "demo-legacy-2019" key is
 * deliberately weak (1024-bit, expired certificate, no use/alg) to show what
 * the linter flags. The discovery document mirrors the shape Keycloak
 * publishes for a realm.
 */
import type { Jwks } from "./jwks";
import type { DiscoveryDoc } from "./discovery";

export const EXAMPLE_ISSUER = "https://auth.example.com/realms/demo";

export const EXAMPLE_JWKS: Jwks = {
  keys: [
    {
      kid: "demo-rs256-2026",
      kty: "RSA",
      alg: "RS256",
      use: "sig",
      n: "kV-0h3oPZ1w2UhjoDyWDVsLGHn33BK4JRmMCBp0bNa_nDoywIWkEJBCHBRfMSwosBGPDvvVkrclkAaQGNy9egyZNDSt0oycU8FZcMEyj4jkzSw4uh11_xTegEmMrb-ysq-dfdBkIpKtNKBxY2PklizprQPxv66uFejDP6oO3k17Am-iaOgNfnLxcKLdZiqWj4ekBcA5QIXVkQSXDnwVu5xwXHlvdU9pTRSIPif8pwtiFKq-Ukqw6FQqb77mk2FAWR-qCFrfDutTGjQX8MglgD11zdf1bkjJzGR24MPBU3--p_otyeBIgyOYnJDZ1YMz2B1CL8Lq7QJlx0bUIaX1GHQ",
      e: "AQAB",
      x5c: [
        "MIIC3jCCAcagAwIBAgIUZu7mHIvVkxTOv3K8NIrRPz6bcXUwDQYJKoZIhvcNAQELBQAwDzENMAsGA1UEAwwEZGVtbzAeFw0yNjAxMDEwMDAwMDBaFw0zNjAxMDEwMDAwMDBaMA8xDTALBgNVBAMMBGRlbW8wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCRX7SHeg9nXDZSGOgPJYNWwsYeffcErglGYwIGnRs1r+cOjLAhaQQkEIcFF8xLCiwEY8O+9WStyWQBpAY3L16DJk0NK3SjJxTwVlwwTKPiOTNLDi6HXX/FN6ASYytv7Kyr5190GQikq00oHFjY+SWLOmtA/G/rq4V6MM/qg7eTXsCb6Jo6A1+cvFwot1mKpaPh6QFwDlAhdWRBJcOfBW7nHBceW91T2lNFIg+J/ynC2IUqr5SSrDoVCpvvuaTYUBZH6oIWt8O61MaNBfwyCWAPXXN1/VuSMnMZHbgw8FTf76n+i3J4EiDI5ickNnVgzPYHUIvwurtAmXHRtQhpfUYdAgMBAAGjMjAwMB0GA1UdDgQWBBQ1SDfzdT/8zRY9E2t8XCsax5mWcDAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQA67GenbVqIm8cnCwU4uVPi/cKTzYw2sWhD3jR06216ZgZ57llhq6gOHsPSVQpdWIZOwoa6MNmfF8ltTqIZ1SCiJkhXjqyWvJzsveiH+PNNO7/ZRcuvNO090FjQZrwiFlY5bgseNAaDshQYcIEwC0wvwXa8yuBRdrqPLc/ZdPTWE0nN+kvyAqMjwjY3tUk7/wHW+z8ZXeRXjLKP6pJMIyC2vma5lEd3qjl9Zk3QAGdHVV/ZwsHe4axHr6DoH6dRYkcnq3gmDAGxD3FqTkzwyeeAUyXoYh9XRB7f1QdDwFyMFsSbTsC4sBxWvB82HlBBD38ERGPeQRu3tIYwRBAZKUIY",
      ],
      x5t: "upj0M-acd6o0sNf28i8lhc7xI28",
      "x5t#S256": "xm4-XGlVKXySwqAWRijXkBaratzGixqSqlSLDvKvGv8",
    },
    {
      kid: "demo-rsa-oaep-2026",
      kty: "RSA",
      alg: "RSA-OAEP",
      use: "enc",
      n: "2CGP057ff3ryPyvotLzrCrQQlc-tQyHCyAJWl09NFqTe2Aq1HWS8tzqow3jKUacg5c6dHgfyWSHATwrfiUp4kAGzVWTI3WNWOG5S8_QlbJrpEtPOTrliWlC4jv1rnYH2oLPIuRffYaCzqA53eC4xmby1oSfHJ8cWoVlCfKK0-whyy2Fm3WiQXJ6gROav59G2mo_7Ktp_ngOwvkLq6xXqzZH8UnuPNTUD6_1L2tt3XSl5JGh-rwmC5QuGYmC06uwl1Wj_-KURdTgCPg9Ry-1imQPmoWfezb6CAHxlVpTb6UTRMdQ462zPrYSamMJcKz_0EBZ9avG3-krJz7GIxkJeJQ",
      e: "AQAB",
      x5c: [
        "MIIC3jCCAcagAwIBAgIUMEEwEIZoJaCTrmN2V2DCuJmdQLowDQYJKoZIhvcNAQELBQAwDzENMAsGA1UEAwwEZGVtbzAeFw0yNjAxMDEwMDAwMDBaFw0zNjAxMDEwMDAwMDBaMA8xDTALBgNVBAMMBGRlbW8wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDYIY/Tnt9/evI/K+i0vOsKtBCVz61DIcLIAlaXT00WpN7YCrUdZLy3OqjDeMpRpyDlzp0eB/JZIcBPCt+JSniQAbNVZMjdY1Y4blLz9CVsmukS085OuWJaULiO/Wudgfags8i5F99hoLOoDnd4LjGZvLWhJ8cnxxahWUJ8orT7CHLLYWbdaJBcnqBE5q/n0baaj/sq2n+eA7C+QurrFerNkfxSe481NQPr/Uva23ddKXkkaH6vCYLlC4ZiYLTq7CXVaP/4pRF1OAI+D1HL7WKZA+ahZ97NvoIAfGVWlNvpRNEx1DjrbM+thJqYwlwrP/QQFn1q8bf6SsnPsYjGQl4lAgMBAAGjMjAwMB0GA1UdDgQWBBTGcnXkSvvf2J0uluvXwUAF5aOT1TAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQBYRUKoN0sUnceJc+UM0bEIvZJVNRkaMigFJkHHFKhzcphGtvInrWW6Lkhml3p7s7OoaebJ5J2xdiqJJ4kyFS74sgsQasDjtXm2ek4cUpFTXniaWE8C5NQFLjFQt7TJiY8Qkn15sLaKRbcgC4ZF09fhEkdWa47ZJddY8/vvwUfkmJj+1yhxwnN0labU9Kd8WwAMaplW+AIy2Q8i6ICAuCkuNypeIIjyEoPtcmAm3NrD2pk/YkqlGuhzzgcceq02EEqTqzOcJr+yKvuFZlRHFAC101eMAzmSPu3wJdBNVy6RLEjyHG4dLrr/O/kVQLp3UygBOuhx/AscyEOBcwQ5Ef0g",
      ],
      x5t: "gwJXEiGvSUwOmOJDUePtV7ECXZE",
      "x5t#S256": "6QQhlU_7yOx4V2Q5XjHLd-NWFN57BpuMHV3qNqGTW7A",
    },
    {
      kid: "demo-es256-2026",
      kty: "EC",
      alg: "ES256",
      use: "sig",
      crv: "P-256",
      x: "WZLAk3HoJOlJMRMr-WmZnyEqgXp9xCg4c4Gh2IxHF_0",
      y: "Fa57-GsPv1MT3qlgkqYH9k_FeEB3tJOXeEy40QDfaao",
    },
    {
      kid: "demo-legacy-2019",
      kty: "RSA",
      n: "vc_hWTRoGeLQByJEhXvUBfA5b4TFAiyokt9p-7dQikghGmO8tjZN75pm70tEH8rU8-Ce3HM7HuBn8KQdrN6z-u8LfYK9RQ0_YrGaMTC84k5ECl0LLzc3TAzxA5D2jhwkNLFNqTHpr4qlHdWx_GshqNA0HWxXhT-TWIzthH4GyIc",
      e: "AQAB",
      x5c: [
        "MIICBzCCAXCgAwIBAgIUewTqhhgubbogUlbtELeh+/0ssJUwDQYJKoZIhvcNAQELBQAwJjENMAsGA1UEAwwEZGVtbzEVMBMGA1UECgwMRXhhbXBsZSBDb3JwMB4XDTE5MDEwMTAwMDAwMFoXDTIxMDEwMTAwMDAwMFowJjENMAsGA1UEAwwEZGVtbzEVMBMGA1UECgwMRXhhbXBsZSBDb3JwMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC9z+FZNGgZ4tAHIkSFe9QF8DlvhMUCLKiS32n7t1CKSCEaY7y2Nk3vmmbvS0QfytTz4J7cczse4GfwpB2s3rP67wt9gr1FDT9isZoxMLziTkQKXQsvNzdMDPEDkPaOHCQ0sU2pMemviqUd1bH8ayGo0DQdbFeFP5NYjO2EfgbIhwIDAQABozIwMDAdBgNVHQ4EFgQUu2jOT7ew0YwMJOk/mN/6Km6B/2QwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOBgQAkLtgpHG35g8bCyMOAODnGu+ksHngkKcjIzsfwoqhqS8Md4jKV4PGnEn/xjuhOS1+j/AB/7l1yjPmEoyyibtxdALZv8UfrSME5UTHJxz3gm4Lk6DFWZn4Z9aRFqISFsauMmwLD64Ztj0yTspD/NuRImP5cc+zR3a9yXgkmUpqTmw==",
      ],
    },
  ],
};

export const EXAMPLE_JWT =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRlbW8tcnMyNTYtMjAyNiJ9.eyJ0eXAiOiJCZWFyZXIiLCJhenAiOiJkZW1vLWFwcCIsInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhbGljZUBleGFtcGxlLmNvbSIsImVtYWlsIjoiYWxpY2VAZXhhbXBsZS5jb20iLCJpc3MiOiJodHRwczovL2F1dGguZXhhbXBsZS5jb20vcmVhbG1zL2RlbW8iLCJzdWIiOiIyZjljMWE3ZS0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDEiLCJhdWQiOiJhY2NvdW50IiwiaWF0IjoxNzY3MjI1NjAwLCJleHAiOjE3NjcyMjU5MDAsImp0aSI6IjVkM2I2ZjBlLTAwMDAtNDAwMC04MDAwLTAwMDAwMDAwMDAwMiJ9.WwgrOtoGn4-RHtILqYX6u1jLdVd4qf4K-GoK6DQyGOj7fuLegj3rXfJH8aR5YG6GrlIBDkaDNWrerS0ZNak2ZOIJGOGOnedn0pNp5L3uS_WIJYIXH1f0pwaoL57lB-ebcLp7Pjhp96tPGMfeynj3qadrI46YAjwoyCe8DijgUaXAdzFwnqiiY2c1peqK7PJvM7SNMVp1NphgtN0hG4Lg-JMVFLAX66PNRuHWILiaFsFANfVmWCVGKYJB9TZ8ii5_rUB1yaP_VYCORP74hMitvaIEqrdSE_rbtS78l9qWYIoO7ScE92utO3nOOuZ9uH159V25mecxnA4cXR31EfEkYQ";

export const EXAMPLE_DISCOVERY: DiscoveryDoc = {
  issuer: "https://auth.example.com/realms/demo",
  authorization_endpoint:
    "https://auth.example.com/realms/demo/protocol/openid-connect/auth",
  token_endpoint:
    "https://auth.example.com/realms/demo/protocol/openid-connect/token",
  introspection_endpoint:
    "https://auth.example.com/realms/demo/protocol/openid-connect/token/introspect",
  userinfo_endpoint:
    "https://auth.example.com/realms/demo/protocol/openid-connect/userinfo",
  end_session_endpoint:
    "https://auth.example.com/realms/demo/protocol/openid-connect/logout",
  frontchannel_logout_session_supported: true,
  frontchannel_logout_supported: true,
  jwks_uri:
    "https://auth.example.com/realms/demo/protocol/openid-connect/certs",
  check_session_iframe:
    "https://auth.example.com/realms/demo/protocol/openid-connect/login-status-iframe.html",
  grant_types_supported: [
    "authorization_code",
    "client_credentials",
    "implicit",
    "password",
    "refresh_token",
    "urn:ietf:params:oauth:grant-type:device_code",
    "urn:ietf:params:oauth:grant-type:token-exchange",
    "urn:openid:params:grant-type:ciba",
  ],
  acr_values_supported: ["0", "1"],
  response_types_supported: [
    "code",
    "none",
    "id_token",
    "token",
    "id_token token",
    "code id_token",
    "code token",
    "code id_token token",
  ],
  subject_types_supported: ["public", "pairwise"],
  prompt_values_supported: ["none", "login", "consent"],
  id_token_signing_alg_values_supported: [
    "PS384",
    "RS384",
    "EdDSA",
    "ES384",
    "HS256",
    "HS512",
    "ES256",
    "RS256",
    "HS384",
    "ES512",
    "PS256",
    "PS512",
    "RS512",
  ],
  id_token_encryption_alg_values_supported: [
    "ECDH-ES+A256KW",
    "ECDH-ES+A192KW",
    "ECDH-ES+A128KW",
    "RSA-OAEP",
    "RSA-OAEP-256",
    "RSA1_5",
    "ECDH-ES",
  ],
  id_token_encryption_enc_values_supported: [
    "A256GCM",
    "A192GCM",
    "A128GCM",
    "A128CBC-HS256",
    "A192CBC-HS384",
    "A256CBC-HS512",
  ],
  userinfo_signing_alg_values_supported: [
    "PS384",
    "RS384",
    "EdDSA",
    "ES384",
    "HS256",
    "HS512",
    "ES256",
    "RS256",
    "HS384",
    "ES512",
    "PS256",
    "PS512",
    "RS512",
    "none",
  ],
  request_object_signing_alg_values_supported: [
    "PS384",
    "RS384",
    "EdDSA",
    "ES384",
    "HS256",
    "HS512",
    "ES256",
    "RS256",
    "HS384",
    "ES512",
    "PS256",
    "PS512",
    "RS512",
    "none",
  ],
  response_modes_supported: [
    "query",
    "fragment",
    "form_post",
    "query.jwt",
    "fragment.jwt",
    "form_post.jwt",
    "jwt",
  ],
  registration_endpoint:
    "https://auth.example.com/realms/demo/clients-registrations/openid-connect",
  token_endpoint_auth_methods_supported: [
    "private_key_jwt",
    "client_secret_basic",
    "client_secret_post",
    "tls_client_auth",
    "client_secret_jwt",
  ],
  token_endpoint_auth_signing_alg_values_supported: [
    "PS384",
    "RS384",
    "EdDSA",
    "ES384",
    "HS256",
    "HS512",
    "ES256",
    "RS256",
    "HS384",
    "ES512",
    "PS256",
    "PS512",
    "RS512",
  ],
  claims_supported: [
    "aud",
    "sub",
    "iss",
    "auth_time",
    "name",
    "given_name",
    "family_name",
    "preferred_username",
    "email",
    "acr",
  ],
  claim_types_supported: ["normal"],
  claims_parameter_supported: true,
  scopes_supported: [
    "openid",
    "profile",
    "email",
    "roles",
    "web-origins",
    "offline_access",
    "address",
    "phone",
    "microprofile-jwt",
    "acr",
    "basic",
    "organization",
  ],
  request_parameter_supported: true,
  request_uri_parameter_supported: true,
  require_request_uri_registration: true,
  code_challenge_methods_supported: ["plain", "S256"],
  tls_client_certificate_bound_access_tokens: true,
  revocation_endpoint:
    "https://auth.example.com/realms/demo/protocol/openid-connect/revoke",
  revocation_endpoint_auth_methods_supported: [
    "private_key_jwt",
    "client_secret_basic",
    "client_secret_post",
    "tls_client_auth",
    "client_secret_jwt",
  ],
  backchannel_logout_supported: true,
  backchannel_logout_session_supported: true,
  device_authorization_endpoint:
    "https://auth.example.com/realms/demo/protocol/openid-connect/auth/device",
  backchannel_token_delivery_modes_supported: ["poll", "ping"],
  backchannel_authentication_endpoint:
    "https://auth.example.com/realms/demo/protocol/openid-connect/ext/ciba/auth",
  require_pushed_authorization_requests: false,
  pushed_authorization_request_endpoint:
    "https://auth.example.com/realms/demo/protocol/openid-connect/ext/par/request",
  authorization_response_iss_parameter_supported: true,
};
