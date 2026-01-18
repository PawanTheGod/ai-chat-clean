import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Sphere } from '@react-three/drei';
import * as random from 'maath/random';
import * as THREE from 'three';

// Rotating stars component
function Stars(props: any) {
  const ref = useRef<any>();
  const positions = useMemo(() => random.inSphere(new Float32Array(5000 * 3), { radius: 1.8 }), []);

  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 12;
      ref.current.rotation.y -= delta / 18;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#e2e8f0"
          size={0.0025}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.4}
        />
      </Points>
    </group>
  );
}

// Subtle accent stars
function AccentStars() {
  const positions1 = useMemo(() => random.inSphere(new Float32Array(600 * 3), { radius: 1.5 }), []);
  const positions2 = useMemo(() => random.inSphere(new Float32Array(400 * 3), { radius: 1.3 }), []);
  
  return (
    <>
      <Points positions={positions1} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#cbd5e1"
          size={0.003}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.3}
        />
      </Points>
      <Points positions={positions2} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#94a3b8"
          size={0.0028}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.25}
        />
      </Points>
    </>
  );
}

// Refined planets
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
        emissiveIntensity={0.15}
        roughness={0.8}
        metalness={0.2}
      />
    </Sphere>
  );
}

// Elegant planets with muted colors
function Planets() {
  return (
    <>
      <Planet position={[-1.5, 0.8, -2]} size={0.12} color="#475569" speed={0.25} />
      <Planet position={[1.8, -0.6, -2.5]} size={0.10} color="#64748b" speed={0.2} />
      <Planet position={[-2.2, -1, -3]} size={0.14} color="#334155" speed={0.15} />
      <Planet position={[2.5, 1.2, -3.5]} size={0.08} color="#1e293b" speed={0.3} />
    </>
  );
}

// Very subtle nebula
function Nebula() {
  return (
    <>
      <Sphere args={[1.5, 32, 32]} position={[-2, 1, -4]}>
        <meshBasicMaterial
          color="#1e293b"
          transparent
          opacity={0.015}
          side={THREE.BackSide}
        />
      </Sphere>
      <Sphere args={[1.8, 32, 32]} position={[2, -1, -5]}>
        <meshBasicMaterial
          color="#0f172a"
          transparent
          opacity={0.012}
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
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.3} />
        <Stars />
        <AccentStars />
        <Planets />
        <Nebula />
      </Canvas>
    </div>
  );
}
