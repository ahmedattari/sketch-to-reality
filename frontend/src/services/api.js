const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiService {
  async generateImage(sketch, prompt, style, negativePrompt = '', width = 512, height = 512) {
    const formData = new FormData();
    formData.append('sketch', sketch);
    formData.append('prompt', prompt);
    formData.append('style', style);
    if (negativePrompt) formData.append('negative_prompt', negativePrompt);
    formData.append('width', width.toString());
    formData.append('height', height.toString());

    const response = await fetch(`${API_BASE_URL}/generate-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async getStyles() {
    const response = await fetch(`${API_BASE_URL}/styles`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  async checkHealth() {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  async testGenerate(prompt, style) {
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('style', style);

    const response = await fetch(`${API_BASE_URL}/test-generate`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

export default new ApiService();