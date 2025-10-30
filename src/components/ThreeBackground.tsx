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
      "rgba(138, 108, 253, 0.7)",
      "rgba(255, 193, 7, 0.7)",
      "rgba(52, 211, 153, 0.7)",
    ];

    let connectionDistance = 220;
    let connectionDistanceSq = connectionDistance * connectionDistance;
    const frameInterval = 1000 / 30; // 30 FPS for better perf
    const baseSpeed = 0.5;
    let minParticleSize = 4;
    let maxParticleSize = 8;
    let enableConnections = true;
    const cohesionRadius = 200;
    const cohesionStrength = 0.003;
    const velocityDamping = 0.998;
    const bounceCoefficient = 0.8; // Energy loss on bounce

    let particles: Particle[] = [];
    let animationFrameId: number | null = null;
    let lastFrameTime = performance.now();

    const getTargetParticleCount = () => {
      const w = window.innerWidth;
      // Use window.innerHeight but ensure it's reasonable for mobile
      const h = Math.min(window.innerHeight, window.screen.height);
      if (w < 640) return 40;
      const area = w * h;
      return Math.max(60, Math.min(180, Math.round(area / 35000) + 50));
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
        minParticleSize = 3;
        maxParticleSize = 6;
        connectionDistance = 180;
      } else {
        minParticleSize = 4;
        maxParticleSize = 8;
        connectionDistance = 220;
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

        // Cohesion towards nearby particles (atomic clustering)
        let sumX = 0, sumY = 0, count = 0;
        for (let j = 0; j < particles.length && count < 8; j++) {
          if (i === j) continue;
          const n = particles[j];
          const dx = n.x - p.x;
          const dy = n.y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < cohesionRadius * cohesionRadius) {
            sumX += n.x;
            sumY += n.y;
            count++;
          }
        }
        if (count > 0) {
          const cx = sumX / count;
          const cy = sumY / count;
          p.velocityX += (cx - p.x) * cohesionStrength;
          p.velocityY += (cy - p.y) * cohesionStrength;
        }
        p.velocityX *= velocityDamping;
        p.velocityY *= velocityDamping;

        p.x += p.velocityX;
        p.y += p.velocityY;

        // Bounce off edges instead of wrapping
        const radius = p.size;

        if (p.x + radius > width) {
          p.x = width - radius;
          p.velocityX *= -bounceCoefficient;
        } else if (p.x - radius < 0) {
          p.x = radius;
          p.velocityX *= -bounceCoefficient;
        }

        if (p.y + radius > height) {
          p.y = height - radius;
          p.velocityY *= -bounceCoefficient;
        } else if (p.y - radius < 0) {
          p.y = radius;
          p.velocityY *= -bounceCoefficient;
        }

        // Particle glow
        const gradient = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, "rgba(138,108,253,0)");
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = p.color;
        context.beginPath();
        context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        context.fill();
      }

      if (enableConnections) {
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const distanceSq = dx * dx + dy * dy;
            if (distanceSq < connectionDistanceSq) {
              const distance = Math.sqrt(distanceSq);
              const opacity = 0.4 * (1 - distance / connectionDistance);
              context.strokeStyle = `rgba(138, 108, 253, ${opacity})`;
              context.lineWidth = 2.5;
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
