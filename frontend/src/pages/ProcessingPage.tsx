import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Wand2, ArrowLeft, Loader2, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { generateWithControlNet } from "@/api/generateImage";

const ProcessingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string>("");

  const styles = [
    { id: "van-gogh", name: "Van Gogh", description: "Post-impressionist style with swirling brushstrokes" },
    { id: "cartoon", name: "Cartoon", description: "Playful animated style with bold colors" },
    { id: "photorealistic", name: "Photorealistic", description: "Ultra-realistic photographic quality" },
    { id: "cyberpunk", name: "Cyberpunk", description: "Futuristic neon-lit aesthetic" },
    { id: "watercolor", name: "Watercolor", description: "Soft, flowing watercolor painting style" },
    { id: "pencil", name: "Pencil Sketch", description: "Detailed graphite pencil drawing" },
  ];

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (PNG, JPG, etc.)",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);


const handleProcess = async () => {
  if (!selectedFile || !selectedStyle) {
    toast({
      title: "Missing requirements",
      description: "Please upload an image and select a style.",
      variant: "destructive",
    });
    return;
  }

  setIsProcessing(true);
  setResultImage("");

  try {
    // Read image file as base64
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      const base64Image = (reader.result as string).split(",")[1];

      const payload = {
        prompt: `${selectedStyle}, ${prompt}`,
        init_images: [base64Image],
        alwayson_scripts: {
          controlnet: {
            args: [
              {
                input_image: base64Image,
                module: "scribble",
                model: "control_sd15_scribble",
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

      const response = await fetch("http://127.0.0.1:7860/sdapi/v1/img2img", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data?.images?.[0]) {
        setResultImage(`data:image/png;base64,${data.images[0]}`);
        toast({
          title: "Success!",
          description: "Your image has been transformed successfully.",
        });
      } else {
        throw new Error("No image returned from backend.");
      }
    };
  } catch (error) {
    console.error("❌ Error:", error);
    toast({
      title: "Processing failed",
      description: "There was an error processing your image. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsProcessing(false);
  }
};




  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <button
              className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-accent transition-colors"
              onClick={() => navigate("/")}
            >
              {/* <Wand2 className="w-6 h-6 text-primary" /> */}
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Sketch to Reality
              </h1>
            </button>
          </div>
          <ThemeToggle />
        </nav>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Transform Your Sketch</h1>
            <p className="text-lg text-muted-foreground">
              Upload your sketch, choose a style, and watch the magic happen
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              {/* File Upload */}
              <Card className="p-6">
                <Label className="text-lg font-semibold mb-4 block">Upload Your Sketch</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center relative transition-colors ${
                    selectedFile ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full max-h-48 mx-auto rounded-lg shadow-md"
                      />
                      <p className="text-sm text-muted-foreground">{selectedFile?.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-lg font-medium">Drop your image here</p>
                        <p className="text-sm text-muted-foreground">or click to browse</p>
                      </div>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload" className="absolute inset-0 cursor-pointer" />
                </div>
              </Card>

              {/* Prompt */}
              <Card className="p-6">
                <Label htmlFor="prompt" className="text-lg font-semibold mb-4 block">
                  Describe Your Vision (Optional)
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe any specific details, colors, or elements you want to see in the transformed image..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </Card>

              {/* Style Selection */}
              <Card className="p-6">
                <Label className="text-lg font-semibold mb-4 block">Choose Art Style</Label>
                <div className="grid grid-cols-2 gap-3">
                  {styles.map((style) => (
                    <div
                      key={style.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedStyle === style.id
                          ? "border-primary bg-primary/10 shadow-glow/20"
                          : "border-border hover:border-primary/50 hover:bg-accent/50"
                      }`}
                      onClick={() => setSelectedStyle(style.id)}
                    >
                      <h3 className="font-medium mb-1">{style.name}</h3>
                      <p className="text-xs text-muted-foreground">{style.description}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Process Button */}
              <Button
                onClick={handleProcess}
                disabled={!selectedFile || !selectedStyle || isProcessing}
                variant="hero"
                size="lg"
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Transform Image
                  </>
                )}
              </Button>
            </div>

            {/* Result Section */}
            <div className="space-y-6">
              <Card className="p-6">
                <Label className="text-lg font-semibold mb-4 block">Result</Label>
                <div className="rounded-lg border-2 border-dashed border-muted min-h-[400px] flex items-center justify-center">
                  {isProcessing ? (
                    <div className="text-center space-y-4">
                      <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                      <p className="text-lg font-medium">Transforming your image...</p>
                      <p className="text-sm text-muted-foreground">This may take a few moments</p>
                    </div>
                  ) : resultImage ? (
                    <div className="space-y-4 w-full">
                      <img
                        src={resultImage}
                        alt="Transformed result"
                        className="w-full rounded-lg shadow-elegant"
                      />
                      <Button variant="outline" className="w-full">
                        <Download className="w-4 h-4" />
                        Download Result
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <Wand2 className="w-12 h-12 mx-auto text-muted-foreground" />
                      <p className="text-lg font-medium text-muted-foreground">
                        Your transformed image will appear here
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingPage;
