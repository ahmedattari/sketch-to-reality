from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from enum import Enum

class StyleEnum(str, Enum):
    realistic = "realistic"
    cartoon = "cartoon"
    anime = "anime"
    oil_painting = "oil_painting"
    watercolor = "watercolor"
    digital_art = "digital_art"
    cyberpunk = "cyberpunk"
    fantasy = "fantasy"

class GenerateImageRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000, description="Text prompt for image generation")
    style: StyleEnum = Field(default=StyleEnum.realistic, description="Style for the generated image")
    negative_prompt: Optional[str] = Field(None, max_length=500, description="Negative prompt (optional)")
    width: Optional[int] = Field(512, ge=64, le=2048, description="Image width")
    height: Optional[int] = Field(512, ge=64, le=2048, description="Image height")

class GenerateImageResponse(BaseModel):
    success: bool
    message: str
    image_data: Optional[str] = None  # Base64 encoded image
    generation_info: Optional[Dict[str, Any]] = None

class StyleInfo(BaseModel):
    name: str
    description: str

class StylesResponse(BaseModel):
    styles: Dict[str, StyleInfo]

class HealthResponse(BaseModel):
    status: str
    sd_webui_available: bool
    message: str

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None