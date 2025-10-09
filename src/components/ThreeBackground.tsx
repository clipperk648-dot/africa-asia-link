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

    const context = canvas.getContext("2d");
    if (!context) return;

    const colors = [
      "rgba(138, 108, 253, 0.6)",
      "rgba(255, 193, 7, 0.6)",
      "rgba(52, 211, 153, 0.6)",
    ];

    let connectionDistance = 200;
    let connectionDistanceSq = connectionDistance * connectionDistance;
    const frameInterval = 1000 / 45;
    const baseSpeed = 1.6;
    let minParticleSize = 8;
    let maxParticleSize = 16;
    let enableConnections = true;

    let particles: Particle[] = [];
    let animationFrameId: number | null = null;
    let lastFrameTime = performance.now();

    const getTargetParticleCount = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w < 640) return 16; // fewer particles on mobile, larger size below
      const area = w * h;
      return Math.max(20, Math.min(40, Math.round(area / 50000) + 10));
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
      enableConnections = true;
      if (w < 640) {
        minParticleSize = 9;
        maxParticleSize = 16;
        connectionDistance = 180;
      } else {
        minParticleSize = 8;
        maxParticleSize = 16;
        connectionDistance = 200;
      }
      connectionDistanceSq = connectionDistance * connectionDistance;
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
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
      if (time - lastFrameTime < frameInterval) {
        return;
      }

      lastFrameTime = time;
      context.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;

      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        particle.x += particle.velocityX;
        particle.y += particle.velocityY;

        if (particle.x > width) particle.x = 0;
        else if (particle.x < 0) particle.x = width;

        if (particle.y > height) particle.y = 0;
        else if (particle.y < 0) particle.y = height;

        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }

      if (enableConnections) {
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          for (let j = i + 1; j < particles.length; j += 1) {
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const distanceSq = dx * dx + dy * dy;

            if (distanceSq < connectionDistanceSq) {
              const opacity = 0.2 * (1 - Math.sqrt(distanceSq) / connectionDistance);
              context.strokeStyle = `rgba(138, 108, 253, ${opacity})`;
              context.lineWidth = 4;
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
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
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
