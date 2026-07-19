from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token
from app.dependencies import get_current_user, get_user_service
from app.models.user import User
from app.schemas.user import (
    TokenResponse,
    UserRegisterRequest,
    UserResponse,
)
from app.services.user_service import UserService

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    request: UserRegisterRequest,
    db: Session = Depends(get_db),
    user_service: UserService = Depends(get_user_service),
):
    user = user_service.register(
        db=db,
        username=request.username,
        email=request.email,
        password=request.password,
    )

    db.commit()
    db.refresh(user)

    return user


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
    user_service: UserService = Depends(get_user_service),
):
    user = user_service.authenticate(
        db=db,
        username=form_data.username,
        password=form_data.password,
    )

    access_token = create_access_token({"sub": str(user.id)})

    return TokenResponse(access_token=access_token)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
)
def me(current_user: User = Depends(get_current_user)):
    return current_user
