---
id: allow-deny-lists
title: Allow/Deny Lists
---

This feature will be available to Phase Two customers in the near future.

It will allow one to set allowed IPs for specific endpoints:

- API endpoints: these are used by users to get access tokens, refresh tokens, etc.
- Admin API and Admin Console: these are used by administrators to manage the Keycloak instance.

This will help to secure your Keycloak instance by allowing only specific IPs to access these endpoints, while denying access from all other IPs.
