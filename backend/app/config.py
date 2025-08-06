import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Stable Diffusion WebUI Configuration
    SD_WEBUI_URL: str = os.getenv("SD_WEBUI_URL", "http://127.0.0.1:7860")
    SD_API_TIMEOUT: int = int(os.getenv("SD_API_TIMEOUT", "300"))
    
    # FastAPI Configuration
    API_HOST: str = os.getenv("API_HOST", "localhost")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # CORS Configuration
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:8080")
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:3000",  # In case you switch to default React port
    ]
    
    # File Upload Configuration
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB
    ALLOWED_EXTENSIONS: List[str] = os.getenv("ALLOWED_EXTENSIONS", "jpg,jpeg,png,bmp,webp").split(",")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    
    # API Configuration
    API_PREFIX: str = "/api"
    
    def __init__(self):
        # Create upload directory if it doesn't exist
        os.makedirs(self.UPLOAD_DIR, exist_ok=True)

settings = Settings()