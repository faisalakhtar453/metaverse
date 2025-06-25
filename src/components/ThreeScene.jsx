import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function ThreeScene({ objects }) {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;

        // Clear previous scene
        if (mount.hasChildNodes()) {
            mount.innerHTML = '';
        }

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1e1e1e); // Subtle dark background

        const camera = new THREE.PerspectiveCamera(
            75,
            mount.clientWidth / mount.clientHeight,
            0.1,
            1000
        );
        camera.position.set(10, 10, 20);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.shadowMap.enabled = true;
        mount.appendChild(renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Grid helper
        const gridHelper = new THREE.GridHelper(100, 50);
        scene.add(gridHelper);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        const spacing = 2; // additional space between objects
        const rowLimit = 5; // max number of objects per row

        objects.forEach((obj, idx) => {
            const geometry = new THREE.BoxGeometry(obj.w, obj.h, obj.d);
            const color = new THREE.Color(`hsl(${(idx * 60) % 360}, 100%, 50%)`);
            const material = new THREE.MeshStandardMaterial({
                color,
                metalness: 0.3,
                roughness: 0.5,
            });

            const cube = new THREE.Mesh(geometry, material);
            cube.castShadow = true;
            cube.receiveShadow = true;

            // Arrange in a grid (X-Z plane), stacking objects next to each other
            const row = Math.floor(idx / rowLimit);
            const col = idx % rowLimit;

            const x = col * (obj.w + spacing);
            const y = obj.h / 2; // so the box sits on the grid
            const z = row * (obj.d + spacing);

            cube.position.set(x, y, z);
            scene.add(cube);
        });


        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
            renderer.dispose();
            mount.removeChild(renderer.domElement);
        };
    }, [objects]);

    return (
        <div
            ref={mountRef}
            style={{
                width: '100%',
                height: '500px',
                background: '#1e1e1e',
                borderRadius: '8px',
                boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)',
                marginTop: '1rem',
                overflow: 'hidden'
            }}
        />
    );
}
