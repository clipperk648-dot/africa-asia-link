import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface ThreeModelFrameProps {
  modelUrl?: string;
  className?: string;
  heightClassName?: string;
  materialMaps?: {
    color?: string;
    normal?: string;
    roughness?: string;
    metalness?: string;
    ao?: string;
    bump?: string;
    emissive?: string;
  };
  repeat?: [number, number];
}

const ThreeModelFrame: React.FC<ThreeModelFrameProps> = ({ modelUrl, className, heightClassName = "h-[26rem]", materialMaps, repeat }) => {
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

      const texLoader = new THREE.TextureLoader();
      (texLoader as any).setCrossOrigin?.("anonymous");

      const loadTexture = (url?: string, isColor = false) =>
        new Promise<THREE.Texture | null>((resolve) => {
          if (!url) return resolve(null);
          texLoader.load(
            url,
            (tex) => {
              tex.wrapS = THREE.RepeatWrapping;
              tex.wrapT = THREE.RepeatWrapping;
              if (isColor && (tex as any).colorSpace !== undefined) {
                (tex as any).colorSpace = THREE.SRGBColorSpace;
              } else if ((tex as any).colorSpace !== undefined) {
                (tex as any).colorSpace = THREE.NoColorSpace;
              }
              resolve(tex);
            },
            undefined,
            () => resolve(null)
          );
        });

      const texPromise = (async () => {
        const maps = {
          color: await loadTexture(modelUrl && (materialMaps?.color ?? undefined), true),
          normal: await loadTexture(modelUrl && (materialMaps?.normal ?? undefined), false),
          roughness: await loadTexture(modelUrl && (materialMaps?.roughness ?? undefined), false),
          metalness: await loadTexture(modelUrl && (materialMaps?.metalness ?? undefined), false),
          ao: await loadTexture(modelUrl && (materialMaps?.ao ?? undefined), false),
          bump: await loadTexture(modelUrl && (materialMaps?.bump ?? undefined), false),
          emissive: await loadTexture(modelUrl && (materialMaps?.emissive ?? undefined), true),
        } as const;
        return maps;
      })();

      const applyMaps = async (root: THREE.Object3D) => {
        const maps = await texPromise;
        const rep = repeat ?? [1, 1];
        const setRepeat = (tex: THREE.Texture | null) => {
          if (!tex) return;
          tex.repeat.set(rep[0], rep[1]);
          tex.needsUpdate = true;
        };
        Object.values(maps).forEach(setRepeat);

        root.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.material) return;
          const applyTo = (mat: any) => {
            if (!mat) return;
            if (maps.color) mat.map = maps.color;
            if (maps.normal) mat.normalMap = maps.normal;
            if (maps.roughness) mat.roughnessMap = maps.roughness;
            if (maps.metalness) mat.metalnessMap = maps.metalness;
            if (maps.ao) mat.aoMap = maps.ao;
            if (maps.bump) mat.bumpMap = maps.bump;
            if (maps.emissive) {
              mat.emissiveMap = maps.emissive;
              mat.emissiveIntensity = mat.emissiveIntensity ?? 0.5;
            }
            mat.needsUpdate = true;
          };
          if (Array.isArray(mesh.material)) mesh.material.forEach(applyTo);
          else applyTo(mesh.material);
        });
      };

      const onLoad = (obj: THREE.Object3D) => {
        if (cancelled) return;
        scene!.add(obj);
        applyMaps(obj).catch(() => {});

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

      const ext = modelUrl.split("?")[0].split(".").pop()?.toLowerCase();

      const resourcePath = (() => {
        try {
          const u = new URL(modelUrl, window.location.href);
          return u.href.slice(0, u.href.lastIndexOf("/") + 1);
        } catch {
          const lastSlash = modelUrl.lastIndexOf("/");
          return lastSlash > -1 ? modelUrl.slice(0, lastSlash + 1) : "";
        }
      })();

      const addFallback = () => {
        if (!scene) return;
        const group = new THREE.Group();
        const geo = new THREE.TorusKnotGeometry(1, 0.35, 200, 32);
        const mat = new THREE.MeshStandardMaterial({ color: 0x6666ff, metalness: 0.2, roughness: 0.6 });
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);
        onLoad(group);
      };

      let lastError: any = null;
      const loadWith = (format: "gltf" | "glb" | "fbx" | "obj", onFail?: () => void) => {
        if (format === "gltf" || format === "glb") {
          const loader = new GLTFLoader();
          if ((loader as any).setCrossOrigin) (loader as any).setCrossOrigin("anonymous");
          if ((loader as any).setResourcePath) (loader as any).setResourcePath(resourcePath);
          loader.load(
            modelUrl,
            (gltf) => onLoad(gltf.scene),
            undefined,
            (e) => {
              lastError = e;
              onFail?.();
            }
          );
        } else if (format === "fbx") {
          const loader = new FBXLoader();
          if ((loader as any).setCrossOrigin) (loader as any).setCrossOrigin("anonymous");
          loader.load(
            modelUrl,
            onLoad,
            undefined,
            (e) => {
              lastError = e;
              onFail?.();
            }
          );
        } else if (format === "obj") {
          const loader = new OBJLoader();
          loader.load(
            modelUrl,
            onLoad,
            undefined,
            (e) => {
              lastError = e;
              onFail?.();
            }
          );
        }
      };

      const sniffAndLoad = async () => {
        const chooseByExt = () => {
          if (ext === "gltf" || ext === "glb") return ext as "gltf" | "glb";
          if (ext === "fbx") return "fbx" as const;
          if (ext === "obj") return "obj" as const;
          return null;
        };

        let format: "gltf" | "glb" | "fbx" | "obj" | null = chooseByExt();

        if (!format) {
          try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 5000);
            let res = await fetch(modelUrl, {
              method: "GET",
              headers: { Range: "bytes=0-2047" },
              signal: controller.signal,
            });
            clearTimeout(id);
            if (!res.ok) {
              res = await fetch(modelUrl);
            }
            const buf = await res.arrayBuffer();
            const bytes = new Uint8Array(buf);
            const head4 = String.fromCharCode(...bytes.slice(0, 4));
            const text = new TextDecoder("utf-8").decode(bytes.slice(0, 256)).trim();

            if (head4 === "glTF") {
              format = "glb";
            } else if (text.startsWith("{") && /\"asset\"/i.test(text)) {
              format = "gltf";
            } else if (text.includes("Kaydara FBX") || text.includes("FBXHeaderExtension")) {
              format = "fbx";
            } else {
              const firstChar = text[0];
              if (firstChar === "#" || firstChar === "o" || firstChar === "v" || text.startsWith("mtllib")) {
                format = "obj";
              }
            }
          } catch {
            // ignore sniff errors
          }
        }

        const tryOrder: ("gltf" | "glb" | "fbx" | "obj")[] = (() => {
          if (format === "gltf" || format === "glb") return [format, "fbx", "obj"];
          if (format === "fbx") return ["fbx", "gltf", "glb", "obj"];
          if (format === "obj") return ["obj", "gltf", "glb", "fbx"];
          return ["obj", "gltf", "glb", "fbx"];
        })();

        let i = 0;
        const next = () => {
          if (i >= tryOrder.length) {
            // eslint-disable-next-line no-console
            console.error("Failed to load model with any supported loader", { modelUrl, ext });
            return;
          }
          const f = tryOrder[i++];
          loadWith(f, next);
        };
        next();
      };

      sniffAndLoad();
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
