import requests
import base64
def call_webui(prompt, style, image_b64):
    full_prompt = f"{style}, {prompt}"

    payload = {
        "prompt": full_prompt,
        "init_images": [image_b64],
        "sampler_name": "Euler",
        "steps": 25,
        "cfg_scale": 7,
        "denoising_strength": 0.75,
        "width": 512,
        "height": 512,
        "resize_mode": 0
    }

    try:
        response = requests.post("http://127.0.0.1:7860/sdapi/v1/img2img", json=payload)
        response.raise_for_status()
        r = response.json()

        if "images" not in r or not r["images"]:
            print("❌ WebUI response:", r)
            return {"error": "No image returned from WebUI."}

        r["images"][0] = base64.b64decode(r["images"][0])
        return r

    except Exception as e:
        print("❌ WebUI Error:", e)
        return {"error": str(e)}
