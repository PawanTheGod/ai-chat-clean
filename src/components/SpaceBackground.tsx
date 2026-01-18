import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Sphere } from '@react-three/drei';
import * as random from 'maath/random';
import * as THREE from 'three';

// Rotating stars component
function Stars(props: any) {
  const ref = useRef<any>();
  const positions = useMemo(() => random.inSphere(new Float32Array(6000 * 3), { radius: 1.8 }), []);

  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.003}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  );
}

// Colorful accent stars
function AccentStars() {
  const positions1 = useMemo(() => random.inSphere(new Float32Array(800 * 3), { radius: 1.5 }), []);
  const positions2 = useMemo(() => random.inSphere(new Float32Array(600 * 3), { radius: 1.3 }), []);
  
  return (
    <>
      <Points positions={positions1} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#88ccff"
          size={0.004}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.5}
        />
      </Points>
      <Points positions={positions2} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ff88cc"
          size={0.0035}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.4}
        />
      </Points>
    </>
  );
}

// Animated planets
function Planet({ position, size, color, speed }: any) {
  const ref = useRef<any>();
  
  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * speed;
    }
  });

  return (
    <Sphere ref={ref} args={[size, 32, 32]} position={position}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.2}
        roughness={0.7}
        metalness={0.3}
      />
    </Sphere>
  );
}

// Planets group
function Planets() {
  return (
    <>
      <Planet position={[-1.5, 0.8, -2]} size={0.15} color="#4488ff" speed={0.3} />
      <Planet position={[1.8, -0.6, -2.5]} size={0.12} color="#ff6688" speed={0.25} />
      <Planet position={[-2.2, -1, -3]} size={0.18} color="#8844ff" speed={0.2} />
      <Planet position={[2.5, 1.2, -3.5]} size={0.1} color="#44ffaa" speed={0.35} />
    </>
  );
}

// Nebula glow
function Nebula() {
  return (
    <>
      <Sphere args={[1.5, 32, 32]} position={[-2, 1, -4]}>
        <meshBasicMaterial
          color="#3344ff"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
        />
      </Sphere>
      <Sphere args={[1.8, 32, 32]} position={[2, -1, -5]}>
        <meshBasicMaterial
          color="#ff3388"
          transparent
          opacity={0.025}
          side={THREE.BackSide}
        />
      </Sphere>
    </>
  );
}

export default function SpaceBackground() {
  return (
    <div className="fixed inset-0 z-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" style={{ pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <Stars />
        <AccentStars />
        <Planets />
        <Nebula />
      </Canvas>
    </div>
  );
}
