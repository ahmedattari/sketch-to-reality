export const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

export const generateWithControlNet = async ({ imageFile, prompt, stylePrompt }) => {
  const base64Image = await toBase64(imageFile);

  const payload = {
    prompt: `${stylePrompt}, ${prompt}`,
    negative_prompt: "",
    init_images: [base64Image],
    width: 512,
    height: 512,
    cfg_scale: 7,
    steps: 20,
    sampler_index: "DPM++ 2M",
    alwayson_scripts: {
      controlnet: {
        args: [
          {
            input_image: base64Image,
            module: "none",
            model: "control_sd15_canny",
            weight: 1.0,
            resize_mode: "Scale to Fit (Inner Fit)",
            lowvram: false,
            guidance_start: 0.0,
            guidance_end: 1.0,
            control_mode: "Balanced",
            pixel_perfect: true,
          },
        ],
      },
    },
  };

  const res = await fetch("http://127.0.0.1:7860/sdapi/v1/img2img", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("🚨 SD API Error:", errorText);
    throw new Error(`Backend error: ${res.status}\n${errorText}`);
  }

  const result = await res.json();
  if (result.images?.length > 0) {
    return `data:image/png;base64,${result.images[0]}`;
  }

  throw new Error("No image returned from backend.");
};
