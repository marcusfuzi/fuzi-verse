import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { usePlayer } from '../../context/PlayerContext.jsx';

export default function HeroAudioVisualizer3D({ className = 'h-96 w-full' }) {
  const mountRef = useRef(null);
  const { isPlaying, analyserRef } = usePlayer();

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene, Camera, Renderer
    const width = currentMount.clientWidth || 600;
    const height = currentMount.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 28;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Particle Sphere Geometry
    const particleCount = 1800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const radius = 10;
    const color1 = new THREE.Color('#00f0ff'); // Electric Blue
    const color2 = new THREE.Color('#a855f7'); // Neon Purple
    const color3 = new THREE.Color('#ec4899'); // Hot Magenta

    for (let i = 0; i < particleCount; i++) {
      // Fibonacci sphere distribution
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      // Color interpolation along sphere height
      const t = (y + radius) / (2 * radius);
      let pColor = color1.clone();
      if (t < 0.5) {
        pColor.lerp(color2, t * 2);
      } else {
        pColor = color2.clone().lerp(color3, (t - 0.5) * 2);
      }

      colors[i * 3] = pColor.r;
      colors[i * 3 + 1] = pColor.g;
      colors[i * 3 + 2] = pColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material with additive glow
    const material = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // Outer Wireframe Ring (Orbit)
    const ringGeo = new THREE.TorusGeometry(14, 0.08, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (event) => {
      const rect = currentMount.getBoundingClientRect();
      const x = (event.clientX - rect.left) / width - 0.5;
      const y = (event.clientY - rect.top) / height - 0.5;
      targetX = x * 1.5;
      targetY = y * 1.5;
    };

    window.addEventListener('mousemove', onMouseMove);

    // Resize Handler
    const onResize = () => {
      if (!currentMount) return;
      const newWidth = currentMount.clientWidth;
      const newHeight = currentMount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', onResize);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();
    const dataArray = new Uint8Array(64);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth camera tilt towards mouse
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      particleSystem.rotation.y = elapsedTime * 0.2 + mouseX;
      particleSystem.rotation.x = mouseY * 0.5;
      ring.rotation.z = -elapsedTime * 0.15;
      ring.rotation.y = mouseX * 0.3;

      // Audio Frequency Displacement
      let audioKick = 0;
      if (isPlaying && analyserRef?.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < 16; i++) sum += dataArray[i];
        audioKick = (sum / 16 / 255) * 4;
      }

      const pos = geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];

        // Perlin-like mathematical ripple
        const wave = Math.sin(ox * 0.4 + elapsedTime * 2) * Math.cos(oy * 0.4 + elapsedTime * 2) * 0.8;
        const reactiveMultiplier = 1 + (audioKick > 0 ? (audioKick * 0.4) : (Math.sin(elapsedTime * 3) * 0.08));

        pos[i * 3] = ox * reactiveMultiplier + (ox / radius) * wave;
        pos[i * 3 + 1] = oy * reactiveMultiplier + (oy / radius) * wave;
        pos[i * 3 + 2] = oz * reactiveMultiplier + (oz / radius) * wave;
      }
      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, [isPlaying, analyserRef]);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none bg-radial from-purple-600/10 via-transparent to-transparent blur-2xl" />
    </div>
  );
}
