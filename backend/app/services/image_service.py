import base64
import io
from PIL import Image
from typing import Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class ImageService:
    @staticmethod
    def validate_image(file_content: bytes) -> bool:
        """Validate if the uploaded file is a valid image."""
        try:
            with Image.open(io.BytesIO(file_content)) as img:
                img.verify()
            return True
        except Exception as e:
            logger.error(f"Image validation failed: {e}")
            return False
    
    @staticmethod
    def convert_to_base64(file_content: bytes) -> str:
        """Convert image bytes to base64 string."""
        return base64.b64encode(file_content).decode('utf-8')
    
    @staticmethod
    def resize_image(file_content: bytes, max_size: Tuple[int, int] = (1024, 1024)) -> bytes:
        """Resize image if it's larger than max_size while maintaining aspect ratio."""
        try:
            with Image.open(io.BytesIO(file_content)) as img:
                # Convert to RGB if necessary (for RGBA images)
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Resize if needed
                if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
                    img.thumbnail(max_size, Image.Resampling.LANCZOS)
                
                # Convert back to bytes
                output = io.BytesIO()
                img.save(output, format='JPEG', quality=95)
                return output.getvalue()
        except Exception as e:
            logger.error(f"Error resizing image: {e}")
            return file_content
    
    @staticmethod
    def preprocess_sketch(file_content: bytes) -> str:
        """Preprocess sketch for ControlNet (convert to base64)."""
        try:
            # Resize image to reasonable size for processing
            resized_content = ImageService.resize_image(file_content, (512, 512))
            
            # Convert to base64 for SD API
            return ImageService.convert_to_base64(resized_content)
        except Exception as e:
            logger.error(f"Error preprocessing sketch: {e}")
            raise ValueError(f"Failed to preprocess sketch: {e}")
    
    @staticmethod
    def get_image_info(file_content: bytes) -> dict:
        """Get basic information about the uploaded image."""
        try:
            with Image.open(io.BytesIO(file_content)) as img:
                return {
                    "width": img.size[0],
                    "height": img.size[1],
                    "mode": img.mode,
                    "format": img.format
                }
        except Exception as e:
            logger.error(f"Error getting image info: {e}")
            return {}
    
    @staticmethod
    def is_valid_size(file_content: bytes, max_size: int) -> bool:
        """Check if file size is within limits."""
        return len(file_content) <= max_size