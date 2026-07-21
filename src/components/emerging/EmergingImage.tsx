"use client";

import "./EmergeMaterial";
import { View } from "@react-three/drei";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import * as THREE from "three";
import useScreenSize from "@/hooks/useScreenSize";

const PIXELS = [
  1, 1.5, 2, 2.5, 3, 1, 1.5, 2, 2.5, 3, 3.5, 4, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5,
  6, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 20, 100,
].map((v) => v / 100);

const FILL_COLOR = "#403fb7";

type EmergingImageProps = ComponentProps<typeof View> & {
  url: string;
  type: number;
};

export default function EmergingImage({
  url,
  type,
  ...props
}: EmergingImageProps) {
  const [refMesh, setRefMesh] = useState<THREE.Mesh | null>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [textureSize, setTextureSize] = useState<[number, number]>([0, 0]);
  const [elementSize, setElementSize] = useState<[number, number]>([0, 0]);
  const ref = useRef<HTMLElement>(null);
  const screenSize = useScreenSize();
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    new THREE.TextureLoader().loadAsync(url).then((data) => {
      if (cancelled) return;
      const image = data.image as HTMLImageElement;
      setTextureSize([image.width, image.height]);
      setTexture(data);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    if (!refMesh) return;
    const material = refMesh.material as THREE.ShaderMaterial & {
      uProgress: number;
      uType: number;
    };
    material.uProgress = 0;
    material.uType = type;
  }, [refMesh, type]);

  useGSAP(
    () => {
      if (!refMesh?.material) return;
      gsap.to(refMesh.material, {
        uProgress: isIntersecting ? 1 : 0,
        duration: 1.5,
        ease: "none",
      });
    },
    { dependencies: [isIntersecting, type, refMesh] },
  );

  useLayoutEffect(() => {
    if (!refMesh || !ref.current) return;

    const bounds = ref.current.getBoundingClientRect();
    setElementSize([bounds.width, bounds.height]);
    refMesh.scale.set(bounds.width, bounds.height, 1);

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [refMesh]);

  useEffect(() => {
    if (!ref.current || !refMesh) return;
    const bounds = ref.current.getBoundingClientRect();
    setElementSize([bounds.width, bounds.height]);
    refMesh.scale.set(bounds.width, bounds.height, 1);
  }, [screenSize, refMesh]);

  return (
    <View {...props} ref={ref}>
      <mesh ref={setRefMesh}>
        {/* @ts-expect-error custom shader material via extend */}
        <emergeMaterial
          uFillColor={new THREE.Color(FILL_COLOR)}
          transparent
          uTexture={texture}
          uPixels={PIXELS}
          uTextureSize={new THREE.Vector2(textureSize[0], textureSize[1])}
          uElementSize={new THREE.Vector2(elementSize[0], elementSize[1])}
        />
        <planeGeometry args={[1, 1]} />
      </mesh>
    </View>
  );
}
