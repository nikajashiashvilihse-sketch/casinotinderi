import React, { useEffect, useRef } from "react";

interface ConfettiProps {
  active: boolean;
  onComplete: () => void;
}

export const Confetti: React.FC<ConfettiProps> = ({ active, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Adjust canvas size on window resize
    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;

      constructor() {
        // Spawn around center-bottom where swiping elements reside or full screen
        this.x = Math.random() * width;
        this.y = height + Math.random() * 20;
        this.size = Math.random() * 8 + 6;
        
        // Brand neon colors + gold + sparks
        const colors = ["#BAFF00", "#66FF03", "#FFFFFF", "#FF4058", "#222222", "#FFDF00"];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        this.speedX = Math.random() * 6 - 3;
        this.speedY = -Math.random() * 14 - 8; // Shoot upwards
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += 0.35; // Gravity
        this.rotation += this.rotationSpeed;
      }

      render(gl: CanvasRenderingContext2D) {
        gl.save();
        gl.translate(this.x, this.y);
        gl.rotate((this.rotation * Math.PI) / 180);
        gl.fillStyle = this.color;
        
        // Draw square or ribbon
        gl.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        gl.restore();
      }
    }

    const particles: Particle[] = [];
    // Instantiate 100 colorful elements
    for (let i = 0; i < 110; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      let alive = false;
      particles.forEach((p) => {
        p.update();
        p.render(ctx);
        if (p.y < height + 50) {
          alive = true;
        }
      });

      if (alive) {
        animationId = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none w-screen h-screen z-[9999]"
      style={{ mixBlendMode: "screen" }}
    />
  );
};
