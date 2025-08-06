from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from fastapi.responses import JSONResponse
import logging
from typing import Optional
import traceback

from app.models.schemas import (
    GenerateImageResponse, 
    StylesResponse, 
    HealthResponse, 
    ErrorResponse,
    StyleEnum
)
from app.services.sd_service import StableDiffusionService
from app.services.image_service import ImageService
from app.core.styles import get_available_styles
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize services
sd_service = StableDiffusionService()
image_service = ImageService()

@router.post("/generate-image", response_model=GenerateImageResponse)
async def generate_image(
    sketch: UploadFile = File(..., description="Sketch image file"),
    prompt: str = Form(..., min_length=1, max_length=1000, description="Text prompt"),
    style: StyleEnum = Form(default=StyleEnum.realistic, description="Art style"),
    negative_prompt: Optional[str] = Form(None, max_length=500, description="Negative prompt"),
    width: Optional[int] = Form(512, ge=64, le=2048, description="Image width"),
    height: Optional[int] = Form(512, ge=64, le=2048, description="Image height")
):
    """Generate an image from sketch using Stable Diffusion with ControlNet."""
    try:
        logger.info(f"Received request - prompt: {prompt}, style: {style}")
        
        # Check if SD is available first
        sd_available = await sd_service.check_health()
        if not sd_available:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Stable Diffusion WebUI is not available. Please ensure it's running on http://127.0.0.1:7860"
            )
        
        # Validate file type
        if not sketch.content_type or not sketch.content_type.startswith('image/'):
            logger.warning(f"Invalid content type: {sketch.content_type}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image"
            )
        
        # Read and validate file content
        file_content = await sketch.read()
        logger.info(f"File size: {len(file_content)} bytes")
        
        # Check file size
        if not image_service.is_valid_size(file_content, settings.MAX_FILE_SIZE):
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE} bytes"
            )
        
        # Validate image
        if not image_service.validate_image(file_content):
            logger.warning("Image validation failed")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image file"
            )
        
        # Get image info for logging
        img_info = image_service.get_image_info(file_content)
        logger.info(f"Processing image: {img_info}")
        
        # Preprocess sketch for ControlNet
        sketch_base64 = image_service.preprocess_sketch(file_content)
        logger.info(f"Sketch preprocessed, base64 length: {len(sketch_base64)}")
        
        # Generate image using Stable Diffusion
        result = await sd_service.generate_image(
            prompt=prompt,
            style=style.value,
            sketch_base64=sketch_base64,
            negative_prompt=negative_prompt,
            width=width,
            height=height
        )
        
        logger.info(f"Image generated successfully for prompt: {prompt[:50]}...")
        
        return GenerateImageResponse(
            success=True,
            message="Image generated successfully",
            image_data=result["image_data"],
            generation_info=result["generation_info"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error generating image: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate image: {str(e)}"
        )

# Test endpoint without file upload
@router.post("/test-generate")
async def test_generate(
    prompt: str = Form(..., description="Test prompt"),
    style: StyleEnum = Form(default=StyleEnum.realistic, description="Art style")
):
    """Test image generation without sketch upload."""
    try:
        logger.info(f"Test generation - prompt: {prompt}, style: {style}")
        
        result = await sd_service.generate_image_simple(
            prompt=prompt,
            style=style.value
        )
        
        return GenerateImageResponse(
            success=True,
            message="Test image generated successfully",
            image_data=result["image_data"],
            generation_info=result["generation_info"]
        )
        
    except Exception as e:
        logger.error(f"Test generation error: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Test generation failed: {str(e)}"
        )

@router.get("/styles", response_model=StylesResponse)
async def get_styles():
    """Get available art styles."""
    try:
        styles = get_available_styles()
        return StylesResponse(styles=styles)
    except Exception as e:
        logger.error(f"Error fetching styles: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch styles"
        )

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check API and Stable Diffusion WebUI health."""
    try:
        sd_available = await sd_service.check_health()
        
        if sd_available:
            return HealthResponse(
                status="healthy",
                sd_webui_available=True,
                message="All services are running"
            )
        else:
            return HealthResponse(
                status="degraded",
                sd_webui_available=False,
                message="Stable Diffusion WebUI is not available"
            )
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return HealthResponse(
            status="unhealthy",
            sd_webui_available=False,
            message=f"Health check failed: {str(e)}"
        )

@router.get("/models")
async def get_models():
    """Get available Stable Diffusion models."""
    try:
        models = await sd_service.get_available_models()
        return models
    except Exception as e:
        logger.error(f"Error fetching models: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch models"
        )

# from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
# from fastapi.responses import JSONResponse
# import logging
# from typing import Optional

# from app.models.schemas import (
#     GenerateImageResponse, 
#     StylesResponse, 
#     HealthResponse, 
#     ErrorResponse,
#     StyleEnum
# )
# from app.services.sd_service import StableDiffusionService
# from app.services.image_service import ImageService
# from app.core.styles import get_available_styles
# from app.config import settings

# logger = logging.getLogger(__name__)
# router = APIRouter()

# # Initialize services
# sd_service = StableDiffusionService()
# image_service = ImageService()

# @router.post("/generate-image", response_model=GenerateImageResponse)
# async def generate_image(
#     sketch: UploadFile = File(..., description="Sketch image file"),
#     prompt: str = Form(..., min_length=1, max_length=1000, description="Text prompt"),
#     style: StyleEnum = Form(default=StyleEnum.realistic, description="Art style"),
#     negative_prompt: Optional[str] = Form(None, max_length=500, description="Negative prompt"),
#     width: Optional[int] = Form(512, ge=64, le=2048, description="Image width"),
#     height: Optional[int] = Form(512, ge=64, le=2048, description="Image height")
# ):
#     """Generate an image from sketch using Stable Diffusion with ControlNet."""
#     try:
#         # Validate file type
#         if not sketch.content_type or not sketch.content_type.startswith('image/'):
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="File must be an image"
#             )
        
#         # Read and validate file content
#         file_content = await sketch.read()
        
#         # Check file size
#         if not image_service.is_valid_size(file_content, settings.MAX_FILE_SIZE):
#             raise HTTPException(
#                 status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
#                 detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE} bytes"
#             )
        
#         # Validate image
#         if not image_service.validate_image(file_content):
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail="Invalid image file"
#             )
        
#         # Get image info for logging
#         img_info = image_service.get_image_info(file_content)
#         logger.info(f"Processing image: {img_info}")
        
#         # Preprocess sketch for ControlNet
#         sketch_base64 = image_service.preprocess_sketch(file_content)
        
#         # Generate image using Stable Diffusion
#         result = await sd_service.generate_image(
#             prompt=prompt,
#             style=style.value,
#             sketch_base64=sketch_base64,
#             negative_prompt=negative_prompt,
#             width=width,
#             height=height
#         )
        
#         logger.info(f"Image generated successfully for prompt: {prompt[:50]}...")
        
#         return GenerateImageResponse(
#             success=True,
#             message="Image generated successfully",
#             image_data=result["image_data"],
#             generation_info=result["generation_info"]
#         )
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error generating image: {e}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Failed to generate image: {str(e)}"
#         )

# @router.get("/styles", response_model=StylesResponse)
# async def get_styles():
#     """Get available art styles."""
#     try:
#         styles = get_available_styles()
#         return StylesResponse(styles=styles)
#     except Exception as e:
#         logger.error(f"Error fetching styles: {e}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Failed to fetch styles"
#         )

# @router.get("/health", response_model=HealthResponse)
# async def health_check():
#     """Check API and Stable Diffusion WebUI health."""
#     try:
#         sd_available = await sd_service.check_health()
        
#         if sd_available:
#             return HealthResponse(
#                 status="healthy",
#                 sd_webui_available=True,
#                 message="All services are running"
#             )
#         else:
#             return HealthResponse(
#                 status="degraded",
#                 sd_webui_available=False,
#                 message="Stable Diffusion WebUI is not available"
#             )
#     except Exception as e:
#         logger.error(f"Health check error: {e}")
#         return HealthResponse(
#             status="unhealthy",
#             sd_webui_available=False,
#             message=f"Health check failed: {str(e)}"
#         )

# @router.get("/models")
# async def get_models():
#     """Get available Stable Diffusion models."""
#     try:
#         models = await sd_service.get_available_models()
#         return models
#     except Exception as e:
#         logger.error(f"Error fetching models: {e}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Failed to fetch models"
#         )

# # Error handlers
# # @router.exception_handler(HTTPException)
# # async def http_exception_handler(request, exc):
# #     return JSONResponse(
# #         status_code=exc.status_code,
# #         content=ErrorResponse(error=exc.detail).dict()
# #     )

# # @router.exception_handler(Exception)
# # async def general_exception_handler(request, exc):
# #     logger.error(f"Unhandled exception: {exc}")
# #     return JSONResponse(
# #         status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
# #         content=ErrorResponse(error="Internal server error", detail=str(exc)).dict()
# #     )