from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from backend.controller import generate_image
import traceback

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate")
async def generate(
    prompt: str = Form(...),
    style: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        result = await generate_image(prompt, style, file)
        return result
    except Exception as e:
        print("❌ ERROR:", str(e))
        traceback.print_exc()
        return {"error": str(e)}
