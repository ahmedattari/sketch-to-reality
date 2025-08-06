from typing import Dict, Any

# Style configurations for different art styles
STYLES: Dict[str, Dict[str, Any]] = {
    "realistic": {
        "name": "Realistic",
        "description": "Photorealistic, detailed, high quality",
        "prompt_suffix": ", photorealistic, high quality, detailed, 8k resolution, professional photography",
        "negative_prompt": "cartoon, anime, drawing, sketch, painting, illustration, low quality, blurry",
        "sampler_name": "DPM++ 2M Karras",
        "steps": 30,
        "cfg_scale": 7.5,
        "controlnet_weight": 1.0
    },
    "cartoon": {
        "name": "Cartoon",
        "description": "Animated cartoon style, colorful and vibrant",
        "prompt_suffix": ", cartoon style, animated, colorful, cel shading, Disney style",
        "negative_prompt": "photorealistic, real photo, dark, gritty",
        "sampler_name": "Euler a",
        "steps": 25,
        "cfg_scale": 8.0,
        "controlnet_weight": 0.9
    },
    "anime": {
        "name": "Anime",
        "description": "Japanese anime/manga style",
        "prompt_suffix": ", anime style, manga, cel shading, vibrant colors, detailed",
        "negative_prompt": "realistic, photo, western cartoon, low quality",
        "sampler_name": "DPM++ SDE Karras",
        "steps": 28,
        "cfg_scale": 8.5,
        "controlnet_weight": 0.9
    },
    "oil_painting": {
        "name": "Oil Painting",
        "description": "Classical oil painting style",
        "prompt_suffix": ", oil painting, classical art, painted, artistic, brushstrokes",
        "negative_prompt": "photo, cartoon, anime, digital art, low quality",
        "sampler_name": "DPM++ 2M Karras",
        "steps": 35,
        "cfg_scale": 7.0,
        "controlnet_weight": 0.8
    },
    "watercolor": {
        "name": "Watercolor",
        "description": "Soft watercolor painting style",
        "prompt_suffix": ", watercolor painting, soft colors, artistic, painted, delicate",
        "negative_prompt": "photo, harsh lines, digital art, cartoon",
        "sampler_name": "Euler a",
        "steps": 25,
        "cfg_scale": 6.5,
        "controlnet_weight": 0.7
    },
    "digital_art": {
        "name": "Digital Art",
        "description": "Modern digital artwork style",
        "prompt_suffix": ", digital art, concept art, artstation, detailed, high quality",
        "negative_prompt": "photo, sketch, low quality, blurry",
        "sampler_name": "DPM++ 2M Karras",
        "steps": 30,
        "cfg_scale": 7.5,
        "controlnet_weight": 0.9
    },
    "cyberpunk": {
        "name": "Cyberpunk",
        "description": "Futuristic cyberpunk aesthetic",
        "prompt_suffix": ", cyberpunk, neon lights, futuristic, sci-fi, detailed, high tech",
        "negative_prompt": "medieval, vintage, low tech, low quality",
        "sampler_name": "DPM++ SDE Karras",
        "steps": 32,
        "cfg_scale": 8.0,
        "controlnet_weight": 1.0
    },
    "fantasy": {
        "name": "Fantasy",
        "description": "Magical fantasy art style",
        "prompt_suffix": ", fantasy art, magical, ethereal, detailed, enchanted",
        "negative_prompt": "modern, realistic, low quality, mundane",
        "sampler_name": "DPM++ 2M Karras",
        "steps": 30,
        "cfg_scale": 7.5,
        "controlnet_weight": 0.9
    }
}

def get_style_config(style_name: str) -> Dict[str, Any]:
    """Get configuration for a specific style."""
    return STYLES.get(style_name, STYLES["realistic"])

def get_available_styles() -> Dict[str, Dict[str, str]]:
    """Get list of available styles with their names and descriptions."""
    return {
        key: {
            "name": config["name"],
            "description": config["description"]
        }
        for key, config in STYLES.items()
    }