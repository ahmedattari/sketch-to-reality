import base64
import requests

# CONFIGURATION
API_URL = "http://127.0.0.1:7860/sdapi/v1/controlnet/txt2img"

# Load sketch image as base64
def encode_image(img_path):
    with open(img_path, "rb") as f:
        return base64.b64encode(f.read()).decode()

# Example
image_path = "sketch.png"  # replace with your sketch path
sketch_b64 = encode_image(image_path)

payload = {
    "prompt": "A cute fluffy bird sitting on a tree branch in Pixar style <lora:pixar_style:0.8>",
    "negative_prompt": "blurry, low quality, distorted",
    "steps": 25,
    "width": 512,
    "height": 512,
    "cfg_scale": 7,
    "sampler_name": "DPM++ 2M",
    "controlnet_units": [
        {
            "input_image": sketch_b64,
            "module": "scribble",
            "model": "control_sd15_scribble [fef5e48e]",  # your model hash may differ
            "weight": 1.0,
            "resize_mode": "Scale to Fit (Inner Fit)",
        }
    ]
}

# Send to WebUI
response = requests.post(API_URL, json=payload)
result = response.json()

# Decode result image
output_image = base64.b64decode(result['images'][0])
with open("output.png", "wb") as f:
    f.write(output_image)

print("✅ Output saved as output.png")
