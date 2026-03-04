"""Authentication utilities and JWT verification."""
from __future__ import annotations

import os
from typing import Any

import httpx
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

bearer_scheme = HTTPBearer(
    bearerFormat="JWT",
    description="Paste Auth0 access token here.",
)

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN", "").strip()
AUTH0_AUDIENCE = os.getenv("AUTH0_AUDIENCE", "").strip()
AUTH0_ISSUER = f"https://{AUTH0_DOMAIN}/" if AUTH0_DOMAIN else ""
AUTH0_JWKS_URL = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json" if AUTH0_DOMAIN else ""

_jwks_cache: dict[str, Any] | None = None


def _require_auth0_domain() -> None:
    if not AUTH0_DOMAIN:
        raise HTTPException(
            status_code=500,
            detail="AUTH0_DOMAIN is not configured in environment.",
        )


def _get_jwks() -> dict[str, Any]:
    global _jwks_cache

    _require_auth0_domain()
    if _jwks_cache is not None:
        return _jwks_cache

    response = httpx.get(AUTH0_JWKS_URL, timeout=5.0)
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, dict) or "keys" not in payload:
        raise HTTPException(status_code=401, detail="Unable to load Auth0 signing keys.")

    _jwks_cache = payload
    return payload


def _decode_auth0_jwt(token: str) -> dict[str, object]:
    if token.count(".") != 2:
        raise HTTPException(status_code=401, detail="Bearer token is not a JWT.")

    try:
        unverified_header = jwt.get_unverified_header(token)
        kid = str(unverified_header.get("kid") or "")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid bearer token header.")

    if not kid:
        raise HTTPException(status_code=401, detail="Invalid bearer token header.")

    jwks = _get_jwks()
    jwk_key = next((key for key in jwks.get("keys", []) if key.get("kid") == kid), None)
    if not jwk_key:
        raise HTTPException(status_code=401, detail="Unable to match Auth0 signing key.")

    options: dict[str, bool] = {"verify_aud": bool(AUTH0_AUDIENCE)}
    decode_kwargs: dict[str, Any] = {
        "key": jwk_key,
        "algorithms": ["RS256"],
        "issuer": AUTH0_ISSUER,
        "options": options,
    }
    if AUTH0_AUDIENCE:
        decode_kwargs["audience"] = AUTH0_AUDIENCE

    try:
        claims = jwt.decode(token, **decode_kwargs)
    except JWTError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid bearer token: {str(exc)}")

    if not isinstance(claims, dict):
        raise HTTPException(status_code=401, detail="Invalid bearer token claims.")
    return claims


def _fetch_auth0_userinfo(token: str) -> dict[str, object]:
    _require_auth0_domain()
    response = httpx.get(
        f"https://{AUTH0_DOMAIN}/userinfo",
        headers={"Authorization": f"Bearer {token}"},
        timeout=5.0,
    )
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid bearer token.")

    payload = response.json()
    if not isinstance(payload, dict):
        raise HTTPException(status_code=401, detail="Invalid bearer token claims.")
    return payload


def get_current_token_claims(
    credentials: HTTPAuthorizationCredentials | None = Security(bearer_scheme),
) -> dict[str, object]:
    if not credentials:
        raise HTTPException(status_code=401, detail="Authorization header is required.")

    if credentials.scheme.lower() != "bearer" or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Bearer token is required.")

    token = credentials.credentials
    try:
        return _decode_auth0_jwt(token)
    except HTTPException:
        return _fetch_auth0_userinfo(token)


def get_current_user_id(claims: dict[str, object]) -> str:
    user_id = str(claims.get("sub") or claims.get("user_id") or "").strip()
    if not user_id:
        raise HTTPException(status_code=401, detail="Token does not include user identifier.")
    return user_id
