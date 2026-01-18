import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random';

// Bright visible stars
function Stars(props: any) {
  const ref = useRef<any>();
  const positions = useMemo(() => random.inSphere(new Float32Array(3000 * 3), { radius: 1.8 }), []);

  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 12;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.004}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  );
}

export default function SpaceBackground() {
  return (
    <div className="fixed inset-0 z-0 bg-black" style={{ pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
        <ambientLight intensity={0.2} />
        <Stars />
      </Canvas>
    </div>
  );
}
