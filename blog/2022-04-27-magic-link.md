---
slug: magic-link
title: Magic Links
author: Phase Two
tags: [open_source, release, keycloak, phase_two]
---

Today we're making two announcements: A new, highly-requested feature, and the open sourcing of the extension at the same time. We've received a lot of requests from customers to implement "magic link" login functionality that would allow users to login to an application using a link sent to their email or over some other secure channel. 

To that end, we've implemented two pathways for creating a magic link. One can be configured in the Authentication section of the admin UI by duplicating the Browser flow, and replacing the normal Username/Password/OTP forms with the Magic Link execution type
![Install Magic Link Authenticator in Browser Flow](https://github.com/p2-inc/keycloak-magic-link/raw/main/docs/assets/magic-authenticator.png)
This mechanism inserts a authenticator in the login flow that intercepts the email address and sends the magic link in an email to to the user.

We've also implemented a web service that allows you to create a magic link without necessarily sending an email. This will allow you to send the link through another channel. Specification for the new endpoint can be found in the [Magic Link API Documentation](/api/create-magic-link).

Both methods have the option of forcing the creation of a new user when an unknown email address is used. This allows a combination login/registration flow that combines an email verification. We think this really nails reducing friction in a new user flow.

We're open sourcing the Keycloak extensionsso that the broad Keycloak community can benefit right away. We are doing this in line with our committment to keeping our core extensions [open source](/docs/introduction/open-source). We hope you find these extensions valuable, and we look forward to feedback and participation from both our customers and the wider Keycloak community. 

The extension is available on GitHub https://github.com/p2-inc/keycloak-magic-link


