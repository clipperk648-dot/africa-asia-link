import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

interface ThreeModelFrameProps {
  modelUrl?: string; // .fbx URL
  className?: string;
  heightClassName?: string; // e.g., h-full
}

const ThreeModelFrame: React.FC<ThreeModelFrameProps> = ({ modelUrl, className, heightClassName = "h-[26rem]" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const frameIdRef = useRef<number>();
  const cleanupRef = useRef<() => void>();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !modelUrl) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let controls: OrbitControls | null = null;

    try {
      // Scene and renderer
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xffffff);

      camera = new THREE.PerspectiveCamera(40, 1, 0.01, 10000);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const mount = document.createElement("div");
      mount.style.position = "absolute";
      mount.style.inset = "0";
      container.appendChild(mount);
      mount.appendChild(renderer.domElement);

      // Lights
      const hemi = new THREE.HemisphereLight(0xffffff, 0xdddddd, 0.9);
      scene.add(hemi);
      const dir = new THREE.DirectionalLight(0xffffff, 0.9);
      dir.position.set(3, 5, 7);
      scene.add(dir);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.autoRotate = false; // stay still

      // Load model
      const loader = new FBXLoader();
      loader.load(
        modelUrl,
        (obj) => {
          scene!.add(obj);

          // Compute bounds
          const box = new THREE.Box3().setFromObject(obj);
          const sphere = box.getBoundingSphere(new THREE.Sphere());
          const center = sphere.center;
          const radius = sphere.radius || 1;

          // Fit camera to object
          const fov = (camera!.fov * Math.PI) / 180;
          const fitHeightDistance = radius / Math.sin(fov / 2);
          const fitWidthDistance = fitHeightDistance / camera!.aspect;
          const distance = 1.15 * Math.max(fitHeightDistance, fitWidthDistance);

          camera!.near = radius / 100;
          camera!.far = radius * 100;
          camera!.updateProjectionMatrix();

          const dirVec = new THREE.Vector3(1, 1, 1).normalize();
          camera!.position.copy(center.clone().add(dirVec.multiplyScalar(distance)));
          controls!.target.copy(center);
          controls!.minDistance = radius * 0.6;
          controls!.maxDistance = radius * 10;
          controls!.update();

          // Resize handler (recompute aspect only)
          const onResize = () => {
            const { clientWidth, clientHeight } = container;
            renderer!.setSize(clientWidth, clientHeight);
            camera!.aspect = clientWidth / clientHeight;
            camera!.updateProjectionMatrix();
          };
          onResize();
          const ro = new ResizeObserver(onResize);
          ro.observe(container);

          const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            controls!.update();
            renderer!.render(scene!, camera!);
          };
          animate();

          cleanupRef.current = () => {
            if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
            ro.disconnect();
            controls!.dispose();
            renderer!.dispose();
            mount.remove();
          };
        },
        undefined,
        (err) => {
          // eslint-disable-next-line no-console
          console.error("Failed to load FBX", err);
        }
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Three init error", e);
    }

    return () => {
      cleanupRef.current?.();
    };
  }, [modelUrl]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-white border border-black/10 shadow-xl",
        heightClassName,
        className,
      )}
    />
  );
};

export default ThreeModelFrame;
