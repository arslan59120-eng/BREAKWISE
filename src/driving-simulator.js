
import * as THREE from "three";

/* =========================================
   BRAKEWISE — 3D DRIVING ENVIRONMENT
   Sports Car + Test Track + Chase Camera
========================================= */

const viewer = document.getElementById("bw-driving-viewer");

if (viewer && !viewer.dataset.initialized) {
    viewer.dataset.initialized = "true";

    let scene;
    let camera;
    let renderer;
    let car;
    let wheels = [];
    let brakeParts = [];
    let roadLines = [];
    let roadObjects = [];

    let autoTime = 0;

    // LEFT AND RIGHT STEERING
const steeringKeys = new Set();

window.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();

    if (["a", "d", "arrowleft", "arrowright"].includes(key)) {
        event.preventDefault();
        steeringKeys.add(key);
    }
});

window.addEventListener("keyup", event => {
    steeringKeys.delete(event.key.toLowerCase());
});

window.addEventListener("blur", () => {
    steeringKeys.clear();
});

    const drivingState = {
        speed: 0,
        brakePressure: 0,
        wheelSlip: 0,
        absActive: false,
        valveMode: "BUILD"
    };

    const clock = new THREE.Clock();

    /* =========================================
       MATERIALS
    ========================================= */


/* =========================================
   PROCEDURAL ASPHALT ROAD TEXTURE
========================================= */

function createAsphaltTexture() {

    const asphaltCanvas = document.createElement("canvas");

    asphaltCanvas.width = 512;
    asphaltCanvas.height = 2048;

    const asphaltContext = asphaltCanvas.getContext("2d");

    // Base asphalt surface
    asphaltContext.fillStyle = "#252d35";

    asphaltContext.fillRect(
        0,
        0,
        asphaltCanvas.width,
        asphaltCanvas.height
    );

    // Fine asphalt aggregate
    for (let i = 0; i < 14000; i++) {

        const x = Math.random() * asphaltCanvas.width;
        const y = Math.random() * asphaltCanvas.height;

        const size = Math.random() * 2 + 0.3;
        const brightness = Math.floor(
            65 + Math.random() * 65
        );

        asphaltContext.fillStyle =
            `rgba(${brightness}, ${brightness + 5}, ${brightness + 10}, 0.28)`;

        asphaltContext.beginPath();

        asphaltContext.arc(
            x,
            y,
            size,
            0,
            Math.PI * 2
        );

        asphaltContext.fill();
    }

    // Subtle tyre-wear streaks
    for (let i = 0; i < 8; i++) {

        const x = 130 + i * 35;

        asphaltContext.strokeStyle =
            "rgba(8, 12, 17, 0.13)";

        asphaltContext.lineWidth = 5;

        asphaltContext.beginPath();

        asphaltContext.moveTo(x, 0);
        asphaltContext.lineTo(x + 8, asphaltCanvas.height);

        asphaltContext.stroke();
    }

    const asphaltTexture = new THREE.CanvasTexture(
        asphaltCanvas
    );

    asphaltTexture.wrapS = THREE.RepeatWrapping;
    asphaltTexture.wrapT = THREE.RepeatWrapping;

    asphaltTexture.repeat.set(1, 12);

    asphaltTexture.colorSpace = THREE.SRGBColorSpace;

    asphaltTexture.anisotropy = 8;

    return asphaltTexture;
}

const asphaltTexture = createAsphaltTexture();


    const materials = {
        body: new THREE.MeshPhysicalMaterial({
            color: 0x08b9d5,
            metalness: 0.75,
            roughness: 0.23,
            clearcoat: 1,
            clearcoatRoughness: 0.12
        }),

        dark: new THREE.MeshStandardMaterial({
            color: 0x101820,
            metalness: 0.5,
            roughness: 0.35
        }),

        glass: new THREE.MeshPhysicalMaterial({
            color: 0x142b3a,
            metalness: 0.3,
            roughness: 0.12,
            transparent: true,
            opacity: 0.85
        }),

        tyre: new THREE.MeshStandardMaterial({
            color: 0x080b10,
            roughness: 0.85
        }),

        rim: new THREE.MeshStandardMaterial({
            color: 0xb5c5d0,
            metalness: 0.9,
            roughness: 0.2
        }),

        brake: new THREE.MeshStandardMaterial({
            color: 0x53616d,
            metalness: 0.85,
            roughness: 0.3
        }),

        orange: new THREE.MeshStandardMaterial({
            color: 0xff7028,
            emissive: 0xff4500,
            emissiveIntensity: 0.2
        }),

        
road: new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: asphaltTexture,
    roughnessMap: asphaltTexture,
    roughness: 0.96,
    metalness: 0.02
}),


        line: new THREE.MeshStandardMaterial({
            color: 0xeaf3f8,
            emissive: 0x27333d,
            roughness: 0.6
        })
    };

    /* =========================================
       INITIALIZE SCENE
    ========================================= */

    function initializeScene() {
        const width = viewer.clientWidth;
        const height = viewer.clientHeight;

        if (!width || !height) return false;

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x101923);
        scene.fog = new THREE.Fog(0x101923, 28, 115);

        camera = new THREE.PerspectiveCamera(
            55,
            width / height,
            0.1,
            250
        );

        camera.position.set(0, 4.5, 9.5);

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });

        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        );

        renderer.setSize(width, height);

        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;

        viewer.appendChild(renderer.domElement);

        addLighting();
        createRoad();
        createCar();
        createEnvironment();

        const loading = viewer.querySelector(
            ".bw-driving-loading"
        );

        if (loading) loading.remove();

        return true;
    }

    /* =========================================
       LIGHTING
    ========================================= */

    function addLighting() {
        const ambient = new THREE.HemisphereLight(
            0xc7e6ff,
            0x202a35,
            2
        );

        scene.add(ambient);

        const sunlight = new THREE.DirectionalLight(
            0xffffff,
            3
        );

        sunlight.position.set(-6, 12, 7);
        sunlight.castShadow = true;

        sunlight.shadow.mapSize.set(2048, 2048);

        scene.add(sunlight);

        const cyanLight = new THREE.PointLight(
            0x00cfff,
            35,
            24
        );

        cyanLight.position.set(-5, 3, -8);
        scene.add(cyanLight);

        const orangeLight = new THREE.PointLight(
            0xff6728,
            25,
            20
        );

        orangeLight.position.set(5, 2, -5);
        scene.add(orangeLight);
    }

    /* =========================================
       CREATE ROAD
    ========================================= */

    function createRoad() {
        const road = new THREE.Mesh(
            new THREE.PlaneGeometry(14, 180),
            materials.road
        );

        road.rotation.x = -Math.PI / 2;
        road.position.z = -65;
        road.receiveShadow = true;

        scene.add(road);

        // Road edges
        [-6.5, 6.5].forEach(x => {
            const edge = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 0.04, 180),
                materials.line
            );

            edge.position.set(x, 0.03, -65);
            scene.add(edge);
        });

        // Centre lane markings
        for (let i = 0; i < 22; i++) {
            const line = new THREE.Mesh(
                new THREE.BoxGeometry(0.16, 0.035, 3.2),
                materials.line
            );

            line.position.set(0, 0.045, 5 - i * 8);
            scene.add(line);

            roadLines.push(line);
        }

        // Side road markings
        [-3.5, 3.5].forEach(x => {
            const sideLine = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 0.035, 180),
                materials.line
            );

            sideLine.position.set(x, 0.04, -65);
            scene.add(sideLine);
        });

        // Roadside barriers
        [-7.2, 7.2].forEach(x => {
            const barrier = new THREE.Mesh(
                new THREE.BoxGeometry(0.35, 0.65, 180),
                materials.dark
            );

            barrier.position.set(x, 0.35, -65);
            barrier.castShadow = true;
            scene.add(barrier);
        });

        // Ground
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(250, 250),
            new THREE.MeshStandardMaterial({
                color: 0x17232a,
                roughness: 1
            })
        );

        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.12;
        ground.position.z = -65;

        scene.add(ground);
    }

    /* =========================================
       CREATE SPORTS CAR
    ========================================= */

    function createCar() {
        car = new THREE.Group();

        // Main body
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(2.15, 0.55, 4.2),
            materials.body
        );

        body.position.y = 0.85;
        body.castShadow = true;
        car.add(body);

        // Front hood
        const hood = new THREE.Mesh(
            new THREE.BoxGeometry(2.05, 0.18, 1.2),
            materials.body
        );

        hood.position.set(0, 1.12, -1.3);
        car.add(hood);

        // Cabin
        const cabin = new THREE.Mesh(
            new THREE.BoxGeometry(1.65, 0.72, 1.8),
            materials.glass
        );

        cabin.position.set(0, 1.43, 0.15);
        car.add(cabin);

        // Roof
        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(1.55, 0.12, 1.45),
            materials.body
        );

        roof.position.set(0, 1.83, 0.15);
        car.add(roof);

        // Front bumper
        const bumper = new THREE.Mesh(
            new THREE.BoxGeometry(2.1, 0.2, 0.22),
            materials.dark
        );

        bumper.position.set(0, 0.62, -2.08);
        car.add(bumper);

        // Rear spoiler
        const spoiler = new THREE.Mesh(
            new THREE.BoxGeometry(2.05, 0.1, 0.35),
            materials.dark
        );

        spoiler.position.set(0, 1.42, 2.05);
        car.add(spoiler);

        // Headlights
        [-0.72, 0.72].forEach(x => {
            const light = new THREE.Mesh(
                new THREE.BoxGeometry(0.42, 0.13, 0.06),
                new THREE.MeshBasicMaterial({
                    color: 0xd9f5ff
                })
            );

            light.position.set(x, 1.02, -2.12);
            car.add(light);
        });

        // Rear lights
        [-0.75, 0.75].forEach(x => {
            const light = new THREE.Mesh(
                new THREE.BoxGeometry(0.45, 0.12, 0.06),
                new THREE.MeshBasicMaterial({
                    color: 0xff241c
                })
            );

            light.position.set(x, 1.02, 2.12);
            car.add(light);
        });

        // Wheels
        const wheelPositions = [
            [-1.08, 0.55, -1.35],
            [1.08, 0.55, -1.35],
            [-1.08, 0.55, 1.35],
            [1.08, 0.55, 1.35]
        ];

        wheelPositions.forEach(position => {
            const wheel = new THREE.Group();

            const tyre = new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.48, 0.48, 0.28, 32
                ),
                materials.tyre
            );

            tyre.rotation.z = Math.PI / 2;
            tyre.castShadow = true;
            wheel.add(tyre);

            const rim = new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.29, 0.29, 0.3, 24
                ),
                materials.rim
            );

            rim.rotation.z = Math.PI / 2;
            wheel.add(rim);

            const disc = new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.23, 0.23, 0.31, 24
                ),
                materials.brake
            );

            disc.rotation.z = Math.PI / 2;
            wheel.add(disc);

            const caliper = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 0.36, 0.2),
                materials.orange
            );

            caliper.position.set(0, 0.12, 0.22);
            wheel.add(caliper);

            brakeParts.push(caliper);

            wheel.position.set(...position);
            car.add(wheel);

            wheels.push(wheel);
        });

        car.position.set(0, 0, 0);

        scene.add(car);
    }

    /* =========================================
       ENVIRONMENT DETAILS
    ========================================= */

    function createEnvironment() {
        for (let i = 0; i < 18; i++) {
            const z = -i * 10 - 8;

            [-9, 9].forEach(x => {
                const pole = new THREE.Mesh(
                    new THREE.CylinderGeometry(
                        0.08, 0.1, 4, 8
                    ),
                    materials.dark
                );

                pole.position.set(x, 2, z);
                scene.add(pole);

                const lamp = new THREE.PointLight(
                    0x43cfff,
                    8,
                    10
                );

                lamp.position.set(x, 4, z);
                scene.add(lamp);

                roadObjects.push({
                    pole,
                    lamp,
                    originalZ: z
                });
            });
        }
    }

    /* =========================================
       UPDATE FROM EXISTING SIMULATOR
    ========================================= */

    window.addEventListener("bw:sim-update", event => {
        const data = event.detail || {};

        drivingState.speed = data.speed || 0;
        drivingState.brakePressure =
            data.brakePressure || 0;

        drivingState.wheelSlip = data.wheelSlip || 0;
        drivingState.absActive = Boolean(data.absActive);
        drivingState.valveMode = data.valveMode || "BUILD";
    });

    /* =========================================
       ANIMATE ROAD AND CAR
    ========================================= */

    function updateScene(delta) {
        if (!car) return;

        const speedFactor = drivingState.speed / 180;

        autoTime += delta;

        // CAR STEERING AND ROAD BOUNDARIES
let steeringDirection = 0;

if (steeringKeys.has("a") || steeringKeys.has("arrowleft")) {
    steeringDirection -= 1;
}

if (steeringKeys.has("d") || steeringKeys.has("arrowright")) {
    steeringDirection += 1;
}

car.position.x += steeringDirection * 5 * delta;

// Keep the car safely inside the barriers
car.position.x = THREE.MathUtils.clamp(
    car.position.x,
    -5.3,
    5.3
);

// Slight turning effect
car.rotation.y = THREE.MathUtils.lerp(
    car.rotation.y,
    -steeringDirection * 0.08,
    1 - Math.exp(-5 * delta)
);

        // Moving road markings
        roadLines.forEach(line => {
            line.position.z += speedFactor * delta * 45;

            if (line.position.z > 8) {
                line.position.z -= 176;
            }
        });

        // Move roadside lights
        roadObjects.forEach(object => {
            object.pole.position.z +=
                speedFactor * delta * 45;

            object.lamp.position.z =
                object.pole.position.z + 2;

            if (object.pole.position.z > 8) {
                object.pole.position.z -= 180;
                object.lamp.position.z =
                    object.pole.position.z + 2;
            }
        });

        // Wheel rotation
        wheels.forEach(wheel => {
            wheel.rotation.x -= speedFactor * delta * 8;
        });

        // Gentle vehicle movement
        car.position.y =
            Math.sin(autoTime * 7) * 0.012 * speedFactor;

        // Brake components illuminate during braking
        const braking = drivingState.brakePressure > 2;

        brakeParts.forEach(part => {
            part.material.emissiveIntensity =
                braking ? 1.8 : 0.2;

            part.material.color.set(
                braking ? 0xff4b1f : 0xff7028
            );
        });

        // Chase camera
        const targetCameraPosition = new THREE.Vector3(
            car.position.x,
            4.2,
            9.5
        );

        camera.position.lerp(
            targetCameraPosition,
            1 - Math.exp(-3 * delta)
        );

        camera.lookAt(
            car.position.x,
            0.9,
            -2.5
        );
    }

    /* =========================================
       RESIZE
    ========================================= */

    function resizeScene() {
        if (!renderer || !camera) return;

        const width = viewer.clientWidth;
        const height = viewer.clientHeight;

        if (!width || !height) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    }

    const resizeObserver = new ResizeObserver(resizeScene);
    resizeObserver.observe(viewer);

    window.addEventListener("resize", resizeScene);

    /* =========================================
       START WHEN LAB BECOMES VISIBLE
    ========================================= */

    function startWhenVisible() {
        if (!renderer) {
            if (viewer.clientWidth > 0 && viewer.clientHeight > 0) {
                initializeScene();
            }
        }

        if (renderer) {
            const delta = Math.min(clock.getDelta(), 0.05);

            updateScene(delta);
            renderer.render(scene, camera);
        }

        requestAnimationFrame(startWhenVisible);
    }

    requestAnimationFrame(startWhenVisible);
}
