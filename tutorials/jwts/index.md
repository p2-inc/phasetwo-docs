---
id: index
title: JSON Web Tokens (JWT)
description: How JSON Web Tokens work — structure, signing, security best practices, and where they are the wrong tool. Plus a free decoder.
keywords: [jwt, json web token, what is a jwt, jwt structure, jwt security]
---

JSON Web Tokens (JWTs) are a compact, URL-safe means of representing claims to be transferred between two parties. The claims in a JWT are encoded as a JSON object that is used as the payload of a JSON Web Signature (JWS) structure or as the plaintext of a JSON Web Encryption (JWE) structure, enabling the claims to be digitally signed or integrity protected with a Message Authentication Code (MAC) and/or encrypted.

The set of articles here are meant to assist you in understanding JWTs, how they work, and how they can be used effectively in your applications.

:::tip Decode a token now
Need to inspect a token? Try our free [**JWT Decoder**](/tools/jwt-decoder/) — paste any JSON Web Token to see its header, payload, and claims decoded in your browser. Nothing is sent to a server.
:::

## Start here

- **[Decoding a JWT — header, payload, and signature](/tutorials/jwts/decoding-jwt-structure/)** — a field-by-field walkthrough of a real token, what each claim means, and how the signature is produced. Read this first if you have a token in front of you and want to know what is in it.
- **[Benefits and drawbacks of JWTs](/tutorials/jwts/jwt-benefits-drawbacks/)** — where a JWT is the right architectural choice and where a session would serve you better. Stateless validation, the revocation problem, token size, and the alternatives.
- **[JWT security best practices](/tutorials/jwts/jwt-security-best-practices/)** — signing algorithms, storage, transmission, validation, expiry and revocation, and the attack each one closes.

The three build on each other in that order, but each stands alone.
