---
title: "Keycloak SAML Identity Provider Idp-initiated flow with Okta"
slug: keycloak-saml-identity-provider-idp-initiated-flow-with-okta
date: 2025-02-25
author: Phase Two
tags: [phase_two, open_source, okta, authentication, authorization, keycloak, sso, idp-initiated]
---

### Idp-initiated flow

When using SAML for setting up an Identity Provider we have two options: SP-initiated and IDP-initiated. Most users know the SP-initiated flow which is simple to configure and requires just some metadata exchange.
The IDP-initiated it is less intuitive and requires an extra step which is not very obvious to most of the users. The purpose of these blog is to explain the steps required in order to achieve the IDP initiated flow.

Some basic knowledge of SAML 2.0 and Keycloak is required in order to be able to follow the instructions.
 
### Components

There components involved in this flow are the following:

**Identity provider:**
We can choose any identity provider that support SAML 2.0. The flow will start by accessing the Identity provider dashboard. The user is prompted for authentication, and once done the user can request a service.

**SAML 2.0 Identity provider:**
Keycloak SAML 2.0 Identity provider which will consume the SAMLResponse from the Identity Provider and is responsible for operations such as provisioning, signature verification, decryption etc. In terms of Keycloak this is the identity brokering.

**Keycloak realm client**
It's main purpose is to maintain the authenticated user session in Keycloak. It will generate a new SAML response which is meant for the Service Provider

**Service provider**
The application which we are trying to access. Once the user is authenticated in Keycloak a new SAMLResponse is issued which will be consumed by the Service Provider.

### Setup example

For the purpose of making the setup easier a full example will be provided. The setup will use Okta as a Identity provider:

**Okta:**

Login in your Okta tenant and configure a new application. You will need to specify two things:\

Single sign-on URL: http://localhost:8080/realms/test-realm/broker/okta-broker/endpoint/clients/okta-client \
Audience URI: http://localhost:8080/realms/test-realm \

![Okta Application Setup](/static/blog/saml/idp-init/okta-application-setup.png)

As we can see the identity provider redirect-url is different from the one we see in the keycloak console. According to the documentation  [IDP Initiated Login](https://www.keycloak.org/docs/latest/server_admin/#idp-initiated-login), the path `{brokerRedirectUrl}/clients/okta-client` specifies the client which will maintain the service provider session.

**SAML 2.0 Identity provider:**

The SAML identity provider (e.q: ```okta-broker```) from the above example can be created by importing the metadata from the application you just created in Okta. We need to ensure the alias remains: ```okta-broker```.

![Identity Provider Setup](/static/blog/saml/idp-init/identity-provider-setup.png)

**Service provider application**

For this we created a simple SpringBoot app which has a ACS endpoint: ```/login/saml2/sso``` with the entityId: ```/saml2/metadata``` . Source code can be found here: [SpringBoot SAML application](https://github.com/p2-inc/examples/saml2/idp-initiated)

**Keycloak realm client**

We need to create new SAml 2.0 realm client. This can be done by importing the metadata from the Service Provider application. 

![Generic client](/static/blog/saml/idp-init/generic-client.png)

Now we need to return to the documentation: [IDP Initiated Login](https://www.keycloak.org/docs/latest/server_admin/#idp-initiated-login). In order to configure the IDP-initiated flow, a special field needs to be specified ```IDP-Initiated SSO URL```. \
IDP-Initiated SSO URL name: `okta-client` \

The field is part of the `{brokerRedirectUrl}/clients/okta-client` URL. As we can see the value is different from that of the `clientId` of the client we just created.

**Testing**

In order to test this you will need to go to the OKTA end user dashboard and click on the Application we created at the first step. 

![Okta flow start](/static/blog/saml/idp-init/flow-start.png)

A debugging tool I use is SAML Tracer browser extension. If you check the requests from the flow you will see that it contains only SAMLResponse messages. This is a particularity of the IDP-initiated flow.

![Okta SAML response](/static/blog/saml/idp-init/okta-saml-response.png) ![Client SAML response](/static/blog/saml/idp-init/client-saml-response.png)
