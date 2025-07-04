# Decoding JWTs Structure

<!-- <insert-fig> -->

JSON Web Tokens (JWTs) are compact, URL-safe tokens commonly used in modern authentication and authorization systems, particularly with OAuth2 flows. This guide provides a technical deep-dive into JWT architecture, examining each component and its role in the token's security and functionality.

JWTs are frequently used for authentication, they're technically just base64-encoded JSON containers that can serve various purposes beyond auth. This guide focuses on their authentication use case while explaining the underlying structure.

Let's examine a real JWT example. Here's a freshly generated token with line breaks added for readability (normally JWTs are single-line strings):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI4NWEwMzg2Ny1kY2NmLTQ4ODItYWRkZS0xYTc5YWVlYzUwZGYiLCJleHAiOjE2NDQ4ODQxODUsImlhdCI6MTY0NDg4MDU4NSwiaXNzIjoiYWNtZS5jb20iLCJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJqdGkiOiIzZGQ2NDM0ZC03OWE5LTRkMTUtOThiNS03YjUxZGJiMmNkMzEiLCJhdXRoZW50aWNhdGlvblR5cGUiOiJQQVNTV09SRCIsImVtYWlsIjoiYWRtaW5AcGhhc2V0d28uaW8iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXBwbGljYXRpb25JZCI6Ijg1YTAzODY3LWRjY2YtNDg4Mi1hZGRlLTFhNzlhZWVjNTBkZiIsInJvbGVzIjpbImNlbyJdfQ.8DCV8fVizi3Z1EI7tTxp-kChCVhxEReraDIRSdtCMlg
```

While this appears as random characters, understanding JWT structure reveals the encoded data within. This guide focuses on signed JWTs (also called JWS - JSON Web Signatures), which are the most common type in production systems.

A signed JWT consists of three distinct segments separated by periods (`.`):

1. **Header**: Contains metadata about the token (starts with `eyJhbGc` in our example)
2. **Payload/Body**: Contains the actual data/claims (starts with `eyJhdWQ`)
3. **Signature**: Cryptographic proof of integrity (starts with `dee-K`)

You can decode this JWT interactively at [jwt.io](https://jwt.io/#token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiI4NWEwMzg2Ny1kY2NmLTQ4ODItYWRkZS0xYTc5YWVlYzUwZGYiLCJleHAiOjE2NDQ4ODQxODUsImlhdCI6MTY0NDg4MDU4NSwiaXNzIjoiYWNtZS5jb20iLCJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJqdGkiOiIzZGQ2NDM0ZC03OWE5LTRkMTUtOThiNS03YjUxZGJiMmNkMzEiLCJhdXRoZW50aWNhdGlvblR5cGUiOiJQQVNTV09SRCIsImVtYWlsIjoiYWRtaW5AcGhhc2V0d28uaW8iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXBwbGljYXRpb25JZCI6Ijg1YTAzODY3LWRjY2YtNDg4Mi1hZGRlLTFhNzlhZWVjNTBkZiIsInJvbGVzIjpbImNlbyJdfQ.8DCV8fVizi3Z1EI7tTxp-kChCVhxEReraDIRSdtCMlg) using the secret: `b7e151628aed2a6abf7158809cf4f3c762e7160efc7e218d3f2c3b394d2d6b8f`.

<!-- <insert-fig> -->

Let's break down each component and understand how they work together to create a secure, self-contained token.

## JWT Header: Metadata and Algorithm Configuration

The header segment contains essential metadata that tells the receiving application how to process and validate the JWT. In our example:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

To decode this header, use base64 decoding:

```bash
echo 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' | base64 -d
```

This produces the JSON:

```json
{"alg":"HS256","typ":"JWT"}
```

### Algorithm Specification (`alg`)

The `alg` field specifies the cryptographic algorithm used for signing. `HS256` indicates HMAC-SHA256, a symmetric signing algorithm. Here's the complete algorithm support matrix:

| Algorithm | Full Name | Security Level | Implementation Status |
|-----------|-----------|----------------|----------------------|
| HS256 | HMAC using SHA-256 | Symmetric | Required |
| HS384 | HMAC using SHA-384 | Symmetric | Optional |
| HS512 | HMAC using SHA-512 | Symmetric | Optional |
| RS256 | RSASSA-PKCS1-v1_5 using SHA-256 | Asymmetric | Recommended |
| RS384 | RSASSA-PKCS1-v1_5 using SHA-384 | Asymmetric | Optional |
| RS512 | RSASSA-PKCS1-v1_5 using SHA-512 | Asymmetric | Optional |
| ES256 | ECDSA using P-256 and SHA-256 | Asymmetric | Recommended+ |
| ES384 | ECDSA using P-384 and SHA-384 | Asymmetric | Optional |
| ES512 | ECDSA using P-521 and SHA-512 | Asymmetric | Optional |
| PS256 | RSASSA-PSS using SHA-256 and MGF1 with SHA-256 | Asymmetric | Optional |
| PS384 | RSASSA-PSS using SHA-384 and MGF1 with SHA-384 | Asymmetric | Optional |
| PS512 | RSASSA-PSS using SHA-512 and MGF1 with SHA-512 | Asymmetric | Optional |
| none | No digital signature or MAC performed | None | Optional |

**Security Considerations:**
- **Symmetric algorithms (HS*)**: Require shared secrets, faster but less secure for distributed systems
- **Asymmetric algorithms (RS*, ES*, PS*)**: Use public/private key pairs, more secure for multi-service architectures
- **"none" algorithm**: Should be explicitly disabled in production - allows unsigned tokens

### Type Specification (`typ`)

The `typ` field indicates the token type. `JWT` is standard, but other values exist:
- `at+JWT`: Access token conforming to RFC 9068
- Custom types for specialized use cases

### Key Identifier (`kid`)

The `kid` field is crucial for key management in multi-tenant or key-rotation scenarios:

- **Symmetric keys**: Used to look up the secret in a secure vault
- **Asymmetric keys**: Enables lookup of the correct public key for signature verification

Proper `kid` validation prevents key confusion attacks where attackers manipulate the header to use unexpected keys.

<!-- <insert-fig> -->

## JWT Payload: Claims and Data Storage

The payload contains the actual data transported by the JWT. This is where user information, permissions, and other claims reside. From our example:

```
eyJhdWQiOiI4NWEwMzg2Ny1kY2NmLTQ4ODItYWRkZS0xYTc5YWVlYzUwZGYiLCJleHAiOjE2NDQ4ODQxODUsImlhdCI6MTY0NDg4MDU4NSwiaXNzIjoiYWNtZS5jb20iLCJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJqdGkiOiIzZGQ2NDM0ZC03OWE5LTRkMTUtOThiNS03YjUxZGJiMmNkMzEiLCJhdXRoZW50aWNhdGlvblR5cGUiOiJQQVNTV09SRCIsImVtYWlsIjoiYWRtaW5AcGhhc2V0d28uaW8iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXBwbGljYXRpb25JZCI6Ijg1YTAzODY3LWRjY2YtNDg4Mi1hZGRlLTFhNzlhZWVjNTBkZiIsInJvbGVzIjpbImNlbyJdfQ
```

Decoding reveals the structured data:

```json
{
  "aud": "85a03867-dccf-4882-adde-1a79aeec50df",
  "exp": 1644884185,
  "iat": 1644880585,
  "iss": "acme.com",
  "sub": "00000000-0000-0000-0000-000000000001",
  "jti": "3dd6434d-79a9-4d15-98b5-7b51dbb2cd31",
  "authenticationType": "PASSWORD",
  "email": "admin@phasetwo.io",
  "email_verified": true,
  "applicationId": "85a03867-dccf-4882-adde-1a79aeec50df",
  "roles": [
    "ceo"
  ]
}
```

### Standard Claims (Registered Claims)

These claims have defined meanings per RFC 7519:

- **`iss` (Issuer)**: Identifies the token issuer - validate against known trusted issuers
- **`aud` (Audience)**: Specifies intended recipients - critical for preventing token misuse
- **`sub` (Subject)**: The principal (usually user ID) the token represents
- **`exp` (Expiration Time)**: Unix timestamp when token becomes invalid
- **`iat` (Issued At)**: Unix timestamp when token was created
- **`nbf` (Not Before)**: Unix timestamp before which token is invalid
- **`jti` (JWT ID)**: Unique identifier for the token (useful for revocation tracking)

### Custom Claims

Custom claims allow application-specific data storage. Examples from our token:

- `authenticationType`: Method used for authentication
- `email_verified`: Email verification status
- `roles`: User permissions/roles array
- `applicationId`: Target application identifier

### Critical Claims for Validation

Your JWT validation code must verify these claims:

```javascript
// Example validation logic
const requiredClaims = {
  iss: ['acme.com', 'trusted-issuer.com'], // Valid issuers
  aud: ['my-api-client-id'],               // Valid audiences
  exp: Date.now() / 1000,                  // Not expired
  nbf: Date.now() / 1000                   // Not used before
};
```

**Security Best Practices:**

- Always validate `aud` claim to prevent cross-service token reuse
- Check `exp` and `nbf` against current timestamp
- Verify `iss` against whitelist of trusted issuers
- Implement business logic validation for custom claims

### Claims Security Considerations

**Important**: JWT payloads are base64-encoded, not encrypted. Anyone with the token can decode and read the claims using standard tools:

```bash
echo 'eyJhdWQiOiI4NWEwMzg2Ny1kY2NmLTQ4ODItYWRkZS0xYTc5YWVlYzUwZGYiLCJleHAiOjE2NDQ4ODQxODUsImlhdCI6MTY0NDg4MDU4NSwiaXNzIjoiYWNtZS5jb20iLCJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJqdGkiOiIzZGQ2NDM0ZC03OWE5LTRkMTUtOThiNS03YjUxZGJiMmNkMzEiLCJhdXRoZW50aWNhdGlvblR5cGUiOiJQQVNTV09SRCIsImVtYWlsIjoiYWRtaW5AcGhhc2V0d28uaW8iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXBwbGljYXRpb25JZCI6Ijg1YTAzODY3LWRjY2YtNDg4Mi1hZGRlLTFhNzlhZWVjNTBkZiIsInJvbGVzIjpbImNlbyJdfQ' | base64 -d
```

**Never include in JWT payloads:**

- Passwords or API secrets
- Government IDs or SSNs
- Internal database IDs (use opaque identifiers instead)
- Sensitive business logic data

## JWT Signature: Cryptographic Integrity

The signature ensures token integrity and authenticity. It's the cryptographic proof that the token hasn't been tampered with since creation.

### Signature Generation Process

The signature is created through these steps:

1. **Encode header**: Convert header JSON to base64url encoding
2. **Encode payload**: Convert payload JSON to base64url encoding  
3. **Concatenate**: Join with `.` separator: `header.payload`
4. **Sign**: Apply cryptographic algorithm with secret/key
5. **Encode signature**: Convert signature to base64url encoding
6. **Final assembly**: `header.payload.signature`

### Signature Verification

When validating a JWT, the receiver:

1. Extracts header and payload
2. Recreates the signing input string
3. Applies the same cryptographic algorithm
4. Compares the computed signature with the provided signature
5. If they match, the token is authentic and unmodified

### Security Implications

- **Tamper Detection**: Any modification to header or payload invalidates the signature
- **Algorithm Validation**: Always verify the `alg` header matches the expected algorithm
- **Key Management**: Proper key rotation and validation prevents signature forgery
- **Timing Attacks**: Use constant-time comparison for signature validation

## JWT Size Limits and Performance Considerations

While the JWT specification doesn't impose hard limits, practical constraints exist:

### Storage Constraints

| Storage Method | Typical Limit | Considerations |
|----------------|---------------|----------------|
| HTTP Headers | 8KB | Varies by server/proxy configuration |
| Cookies | 4KB | Includes cookie name and metadata |
| URL Parameters | Browser-dependent | Risk of URL length limits |
| Local Storage | 5-10MB | Browser-specific limits |

### Performance Impact Analysis

JWT size directly affects:

- **Signing/Verification Time**: Larger payloads require more cryptographic operations
- **Network Overhead**: Larger tokens increase request/response sizes
- **Memory Usage**: Token storage and processing memory requirements

**Benchmark Results** (50,000 operations each):

**Small JWT (~180 chars payload, 300-600 chars total):**
```
HMAC Sign:   1.64s
HMAC Verify: 2.49s  
RSA Sign:    28.53s
RSA Verify:  3.10s
ECC Sign:    4.27s
ECC Verify:  7.11s
```

**Large JWT (~1800 chars payload, 2400-2700 chars total):**
```
HMAC Sign:   3.38s    (+106%)
HMAC Verify: 4.32s    (+74%)
RSA Sign:    32.88s   (+15%)
RSA Verify:  5.36s    (+73%)
ECC Sign:    6.62s    (+55%)
ECC Verify:  9.26s    (+30%)
```

**Performance Optimization Strategies:**

- Minimize payload size by including only essential claims
- Use short, opaque identifiers instead of descriptive strings
- Implement JWT caching for frequently accessed tokens
- Consider token compression for very large payloads
- Profile your specific use case with realistic token sizes

## Conclusion

Understanding JWT structure is fundamental to implementing secure authentication systems. Each component - header, payload, and signature - plays a critical role in token security and functionality. 

Key takeaways for developers:

- **Header**: Contains algorithm and key information for validation
- **Payload**: Stores claims and data (remember: not encrypted)
- **Signature**: Provides cryptographic integrity and authenticity
- **Size matters**: Balance functionality with performance requirements
- **Security first**: Always validate all claims and use proper key management

Proper JWT implementation requires attention to both the specification details and practical considerations like performance, security, and operational complexity. Use established libraries rather than custom implementations, and always follow security best practices for your specific use case.
