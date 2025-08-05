import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Palette, Wand2, ArrowRight, Star, Circle, Triangle, Hexagon, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { useState, useEffect } from "react";

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI-Powered Transformation",
      description: "Transform your sketches into stunning artwork using advanced AI technology"
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Multiple Art Styles",
      description: "Choose from Van Gogh, Cartoon, Photorealistic, Cyberpunk and more"
    },
    {
      icon: <Wand2 className="w-8 h-8" />,
      title: "Custom Prompts",
      description: "Describe your vision with text prompts for personalized results"
    }
  ];

  // Floating elements data
  const [floatingElements, setFloatingElements] = useState([]);

  useEffect(() => {
    const elements = [];
    for (let i = 0; i < 20; i++) {
      elements.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 30 + 10,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
        shape: ['circle', 'triangle', 'star', 'hexagon'][Math.floor(Math.random() * 4)],
        opacity: Math.random() * 0.5 + 0.3
      });
    }
    setFloatingElements(elements);
  }, []);

  const FloatingShape = ({ element }) => {
    const ShapeIcon = {
      circle: Circle,
      triangle: Triangle,
      star: Star,
      hexagon: Hexagon
    }[element.shape];

    return (
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${element.x}%`,
          top: `${element.y}%`,
          animationDuration: `${element.duration}s`,
          animationDelay: `${element.delay}s`,
          opacity: element.opacity
        }}
      >
        <ShapeIcon 
          size={element.size} 
          className="text-primary/40 animate-pulse"
          style={{
            animation: `float ${element.duration}s ease-in-out infinite ${element.delay}s`
          }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-subtle relative overflow-hidden">
      {/* Animated CSS for floating elements */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes gradient-shift {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        
        .floating-orb {
          animation: float 15s ease-in-out infinite;
        }
        
        .floating-orb:nth-child(2) { animation-delay: -5s; }
        .floating-orb:nth-child(3) { animation-delay: -10s; }
        
        .grid-pattern {
          background-image: 
            linear-gradient(rgba(139, 92, 246, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.2) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gradient-shift 10s ease-in-out infinite;
        }
        
        .mesh-gradient {
          background: radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.5) 0%, transparent 60%),
                      radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.5) 0%, transparent 60%),
                      radial-gradient(circle at 40% 60%, rgba(59, 130, 246, 0.5) 0%, transparent 60%);
        }
      `}</style>

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-50"></div>
      
      {/* Mesh Gradient Overlay */}
      <div className="absolute inset-0 mesh-gradient"></div>

      {/* Large Floating Orbs */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-purple-500/40 to-pink-500/40 rounded-full blur-xl floating-orb"></div>
      <div className="absolute top-1/3 right-20 w-24 h-24 bg-gradient-to-br from-blue-500/40 to-cyan-500/40 rounded-full blur-xl floating-orb"></div>
      <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-gradient-to-br from-emerald-500/40 to-teal-500/40 rounded-full blur-xl floating-orb"></div>

      {/* Floating Geometric Shapes */}
      {floatingElements.map((element) => (
        <FloatingShape key={element.id} element={element} />
      ))}

      {/* Animated Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
            <stop offset="100%" stopColor="rgba(236, 72, 153, 0.3)" />
          </linearGradient>
        </defs>
        <path
          d="M0,100 Q400,50 800,100 T1600,100"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          fill="none"
          className="opacity-50"
        >
          <animate
            attributeName="d"
            values="M0,100 Q400,50 800,100 T1600,100;M0,120 Q400,80 800,120 T1600,120;M0,100 Q400,50 800,100 T1600,100"
            dur="10s"
            repeatCount="indefinite"
          />
        </path>
        <path
          d="M0,300 Q600,250 1200,300 T2400,300"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          fill="none"
          className="opacity-40"
        >
          <animate
            attributeName="d"
            values="M0,300 Q600,250 1200,300 T2400,300;M0,280 Q600,320 1200,280 T2400,280;M0,300 Q600,250 1200,300 T2400,300"
            dur="15s"
            repeatCount="indefinite"
          />
        </path>
      </svg>

      {/* Header */}
      <header className="container mx-auto px-4 py-6 relative z-10">
        <nav className="flex items-center justify-between">
          <button 
            className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-accent transition-colors group" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/');
            }}
          >
            {/* <Wand2 className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" /> */}
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Sketch to Reality
            </h1>
          </button>
          <ThemeToggle />
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative z-10">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Transform Your{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Sketches
            </span>{" "}
            into Art
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload your hand-drawn sketches and watch them come to life with AI-powered 
            transformations. Choose from multiple artistic styles or describe your own vision.
          </p>
          <Button 
            variant="hero" 
            size="lg" 
            className="text-lg px-8 py-6 h-auto relative z-20"
            onClick={() => navigate('/process')}
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powered by Advanced AI
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the magic of AI-driven art transformation with our cutting-edge tools
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-8 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-300 hover:shadow-elegant relative overflow-hidden"
            >
              {/* Card background decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-lg"></div>
              <div className="text-primary mb-4 relative z-10">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3 relative z-10">{feature.title}</h3>
              <p className="text-muted-foreground relative z-10">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your creative needs
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 to-gray-600"></div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <div className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                <li>• 5 transformations per month</li>
                <li>• Basic art styles</li>
                <li>• Standard quality</li>
                <li>• Community support</li>
              </ul>
              <Button variant="outline" className="w-full" onClick={() => navigate('/process')}>
                Get Started
              </Button>
            </div>
          </Card>

          {/* Pro Plan */}
          <Card className="p-8 bg-gradient-primary border-0 text-white relative overflow-hidden transform scale-105">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute top-4 right-4">
              <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">Popular</span>
            </div>
            <div className="text-center relative z-10">
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <div className="text-3xl font-bold mb-4">$19<span className="text-sm font-normal text-white/80">/month</span></div>
              <ul className="space-y-3 text-sm text-white/90 mb-6">
                <li>• 100 transformations per month</li>
                <li>• All art styles & premium styles</li>
                <li>• High quality output</li>
                <li>• Priority support</li>
                <li>• Advanced customization</li>
              </ul>
              <Button variant="secondary" className="w-full" onClick={() => navigate('/process')}>
                Start Pro Trial
              </Button>
            </div>
          </Card>

          {/* Enterprise Plan */}
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-600"></div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <div className="text-3xl font-bold mb-4">$99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                <li>• Unlimited transformations</li>
                <li>• Custom art styles</li>
                <li>• Ultra-high quality</li>
                <li>• Dedicated support</li>
                <li>• API access</li>
              </ul>
              <Button variant="outline" className="w-full" onClick={() => navigate('/process')}>
                Contact Sales
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {[
            { value: "50K+", label: "Images Transformed" },
            { value: "10K+", label: "Happy Artists" },
            { value: "15+", label: "Art Styles" },
            { value: "99.9%", label: "Uptime" }
          ].map((stat, index) => (
            <div key={index} className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-transparent rounded-lg blur-xl"></div>
              <div className="relative z-10 p-4">
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center relative z-10">
        <Card className="max-w-2xl mx-auto p-12 bg-gradient-primary border-0 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Ready to Create?</h2>
            <p className="text-lg mb-6 text-white/90">
              Join thousands of artists already transforming their sketches with AI
            </p>
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => navigate('/process')}
            >
              Start Creating Now
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default HomePage;