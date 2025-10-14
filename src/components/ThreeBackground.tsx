import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  size: number;
  velocityX: number;
  velocityY: number;
  color: string;
};

const ThreeBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Respect reduced motion: render static gradient only
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) return;

    const colors = [
      "rgba(138, 108, 253, 0.6)",
      "rgba(255, 193, 7, 0.6)",
      "rgba(52, 211, 153, 0.6)",
    ];

    let connectionDistance = 160;
    let connectionDistanceSq = connectionDistance * connectionDistance;
    const frameInterval = 1000 / 30; // 30 FPS for better perf
    const baseSpeed = 1.2;
    let minParticleSize = 6;
    let maxParticleSize = 12;
    let enableConnections = true;

    let particles: Particle[] = [];
    let animationFrameId: number | null = null;
    let lastFrameTime = performance.now();

    const getTargetParticleCount = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w < 640) return 12;
      const area = w * h;
      return Math.max(16, Math.min(32, Math.round(area / 70000) + 12));
    };

    const createParticle = (): Particle => {
      const angle = Math.random() * Math.PI * 2;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * (maxParticleSize - minParticleSize) + minParticleSize,
        velocityX: Math.cos(angle) * baseSpeed,
        velocityY: Math.sin(angle) * baseSpeed,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    };

    const applyResponsiveSettings = () => {
      const w = window.innerWidth;
      enableConnections = w >= 640; // disable on small screens
      if (w < 640) {
        minParticleSize = 7;
        maxParticleSize = 12;
        connectionDistance = 140;
      } else {
        minParticleSize = 6;
        maxParticleSize = 12;
        connectionDistance = 160;
      }
      connectionDistanceSq = connectionDistance * connectionDistance;
    };

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // cap DPR for perf
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const syncParticleCount = () => {
      const targetCount = getTargetParticleCount();
      if (particles.length < targetCount) {
        const deficit = targetCount - particles.length;
        for (let i = 0; i < deficit; i++) {
          particles.push(createParticle());
        }
      } else if (particles.length > targetCount) {
        particles = particles.slice(0, targetCount);
      }
    };

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);
      if (time - lastFrameTime < frameInterval) return;
      lastFrameTime = time;

      context.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.velocityX;
        p.y += p.velocityY;

        if (p.x > width) p.x = 0; else if (p.x < 0) p.x = width;
        if (p.y > height) p.y = 0; else if (p.y < 0) p.y = height;

        context.fillStyle = p.color;
        context.beginPath();
        context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        context.fill();
      }

      if (enableConnections) {
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          for (let j = i + 1; j < particles.length; j += 2) { // skip some pairs for perf
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const distanceSq = dx * dx + dy * dy;
            if (distanceSq < connectionDistanceSq) {
              const opacity = 0.18 * (1 - Math.sqrt(distanceSq) / connectionDistance);
              context.strokeStyle = `rgba(138, 108, 253, ${opacity})`;
              context.lineWidth = 2;
              context.beginPath();
              context.moveTo(a.x, a.y);
              context.lineTo(b.x, b.y);
              context.stroke();
            }
          }
        }
      }
    };

    const handleResize = () => {
      resizeCanvas();
      applyResponsiveSettings();
      syncParticleCount();
    };

    resizeCanvas();
    applyResponsiveSettings();
    particles = Array.from({ length: getTargetParticleCount() }, createParticle);
    animationFrameId = requestAnimationFrame(animate);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 bg-gradient-to-br from-background via-background to-primary/5"
    />
  );
};

export default ThreeBackground;
