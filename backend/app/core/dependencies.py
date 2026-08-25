import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

from app.core.config import settings

bearer_scheme = HTTPBearer(auto_error=False)

_jwks_client: Optional[PyJWKClient] = None


def get_jwks_client() -> Optional[PyJWKClient]:
    global _jwks_client
    if _jwks_client is None and settings.CLERK_JWKS_URL:
        _jwks_client = PyJWKClient(settings.CLERK_JWKS_URL)
    return _jwks_client


def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> str:
    # If in DEV_MODE or testing without JWKS configured, allow fallback
    if (settings.DEV_MODE or not settings.CLERK_JWKS_URL) and not credentials:
        return settings.DEV_USER_ID

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing or invalid",
        )

    token = credentials.credentials

    # Support dev mock token
    if token.startswith("dev_") or token == "test_token":
        return token

    client = get_jwks_client()
    if not client:
        # If no JWKS URL configured in dev/testing, extract sub or return default
        try:
            unverified = jwt.decode(token, options={"verify_signature": False})
            return unverified.get("sub", settings.DEV_USER_ID)
        except Exception:
            return settings.DEV_USER_ID

    try:
        signing_key = client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        return payload["sub"]
    except Exception as e:
        # Fallback to dev mode if enabled
        if settings.DEV_MODE:
            return settings.DEV_USER_ID
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired session: {str(e)}",
        )