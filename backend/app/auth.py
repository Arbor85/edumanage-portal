"""
Auth0 Authentication Routes

Handles secure backend token exchange with Auth0.
This prevents exposing client secrets to the frontend.
"""

import os
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class Auth0Config:
    """Auth0 configuration from environment variables"""
    
    def __init__(self):
        self.domain = os.getenv("AUTH0_DOMAIN")
        self.client_id = os.getenv("AUTH0_CLIENT_ID")
        self.client_secret = os.getenv("AUTH0_CLIENT_SECRET")
        self.callback_url = os.getenv("AUTH0_CALLBACK_URL", "http://localhost:5173/callback")
    
    def validate(self) -> None:
        """Validate that all required Auth0 variables are set"""
        missing = []
        if not self.domain:
            missing.append("AUTH0_DOMAIN")
        if not self.client_id:
            missing.append("AUTH0_CLIENT_ID")
        if not self.client_secret:
            missing.append("AUTH0_CLIENT_SECRET")
        
        if missing:
            raise RuntimeError(
                f"Missing Auth0 environment variables: {', '.join(missing)}. "
                "Set these in your .env file."
            )


auth0_config = Auth0Config()


@router.post("/token")
async def exchange_token(request: dict[str, Any]) -> dict[str, Any]:
    """
    Exchange Auth0 authorization code for access token.
    
    This endpoint should be called by the frontend with the authorization code
    received from Auth0's callback. The backend exchanges it for tokens securely
    without exposing the client secret to the frontend.
    
    Args:
        request: JSON body containing:
            - code: Authorization code from Auth0
    
    Returns:
        JSON response with:
            - access_token: JWT access token for API calls
            - token_type: Token type (usually "Bearer")
            - expires_in: Token expiration time in seconds
            - id_token: ID token with user info (if requested)
    
    Raises:
        HTTPException: 400 if code exchange fails or parameters are invalid
        HTTPException: 500 if Auth0 is unavailable
    """
    
    try:
        auth0_config.validate()
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    code = request.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code is required")
    
    # Use redirect_uri from request, fallback to config default
    redirect_uri = request.get("redirect_uri", auth0_config.callback_url)
    
    try:
        # Exchange authorization code for tokens via Auth0
        token_response = await _exchange_auth0_code(code, redirect_uri)
        return token_response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Token exchange failed")


async def _exchange_auth0_code(code: str, redirect_uri: str) -> dict[str, Any]:
    """
    Exchange authorization code with Auth0's token endpoint.
    
    Args:
        code: Authorization code from Auth0
        redirect_uri: The redirect URI that was used in the authorization request
    
    Returns:
        Token response from Auth0
    
    Raises:
        ValueError: If token exchange fails
    """
    
    token_url = f"https://{auth0_config.domain}/oauth/token"
    
    payload = {
        "client_id": auth0_config.client_id,
        "client_secret": auth0_config.client_secret,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": redirect_uri,
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            token_url,
            json=payload,
            headers={"Content-Type": "application/json"},
        )
    
    if response.status_code != 200:
        error_data = response.json()
        error_msg = error_data.get("error_description", error_data.get("error", "Unknown error"))
        raise ValueError(f"Auth0 token exchange failed: {error_msg}")
    
    return response.json()


@router.get("/health")
async def auth_health() -> dict[str, str]:
    """
    Health check for authentication service.
    
    Validates that required Auth0 environment variables are configured.
    """
    
    try:
        auth0_config.validate()
        return {
            "status": "healthy",
            "auth0_domain": auth0_config.domain,
            "message": "Auth0 service is configured and ready"
        }
    except RuntimeError as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }
