
import * as THREE from "three";

import { OrbitControls } from
    "three/addons/controls/OrbitControls.js";

import { GLTFLoader } from
    "three/addons/loaders/GLTFLoader.js";

import "./car-showcase.css";


/* =========================================
   1. ELEMENTS
========================================= */

const viewer = document.getElementById("bw-car-viewer");

if (viewer && !viewer.dataset.initialized) {

    viewer.dataset.initialized = "true";

    const loading = viewer.querySelector(".bw-loading");

    let scene;
    let camera;
    let renderer;
    let controls;
    let carModel;
    let animationFrame;

    let autoRotate = true;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    /* =========================================
       2. COMPONENT INFORMATION
    ========================================= */

    const components = {

        sensor: {
            name: "Wheel Speed Sensor",

            description:
                "Monitors the rotational speed of individual wheels and sends speed information to the ABS control unit.",

            function:
                "Detects changes in wheel speed to help identify possible wheel lockup.",

            location:
                "Near each wheel, positioned to read its rotation."
        },

        brakes: {
            name: "Brake Disc & Caliper",

            description:
                "The brake disc rotates with the wheel while the caliper holds the brake pads.",

            function:
                "The brake pads press against the rotating disc to create friction and slow the vehicle.",

            location:
                "At each wheel assembly."
        },

        module: {
            name: "ABS Hydraulic Module",

            description:
                "The hydraulic module contains valves and a pump that help regulate brake fluid pressure.",

            function:
                "Adjusts brake pressure when the ABS detects a possible wheel lockup.",

            location:
                "Usually installed in the engine compartment."
        },

        ecu: {
            name: "ABS Control Unit",

            description:
                "The electronic control unit processes wheel-speed information and manages ABS operation.",

            function:
                "Determines when brake pressure needs to be adjusted and controls the hydraulic module.",

            location:
                "Connected to the ABS hydraulic system."
        }

    };


    /* =========================================
       3. COMPONENT SELECTION
    ========================================= */

    const componentButtons = document.querySelectorAll(
    "button[data-component]"
);

    const componentName = document.getElementById(
        "bw-component-name"
    );

    const componentDescription = document.getElementById(
        "bw-component-description"
    );

    const componentFunction = document.getElementById(
        "bw-component-function"
    );

    const componentLocation = document.getElementById(
        "bw-component-location"
    );


    function selectComponent(key) {

        const component = components[key];

        if (!component) return;

        componentName.textContent = component.name;

        componentDescription.textContent =
            component.description;

        componentFunction.textContent =
            component.function;

        componentLocation.textContent =
            component.location;

        componentButtons.forEach(button => {

            const isSelected =
                button.dataset.component === key;

            button.classList.toggle(
                "active",
                isSelected
            );

        });

    }


    componentButtons.forEach(button => {

        button.addEventListener("click", () => {

            selectComponent(button.dataset.component);

        });

    });


    /* =========================================
       4. THREE.JS SCENE
    ========================================= */

    function initScene() {

        scene = new THREE.Scene();

        scene.background = null;


        /* CAMERA */

        camera = new THREE.PerspectiveCamera(
            38,
            viewer.clientWidth / viewer.clientHeight,
            0.1,
            100
        );

        camera.position.set(6, 3.5, 7);


        /* RENDERER */

        renderer = new THREE.WebGLRenderer({

            antialias: true,

            alpha: true,

            powerPreference: "high-performance"

        });

        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        );

        renderer.setSize(
            viewer.clientWidth,
            viewer.clientHeight
        );

        renderer.outputColorSpace = THREE.SRGBColorSpace;

        renderer.toneMapping = THREE.ACESFilmicToneMapping;

        renderer.toneMappingExposure = 1.15;

        renderer.shadowMap.enabled = true;

        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        viewer.appendChild(renderer.domElement);


        /* LIGHTING */

        const ambientLight = new THREE.HemisphereLight(
            0xffffff,
            0x202632,
            2.0
        );

        scene.add(ambientLight);


        const keyLight = new THREE.DirectionalLight(
            0xffffff,
            3.5
        );

        keyLight.position.set(5, 8, 6);

        keyLight.castShadow = true;

        scene.add(keyLight);


        const fillLight = new THREE.DirectionalLight(
            0xff713d,
            2.5
        );

        fillLight.position.set(-6, 3, -4);

        scene.add(fillLight);


        const rimLight = new THREE.PointLight(
            0xff713d,
            35,
            15
        );

        rimLight.position.set(0, 3, -5);

        scene.add(rimLight);


        /* FLOOR */

        const floor = new THREE.Mesh(

            new THREE.CircleGeometry(8, 80),

            new THREE.MeshStandardMaterial({

                color: 0x171e28,

                roughness: 0.38,

                metalness: 0.45

            })

        );

        floor.rotation.x = -Math.PI / 2;

        floor.position.y = -0.035;

        floor.receiveShadow = true;

        scene.add(floor);


        /* ORANGE DISPLAY RING */

        const ring = new THREE.Mesh(

            new THREE.TorusGeometry(3.2, 0.012, 12, 120),

            new THREE.MeshBasicMaterial({

                color: 0xff6b2c,

                transparent: true,

                opacity: 0.65

            })

        );

        ring.rotation.x = Math.PI / 2;

        ring.position.y = 0.015;

        scene.add(ring);


        /* ORBIT CONTROLS */

        controls = new OrbitControls(
            camera,
            renderer.domElement
        );

        controls.enableDamping = true;

        controls.dampingFactor = 0.055;

        controls.enablePan = false;

        controls.minDistance = 4;

        controls.maxDistance = 12;

        controls.maxPolarAngle = Math.PI / 2.05;

        controls.minPolarAngle = 0.35;

        controls.target.set(0, 0.65, 0);

        controls.autoRotate = !reducedMotion;

        controls.autoRotateSpeed = 0.65;


        /* LOAD CAR */

        loadCar();


        /* RESET CAMERA */

        document.getElementById(
            "bw-reset-view"
        )?.addEventListener("click", () => {

            camera.position.set(6, 3.5, 7);

            controls.target.set(0, 0.65, 0);

            controls.update();

        });


        /* AUTO ROTATION */

        const autoButton = document.getElementById(
            "bw-auto-rotate"
        );

        if (reducedMotion) {

            autoRotate = false;

            autoButton.textContent = "AUTO ROTATE: OFF";

        }

        autoButton?.addEventListener("click", () => {

            autoRotate = !autoRotate;

            controls.autoRotate = autoRotate;

            autoButton.textContent =
                `AUTO ROTATE: ${autoRotate ? "ON" : "OFF"}`;

        });


        /* RESIZE */

        const resizeObserver = new ResizeObserver(() => {

            if (!renderer || !camera) return;

            const width = viewer.clientWidth;

            const height = viewer.clientHeight;

            if (!width || !height) return;

            camera.aspect = width / height;

            camera.updateProjectionMatrix();

            renderer.setSize(width, height);

        });

        resizeObserver.observe(viewer);


        /* ANIMATION */

        function animate() {

            animationFrame = requestAnimationFrame(animate);

            controls.update();

            renderer.render(scene, camera);

        }

        animate();

    }


    /* =========================================
       5. LOAD HYPERCAR MODEL
    ========================================= */

    function loadCar() {

        const loader = new GLTFLoader();

        const modelURL =
            "https://raw.githubusercontent.com/drcollect/collect-cars/main/models/full/hypercar.glb";

        loader.load(

            modelURL,

            (gltf) => {

                carModel = gltf.scene;

                /* ENABLE MODEL SHADOWS */

                carModel.traverse((object) => {

                    if (object.isMesh) {

                        object.castShadow = true;

                        object.receiveShadow = true;

                        if (object.material) {

                            object.material.envMapIntensity = 1.2;

                        }

                    }

                });


                /* CENTER AND SCALE MODEL */

const box = new THREE.Box3().setFromObject(carModel);

const center = box.getCenter(new THREE.Vector3());
const size = box.getSize(new THREE.Vector3());

const maxDimension = Math.max(
    size.x,
    size.y,
    size.z
);

const scale = 5.5 / maxDimension;

// Scale the model first.
carModel.scale.setScalar(scale);

// Center the scaled model and place its bottom at ground level.
carModel.position.set(
    -center.x * scale,
    -center.y * scale + (size.y * scale) / 2,
    -center.z * scale
);


                /* DISPLAY ANGLE */

                carModel.rotation.y = 0.55;

                scene.add(carModel);


                /* REMOVE LOADING MESSAGE */

                if (loading) {

                    loading.style.opacity = "0";

                    setTimeout(() => {

                        loading.remove();

                    }, 350);

                }

            },

            undefined,

            (error) => {

                console.error(
                    "BRAKEWISE car model failed to load:",
                    error
                );

                if (loading) {

                    loading.innerHTML = `
                        <p>Unable to load the 3D car.</p>
                        <small>Check your internet connection and refresh.</small>
                    `;

                }

            }

        );

    }


    /* =========================================
       6. START
    ========================================= */

    initScene();

    selectComponent("sensor");

}
