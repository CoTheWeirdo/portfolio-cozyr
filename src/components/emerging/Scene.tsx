"use client";

import { OrthographicCamera, Preload, View } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

export default function Scene() {
  return (
    <Canvas
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 1,
      }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
    >
      <View.Port />
      <OrthographicCamera makeDefault position={[0, 0, 300]} zoom={1} />
      <Preload all />
    </Canvas>
  );
}
