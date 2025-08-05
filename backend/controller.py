import base64
from backend.webui_api import call_webui

async def generate_image(prompt, style, file):
    image_bytes = await file.read()
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    response = call_webui(prompt, style, image_b64)

    if "images" not in response:
        raise Exception("No image returned from WebUI.")

    return {
        "image": response["images"][0]  # base64 string returned directly by WebUI
    }
