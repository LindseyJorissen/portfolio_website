"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useGLTF, Center } from "@react-three/drei";

/* -------------------------
   ASCII MATERIAL SHADER
-------------------------- */

function AsciiMaterial() {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color("#c825f4") },
        pixelSize: { value: 5.0 },
        time: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float pixelSize;
        uniform float time;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        // ASCII character patterns (simplified - just using brightness levels)
        const float chars = 8.0;
        
        void main() {
          // Simple lighting
          vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));
          float light = dot(vNormal, lightDir);
          light = max(0.2, light); // Keep minimum brightness
          
          // Add rim lighting effect
          vec3 viewDir = vec3(0.0, 0.0, 1.0);
          float rim = 1.0 - abs(dot(vNormal, viewDir));
          rim = pow(rim, 2.0) * 0.5;
          
          float brightness = light + rim;
          
          // Create ASCII-like banding by quantizing brightness
          float asciiLevels = 9.0;
          brightness = floor(brightness * asciiLevels) / asciiLevels;
          
          // Add subtle pixelation effect
          vec2 uv = vUv;
          uv = floor(uv * pixelSize) / pixelSize;
          
          // Create subtle scanline effect
          float scanline = sin(uv.y * 100.0 + time * 5.0) * 0.1 + 0.9;
          
          // Output with ASCII-inspired styling
          gl_FragColor = vec4(color * brightness * scanline, 1.0);
        }
      `
    });
  }, []);

  return material;
}

/* -------------------------
   CUP MODEL
-------------------------- */

function CupModel() {
  const meshRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>();
  const { scene } = useGLTF("/models/coffeecup.glb");

  const asciiMaterial = AsciiMaterial();
  materialRef.current = asciiMaterial;

  useMemo(() => {
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = asciiMaterial;
      }
    });
  }, [scene, asciiMaterial]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
    // Update time uniform for animations
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <Center>
      <primitive
        ref={meshRef}
        object={scene}
        scale={1.7}
        position={[0, 0.5, 0]}
      />
    </Center>
  );
}

/* -------------------------
   MAIN COMPONENT
-------------------------- */

export default function SpinningCup() {
  return (
    <div style={{ height: "400px", width: "100%" }}>
      <Canvas
        camera={{ position: [0, 2.1, 4] }}
        gl={{ alpha: true }}
      >
        <ambientLight intensity={2} />
        <directionalLight intensity={2} position={[5, 5, 5]} />
        
        <CupModel />
      </Canvas>
    </div>
  );
}