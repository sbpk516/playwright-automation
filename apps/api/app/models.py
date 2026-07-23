from typing import Literal
from pydantic import BaseModel, Field


class SignIn(BaseModel):
    email: str
    password: str


class ProfileInput(BaseModel):
    name: str = Field(min_length=1, max_length=24)
    avatar: str
    maturity_limit: int = Field(ge=0, le=18)


class PlanChange(BaseModel):
    plan_id: str


class TitleInput(BaseModel):
    id: str
    name: str = Field(min_length=1, max_length=80)
    synopsis: str = Field(min_length=1, max_length=500)
    type: Literal["movie", "series"]
    genres: list[str]
    maturity_rating: int = Field(ge=0, le=18)
    release_year: int = Field(ge=1900, le=2100)
    media_meta: str
    image: str
    available: bool
    tier: int = Field(ge=1, le=3)
    published: bool = False
    keywords: str = ""


class FaultInput(BaseModel):
    endpoint: str
    mode: Literal["off", "latency", "error", "empty", "malformed", "playback"]
    value: int = 0
