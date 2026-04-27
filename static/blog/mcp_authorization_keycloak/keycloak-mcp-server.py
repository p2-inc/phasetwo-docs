import os
from typing import Any

import jwt
from jwt import PyJWKClient
from pydantic import AnyHttpUrl

from mcp.server.auth.provider import AccessToken, TokenVerifier
from mcp.server.auth.settings import AuthSettings
from mcp.server.fastmcp import FastMCP

# -------------------------------------------------------------------
# Configuration
# -------------------------------------------------------------------

KEYCLOAK_BASE_URL = os.getenv("KEYCLOAK_BASE_URL", "http://localhost:8080")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "mcp-demo")

# This must match:
# - the VS Code MCP URL
# - the protected resource metadata "resource"
# - the Keycloak audience mapper custom audience
MCP_SERVER_URL = os.getenv("MCP_SERVER_URL", "http://localhost:8000/mcp")

# Kane article/repo pattern
REQUIRED_SCOPE = os.getenv("MCP_REQUIRED_SCOPE", "mcp:run")

KEYCLOAK_ISSUER = f"{KEYCLOAK_BASE_URL}/realms/{KEYCLOAK_REALM}"
KEYCLOAK_JWKS_URI = f"{KEYCLOAK_ISSUER}/protocol/openid-connect/certs"

# -------------------------------------------------------------------
# Shared business logic
# -------------------------------------------------------------------

def add(a: float, b: float) -> float:
    return a + b


def multiply(a: float, b: float) -> float:
    return a * b


def divide(a: float, b: float) -> float:
    if b == 0:
        raise ValueError("Division by zero is not allowed")
    return a / b


# -------------------------------------------------------------------
# Keycloak token verifier
# -------------------------------------------------------------------

class KeycloakTokenVerifier(TokenVerifier):
    def __init__(self, issuer: str, jwks_uri: str, audience: str, required_scope: str):
        self.issuer = issuer
        self.audience = audience
        self.required_scope = required_scope
        self.jwks_client = PyJWKClient(jwks_uri)

    async def verify_token(self, token: str) -> AccessToken | None:
        try:
            signing_key = self.jwks_client.get_signing_key_from_jwt(token)

            claims: dict[str, Any] = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256", "RS384", "RS512", "PS256", "PS384", "PS512"],
                issuer=self.issuer,
                options={
                    "require": ["exp", "iat", "iss"],
                    "verify_aud": False,
                },
            )

            print("TOKEN CLAIMS:", claims)

            if not self._audience_matches(claims):
                print("TOKEN REJECTED: audience mismatch")
                print("EXPECTED AUD:", self.audience)
                print("ACTUAL AUD:", claims.get("aud"))
                return None

            scopes = self._extract_scopes(claims)
            print("TOKEN SCOPES:", scopes)

            if self.required_scope not in scopes:
                print("TOKEN REJECTED: missing required scope")
                print("REQUIRED SCOPE:", self.required_scope)
                return None

            expires_at = claims.get("exp")
            if not isinstance(expires_at, int):
                print("TOKEN REJECTED: exp missing or invalid")
                return None

            client_id = self._extract_client_id(claims)
            print("TOKEN ACCEPTED FOR CLIENT:", client_id)

            return AccessToken(
                token=token,
                client_id=client_id,
                scopes=scopes,
                expires_at=expires_at,
            )

        except Exception as e:
            print("TOKEN REJECTED: exception during verification:", repr(e))
            return None

    def _audience_matches(self, claims: dict[str, Any]) -> bool:
        aud = claims.get("aud")

        if isinstance(aud, str):
            return aud == self.audience

        if isinstance(aud, list):
            return self.audience in aud

        return False

    def _extract_scopes(self, claims: dict[str, Any]) -> list[str]:
        scope_value = claims.get("scope", "")
        if isinstance(scope_value, str) and scope_value.strip():
            return scope_value.strip().split()
        return []

    def _extract_client_id(self, claims: dict[str, Any]) -> str:
        azp = claims.get("azp")
        if isinstance(azp, str) and azp:
            return azp

        client_id = claims.get("client_id")
        if isinstance(client_id, str) and client_id:
            return client_id

        return "unknown-client"


# -------------------------------------------------------------------
# MCP server
# -------------------------------------------------------------------

mcp = FastMCP(
    "Calculator MCP",
    stateless_http=True,
    json_response=True,
    token_verifier=KeycloakTokenVerifier(
        issuer=KEYCLOAK_ISSUER,
        jwks_uri=KEYCLOAK_JWKS_URI,
        audience=MCP_SERVER_URL,
        required_scope=REQUIRED_SCOPE,
    ),
    auth=AuthSettings(
        issuer_url=AnyHttpUrl(KEYCLOAK_ISSUER),
        resource_server_url=AnyHttpUrl(MCP_SERVER_URL),
        required_scopes=[REQUIRED_SCOPE],
    ),
)


@mcp.tool()
def add_numbers(a: float, b: float) -> dict[str, Any]:
    """Add two numbers."""
    return {"operation": "add", "a": a, "b": b, "result": add(a, b)}


@mcp.tool()
def multiply_numbers(a: float, b: float) -> dict[str, Any]:
    """Multiply two numbers."""
    return {"operation": "multiply", "a": a, "b": b, "result": multiply(a, b)}


@mcp.tool()
def divide_numbers(a: float, b: float) -> dict[str, Any]:
    """Divide two numbers."""
    return {"operation": "divide", "a": a, "b": b, "result": divide(a, b)}


if __name__ == "__main__":
    mcp.run(transport="streamable-http")
