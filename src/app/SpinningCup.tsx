"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useGLTF, Center } from "@react-three/drei";

function AsciiMaterial() {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color("#a255d9") },
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
        
        const float chars = 8.0;
        
        void main() {
          vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));
          float light = dot(vNormal, lightDir);
          light = max(0.2, light); // Keep minimum brightness
          
          vec3 viewDir = vec3(0.0, 0.0, 1.0);
          float rim = 1.0 - abs(dot(vNormal, viewDir));
          rim = pow(rim, 2.0) * 0.5;
          
          float brightness = light + rim;
          
          float asciiLevels = 9.0;
          brightness = floor(brightness * asciiLevels) / asciiLevels;
          
          vec2 uv = vUv;
          uv = floor(uv * pixelSize) / pixelSize;
          
          float scanline = sin(uv.y * 100.0 + time * 5.0) * 0.1 + 0.9;
          
          gl_FragColor = vec4(color * brightness * scanline, 1.0);
        }
      `
    });
  }, []);

  return material;
}
function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

function CupModel() {
  const meshRef = useRef<THREE.Group>(null);
const materialRef = useRef<THREE.ShaderMaterial | null>(null);
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

export default function SpinningCup() {
  return (
    <div style={{ height: "500px", width: "100%", position: "relative" }}>
      <Canvas
        camera={{ position: [0, 2.1, 4] }}
        gl={{ alpha: true }}
      >
        <CameraSetup />
        <ambientLight intensity={2} />
        <directionalLight intensity={2} position={[5, 5, 5]} />
        <CupModel />
      </Canvas>
    </div>
  );
}