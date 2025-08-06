import requests
import logging
from typing import Dict, Any, Optional
from app.config import settings
from app.core.styles import get_style_config

logger = logging.getLogger(__name__)

class StableDiffusionService:
    def __init__(self):
        self.base_url = settings.SD_WEBUI_URL
        self.timeout = settings.SD_API_TIMEOUT
    
    async def check_health(self) -> bool:
        """Check if Stable Diffusion WebUI is available."""
        try:
            response = requests.get(f"{self.base_url}/sdapi/v1/options", timeout=10)
            return response.status_code == 200
        except Exception as e:
            logger.error(f"SD health check failed: {e}")
            return False
    
    def build_simple_payload(
        self, 
        prompt: str, 
        style: str, 
        sketch_base64: str,
        negative_prompt: Optional[str] = None,
        width: int = 512,
        height: int = 512
    ) -> Dict[str, Any]:
        """Build a simplified payload for Stable Diffusion API without ControlNet first."""
        style_config = get_style_config(style)
        
        # Build final prompt
        final_prompt = f"{prompt}{style_config['prompt_suffix']}"
        
        # Build negative prompt
        final_negative_prompt = style_config['negative_prompt']
        if negative_prompt:
            final_negative_prompt = f"{negative_prompt}, {final_negative_prompt}"
        
        payload = {
            "prompt": final_prompt,
            "negative_prompt": final_negative_prompt,
            "width": width,
            "height": height,
            "steps": style_config.get("steps", 20),
            "cfg_scale": style_config.get("cfg_scale", 7.0),
            "sampler_name": style_config.get("sampler_name", "Euler a"),
            "batch_size": 1,
            "n_iter": 1,
            "seed": -1,
            "restore_faces": False,
            "tiling": False,
            "do_not_save_samples": True,
            "do_not_save_grid": True,
        }
        
        return payload
    
    def build_controlnet_payload(
        self, 
        prompt: str, 
        style: str, 
        sketch_base64: str,
        negative_prompt: Optional[str] = None,
        width: int = 512,
        height: int = 512
    ) -> Dict[str, Any]:
        """Build payload with ControlNet configuration."""
        style_config = get_style_config(style)
        
        # Build final prompt
        final_prompt = f"{prompt}{style_config['prompt_suffix']}"
        
        # Build negative prompt
        final_negative_prompt = style_config['negative_prompt']
        if negative_prompt:
            final_negative_prompt = f"{negative_prompt}, {final_negative_prompt}"
        
        # ControlNet configuration - simplified
        controlnet_args = {
            "input_image": sketch_base64,
            "model": "control_v11p_sd15_canny [d14c016b]",  # Common ControlNet model
            "module": "canny",
            "weight": style_config.get("controlnet_weight", 1.0),
            "guidance_start": 0.0,
            "guidance_end": 1.0,
            "control_mode": 0,  # Balanced
            "resize_mode": 1,   # Crop and Resize
            "pixel_perfect": False,
            "threshold_a": 100,
            "threshold_b": 200,
            "enabled": True
        }
        
        payload = {
            "prompt": final_prompt,
            "negative_prompt": final_negative_prompt,
            "width": width,
            "height": height,
            "steps": style_config.get("steps", 20),
            "cfg_scale": style_config.get("cfg_scale", 7.0),
            "sampler_name": style_config.get("sampler_name", "Euler a"),
            "batch_size": 1,
            "n_iter": 1,
            "seed": -1,
            "restore_faces": False,
            "tiling": False,
            "do_not_save_samples": True,
            "do_not_save_grid": True,
            "alwayson_scripts": {
                "controlnet": {
                    "args": [controlnet_args]
                }
            }
        }
        
        return payload
    
    async def generate_image_simple(
        self, 
        prompt: str, 
        style: str,
        negative_prompt: Optional[str] = None,
        width: int = 512,
        height: int = 512
    ) -> Dict[str, Any]:
        """Generate image without ControlNet for testing."""
        try:
            payload = self.build_simple_payload(
                prompt, style, "", negative_prompt, width, height
            )
            
            logger.info(f"Generating simple image with prompt: {prompt[:50]}...")
            logger.info(f"Payload: {payload}")
            
            response = requests.post(
                f"{self.base_url}/sdapi/v1/txt2img",
                json=payload,
                timeout=self.timeout
            )
            
            logger.info(f"Response status: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"SD API error: {response.status_code} - {response.text}")
                raise Exception(f"Stable Diffusion API error: {response.status_code} - {response.text}")
            
            result = response.json()
            logger.info(f"SD Response keys: {result.keys()}")
            
            if not result.get("images"):
                logger.error(f"No images in response: {result}")
                raise Exception("No images generated")
            
            return {
                "success": True,
                "image_data": result["images"][0],
                "generation_info": {
                    "prompt": payload["prompt"],
                    "negative_prompt": payload["negative_prompt"],
                    "style": style,
                    "steps": payload["steps"],
                    "cfg_scale": payload["cfg_scale"],
                    "sampler": payload["sampler_name"],
                    "width": width,
                    "height": height
                }
            }
            
        except requests.exceptions.Timeout:
            logger.error("SD API timeout")
            raise Exception("Image generation timed out. Please try again.")
        
        except requests.exceptions.ConnectionError:
            logger.error("SD API connection error")
            raise Exception("Cannot connect to Stable Diffusion. Please ensure it's running on http://127.0.0.1:7860")
        
        except Exception as e:
            logger.error(f"SD generation error: {e}")
            raise Exception(f"Image generation failed: {str(e)}")
    
    async def generate_image(
        self, 
        prompt: str, 
        style: str, 
        sketch_base64: str,
        negative_prompt: Optional[str] = None,
        width: int = 512,
        height: int = 512
    ) -> Dict[str, Any]:
        """Generate image with ControlNet - fallback to simple if ControlNet fails."""
        try:
            # First try with ControlNet
            payload = self.build_controlnet_payload(
                prompt, style, sketch_base64, negative_prompt, width, height
            )
            
            logger.info(f"Generating image with ControlNet for prompt: {prompt[:50]}...")
            
            response = requests.post(
                f"{self.base_url}/sdapi/v1/txt2img",
                json=payload,
                timeout=self.timeout
            )
            
            logger.info(f"ControlNet response status: {response.status_code}")
            
            if response.status_code != 200:
                logger.warning(f"ControlNet failed, trying without: {response.status_code} - {response.text}")
                # Fallback to simple generation without ControlNet
                return await self.generate_image_simple(prompt, style, negative_prompt, width, height)
            
            result = response.json()
            
            if not result.get("images"):
                logger.warning("ControlNet returned no images, trying simple generation")
                return await self.generate_image_simple(prompt, style, negative_prompt, width, height)
            
            return {
                "success": True,
                "image_data": result["images"][0],
                "generation_info": {
                    "prompt": payload["prompt"],
                    "negative_prompt": payload["negative_prompt"],
                    "style": style,
                    "steps": payload["steps"],
                    "cfg_scale": payload["cfg_scale"],
                    "sampler": payload["sampler_name"],
                    "controlnet_used": True,
                    "width": width,
                    "height": height
                }
            }
            
        except Exception as e:
            logger.warning(f"ControlNet generation failed: {e}, trying simple generation")
            # Fallback to simple generation
            return await self.generate_image_simple(prompt, style, negative_prompt, width, height)
    
    async def get_available_models(self) -> Dict[str, Any]:
        """Get available models from Stable Diffusion."""
        try:
            response = requests.get(f"{self.base_url}/sdapi/v1/sd-models", timeout=10)
            if response.status_code == 200:
                return {"success": True, "models": response.json()}
            else:
                return {"success": False, "error": "Failed to fetch models"}
        except Exception as e:
            logger.error(f"Error fetching models: {e}")
            return {"success": False, "error": str(e)}
# import requests
# import logging
# from typing import Dict, Any, Optional
# from app.config import settings
# from app.core.styles import get_style_config

# logger = logging.getLogger(__name__)

# class StableDiffusionService:
#     def __init__(self):
#         self.base_url = settings.SD_WEBUI_URL
#         self.timeout = settings.SD_API_TIMEOUT
    
#     async def check_health(self) -> bool:
#         """Check if Stable Diffusion WebUI is available."""
#         try:
#             response = requests.get(f"{self.base_url}/sdapi/v1/options", timeout=10)
#             return response.status_code == 200
#         except Exception as e:
#             logger.error(f"SD health check failed: {e}")
#             return False
    
#     def build_controlnet_config(self, sketch_base64: str, style_config: Dict[str, Any]) -> Dict[str, Any]:
#         """Build ControlNet configuration for sketch conditioning."""
#         return {
#             "input_image": sketch_base64,
#             "model": style_config.get("controlnet_model", "control_sd15_scribble"),  # model name from your SD
#             "module": style_config.get("controlnet_module", "canny"),  # preprocessor
#             "weight": style_config.get("controlnet_weight", 1.0),
#             "guidance_start": 0.0,
#             "guidance_end": 1.0,
#             "pixel_perfect": True,
#             "control_mode": "Balanced",  # MUST be string
#             "resize_mode": 1  # integer → 1 = Scale to Fit (Inner Fit)
#         }

    
#     def build_generation_payload(
#         self, 
#         prompt: str, 
#         style: str, 
#         sketch_base64: str,
#         negative_prompt: Optional[str] = None,
#         width: int = 512,
#         height: int = 512
#     ) -> Dict[str, Any]:
#         """Build the payload for Stable Diffusion API."""
#         style_config = get_style_config(style)
        
#         # Build final prompt
#         final_prompt = f"{prompt}{style_config['prompt_suffix']}"
        
#         # Build negative prompt
#         final_negative_prompt = style_config['negative_prompt']
#         if negative_prompt:
#             final_negative_prompt = f"{negative_prompt}, {final_negative_prompt}"
        
#         # Build ControlNet configuration
#         controlnet_config = self.build_controlnet_config(sketch_base64, style_config)
        
#         payload = {
#             "prompt": final_prompt,
#             "negative_prompt": final_negative_prompt,
#             "width": width,
#             "height": height,
#             "steps": style_config.get("steps", 30),
#             "cfg_scale": style_config.get("cfg_scale", 7.5),
#             "sampler_name": style_config.get("sampler_name", "DPM++ 2M Karras"),
#             "batch_size": 1,
#             "n_iter": 1,
#             "seed": -1,
#             "subseed": -1,
#             "subseed_strength": 0,
#             "seed_resize_from_h": -1,
#             "seed_resize_from_w": -1,
#             "denoising_strength": 0.75,
#             "restore_faces": False,
#             "tiling": False,
#             "do_not_save_samples": True,
#             "do_not_save_grid": True,
#             "eta": 0,
#             "s_churn": 0,
#             "s_tmax": 0,
#             "s_tmin": 0,
#             "s_noise": 1,
#             "alwayson_scripts": {
#                 "controlnet": {
#                     "args": [controlnet_config]
#                 }
#             }
#         }
        
#         return payload
    
#     async def generate_image(
#         self, 
#         prompt: str, 
#         style: str, 
#         sketch_base64: str,
#         negative_prompt: Optional[str] = None,
#         width: int = 512,
#         height: int = 512
#     ) -> Dict[str, Any]:
#         """Generate image using Stable Diffusion with ControlNet."""
#         try:
#             payload = self.build_generation_payload(
#                 prompt, style, sketch_base64, negative_prompt, width, height
#             )
            
#             logger.info(f"Generating image with prompt: {prompt[:50]}...")
            
#             response = requests.post(
#                 f"{self.base_url}/sdapi/v1/txt2img",
#                 json=payload,
#                 timeout=self.timeout
#             )
            
#             if response.status_code != 200:
#                 logger.error(f"SD API error: {response.status_code} - {response.text}")
#                 raise Exception(f"Stable Diffusion API error: {response.status_code}")
            
#             result = response.json()
            
#             if not result.get("images"):
#                 raise Exception("No images generated")
            
#             return {
#                 "success": True,
#                 "image_data": result["images"][0],  # Base64 encoded image
#                 "generation_info": {
#                     "prompt": payload["prompt"],
#                     "negative_prompt": payload["negative_prompt"],
#                     "style": style,
#                     "steps": payload["steps"],
#                     "cfg_scale": payload["cfg_scale"],
#                     "sampler": payload["sampler_name"],
#                     "seed": result.get("info", {}).get("seed"),
#                     "width": width,
#                     "height": height
#                 }
#             }
            
#         except requests.exceptions.Timeout:
#             logger.error("SD API timeout")
#             raise Exception("Image generation timed out. Please try again.")
        
#         except requests.exceptions.ConnectionError:
#             logger.error("SD API connection error")
#             raise Exception("Cannot connect to Stable Diffusion. Please ensure it's running.")
        
#         except Exception as e:
#             logger.error(f"SD generation error: {e}")
#             raise Exception(f"Image generation failed: {str(e)}")
    
#     async def get_available_models(self) -> Dict[str, Any]:
#         """Get available models from Stable Diffusion."""
#         try:
#             response = requests.get(f"{self.base_url}/sdapi/v1/sd-models", timeout=10)
#             if response.status_code == 200:
#                 return {"success": True, "models": response.json()}
#             else:
#                 return {"success": False, "error": "Failed to fetch models"}
#         except Exception as e:
#             logger.error(f"Error fetching models: {e}")
#             return {"success": False, "error": str(e)}