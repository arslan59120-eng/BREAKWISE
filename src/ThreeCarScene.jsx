import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeCarScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#08131d");
    scene.fog = new THREE.Fog("#08131d", 13, 35);

    const camera = new THREE.PerspectiveCamera(
      42,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(7, 5, 9);
    camera.lookAt(0, 0.8, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xb9e4ff, 0x18212b, 2.0));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 9, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const cyanLight = new THREE.PointLight(0x00d9ff, 18, 16);
    cyanLight.position.set(-5, 3, -3);
    scene.add(cyanLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: "#101e2a", roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.04;
    floor.receiveShadow = true;
    scene.add(floor);

    // Road platform and subtle lane markings.
    const road = new THREE.Mesh(
      new THREE.BoxGeometry(14, 0.12, 5.5),
      new THREE.MeshStandardMaterial({ color: "#263440", roughness: 0.85 })
    );
    road.position.y = 0.02;
    road.receiveShadow = true;
    scene.add(road);

    const stripeMaterial = new THREE.MeshBasicMaterial({ color: "#d6e6ed" });
    for (let x = -5.5; x <= 5.5; x += 2.2) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.015, 0.07), stripeMaterial);
      stripe.position.set(x, 0.09, 0);
      scene.add(stripe);
    }

    const car = new THREE.Group();
    scene.add(car);

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: "#00bcd4", metalness: 0.55, roughness: 0.28
    });
    const darkMaterial = new THREE.MeshStandardMaterial({
      color: "#14232e", metalness: 0.35, roughness: 0.25
    });
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: "#75c9df", metalness: 0.3, roughness: 0.16,
      transparent: true, opacity: 0.78
    });
    const tireMaterial = new THREE.MeshStandardMaterial({ color: "#080c10", roughness: 0.92 });
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: "#b9d2dc", metalness: 0.8, roughness: 0.22
    });

    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.65, 1.55), bodyMaterial);
    lowerBody.position.y = 0.75;
    lowerBody.castShadow = true;
    car.add(lowerBody);

    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.22, 1.48), bodyMaterial);
    hood.position.set(1.18, 1.08, 0);
    hood.castShadow = true;
    car.add(hood);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.72, 1.25), glassMaterial);
    cabin.position.set(-0.25, 1.38, 0);
    cabin.castShadow = true;
    car.add(cabin);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.12, 1.28), darkMaterial);
    roof.position.set(-0.28, 1.78, 0);
    car.add(roof);

    // Wheels are placed on both sides of the car.
    const wheels = [];
    for (const x of [-1.12, 1.12]) {
      for (const z of [-0.82, 0.82]) {
        const wheel = new THREE.Group();
        wheel.position.set(x, 0.48, z);
        const tire = new THREE.Mesh(
          new THREE.CylinderGeometry(0.43, 0.43, 0.24, 32),
          tireMaterial
        );
        tire.rotation.x = Math.PI / 2;
        tire.castShadow = true;
        wheel.add(tire);

        const rim = new THREE.Mesh(
          new THREE.CylinderGeometry(0.23, 0.23, 0.255, 24),
          rimMaterial
        );
        rim.rotation.x = Math.PI / 2;
        wheel.add(rim);
        car.add(wheel);
        wheels.push(wheel);
      }
    }

    const headlightMaterial = new THREE.MeshStandardMaterial({
      color: "#e8fbff", emissive: "#8deaff", emissiveIntensity: 2
    });
    for (const z of [-0.48, 0.48]) {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.28), headlightMaterial);
      lamp.position.set(1.78, 0.91, z);
      car.add(lamp);
    }

    car.rotation.y = -0.22;

    let frameId;
    let pointerDown = false;
    let previousX = 0;

    const onPointerDown = (event) => {
      pointerDown = true;
      previousX = event.clientX;
    };
    const onPointerMove = (event) => {
      if (!pointerDown) return;
      const delta = event.clientX - previousX;
      car.rotation.y += delta * 0.008;
      previousX = event.clientX;
    };
    const onPointerUp = () => { pointerDown = false; };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const resizeObserver = new ResizeObserver(() => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(mount);

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      car.position.y = 0.04 + Math.sin(performance.now() * 0.0018) * 0.025;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="three-car-wrap">
      <div className="three-car-heading">
        <div>
          <p className="eyebrow">3D VISUAL LAB / THREE.JS</p>
          <h3>Explore the vehicle.</h3>
        </div>
        <span className="three-car-hint">DRAG TO ROTATE</span>
      </div>
      <div className="three-car-canvas" ref={mountRef} aria-label="Interactive 3D car model" />
      <p className="three-car-caption">
        A starter 3D scene built with Three.js. Drag across the model to view it from different angles.
      </p>
    </div>
  );
}
