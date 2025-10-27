import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

interface ThreeModelFrameProps {
  modelUrl: string;
  className?: string;
  heightClassName?: string; // e.g., h-96
}

const ThreeModelFrame: React.FC<ThreeModelFrameProps> = ({ modelUrl, className, heightClassName = "h-[26rem]" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const frameIdRef = useRef<number>();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
    camera.position.set(2.8, 1.8, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    const mount = document.createElement("div");
    mount.style.position = "absolute";
    mount.style.inset = "0";
    container.appendChild(mount);
    mount.appendChild(renderer.domElement);

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x333366, 1.0);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(3, 5, 4);
    dir.castShadow = false;
    scene.add(dir);

    // Ground subtle reflection plane
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(4, 64),
      new THREE.ShaderMaterial({
        transparent: true,
        uniforms: { uColor: { value: new THREE.Color(0x8a6cfd) } },
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `varying vec2 vUv; uniform vec3 uColor; void main(){ float d=1.0-distance(vUv, vec2(0.5)); d=smoothstep(0.0,0.9,d); gl_FragColor=vec4(uColor, d*0.08); }`,
        depthWrite: false,
      })
    );
    ground.rotateX(-Math.PI / 2);
    ground.position.y = -0.6;
    scene.add(ground);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 1.2;
    controls.maxDistance = 8;

    let model: THREE.Object3D | null = null;
    const loader = new FBXLoader();
    loader.load(
      modelUrl,
      (obj) => {
        model = obj;
        // Center and scale to fit
        const box = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);
        obj.position.sub(center);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = 1.6 / maxDim;
        obj.scale.setScalar(scale);
        scene.add(obj);
      },
      undefined,
      (err) => {
        // eslint-disable-next-line no-console
        console.error("Failed to load FBX:", err);
      }
    );

    const onResize = () => {
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    onResize();
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      if (model) {
        model.rotation.y += 0.0012; // gentle auto-rotate
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      mount.remove();
    };
  }, [modelUrl]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-[1.75rem]",
        "backdrop-blur-2xl bg-white/5 border border-white/15 shadow-2xl",
        "ring-1 ring-white/10",
        heightClassName,
        className,
      )}
    >
      {/* Animated conic gradient frame */}
      <div
        className="pointer-events-none absolute -inset-[2px] rounded-[inherit] blur-sm opacity-70 animate-[spin_10s_linear_infinite]"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(138,108,253,0.35), rgba(59,130,246,0.25), rgba(16,185,129,0.25), rgba(255,255,255,0.25), rgba(138,108,253,0.35))",
          mask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
          WebkitMask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
          padding: 2,
        }}
      />

      {/* Inner glow */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ boxShadow: "inset 0 0 120px rgba(138,108,253,0.12)" }} />

      {/* Canvas mounts here */}
      <div className="absolute inset-0" />

      {/* Corner accents */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit]">
        <div className="absolute top-4 left-4 w-24 h-24 bg-primary/20 blur-2xl rounded-full" />
        <div className="absolute bottom-4 right-6 w-28 h-28 bg-secondary/20 blur-2xl rounded-full" />
      </div>
    </div>
  );
};

export default ThreeModelFrame;
