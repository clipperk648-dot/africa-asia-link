import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

interface ThreeModelFrameProps {
  modelUrl?: string;
  className?: string;
  heightClassName?: string;
}

const ThreeModelFrame: React.FC<ThreeModelFrameProps> = ({ modelUrl, className, heightClassName = "h-[26rem]" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameIdRef = useRef<number>();
  const cleanupRef = useRef<() => void>();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !modelUrl) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let controls: OrbitControls | null = null;
    let cancelled = false;

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
      controls.autoRotate = false;

      const onLoad = (obj: THREE.Object3D) => {
        if (cancelled) return;
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

        camera!.near = Math.max(0.001, radius / 100);
        camera!.far = radius * 100;
        camera!.updateProjectionMatrix();

        const dirVec = new THREE.Vector3(1, 1, 1).normalize();
        camera!.position.copy(center.clone().add(dirVec.multiplyScalar(distance)));
        controls!.target.copy(center);
        controls!.minDistance = radius * 0.6;
        controls!.maxDistance = radius * 10;
        controls!.update();

        // Resize handler
        const onResize = () => {
          const { clientWidth, clientHeight } = container;
          renderer!.setSize(clientWidth, clientHeight);
          camera!.aspect = clientWidth / Math.max(1, clientHeight);
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
      };

      // Try to infer extension, but also support URLs without extensions by falling back
      const ext = modelUrl.split("?")[0].split(".").pop()?.toLowerCase();

      const tryLoaders = () => {
        // Helper to try OBJ after FBX failure (or vice versa)
        const tryOBJ = () => {
          new OBJLoader().load(
            modelUrl,
            onLoad,
            undefined,
            (err) => {
              // eslint-disable-next-line no-console
              console.error("Failed to load OBJ", err);
            }
          );
        };

        const tryFBX = () => {
          new FBXLoader().load(
            modelUrl,
            onLoad,
            undefined,
            (err) => {
              // eslint-disable-next-line no-console
              console.error("Failed to load FBX", err);
              // fallback to OBJ
              tryOBJ();
            }
          );
        };

        if (ext === "fbx") {
          tryFBX();
        } else if (ext === "obj") {
          tryOBJ();
        } else {
          // Unknown: attempt FBX then OBJ
          tryFBX();
        }
      };

      tryLoaders();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Three init error", e);
    }

    return () => {
      cancelled = true;
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
