
/* =========================================
   BRAKEWISE — COMPLETE GAME SIMULATOR
   Live ABS Components + Automatic Test System
   Separate Game Mode Screen
   Locked Automatic Tests + Fair Distance Tracking
========================================= */


/* =========================================
   1. HTML ELEMENTS
========================================= */

const homeScreen = document.getElementById("homeScreen");
const labScreen = document.getElementById("labScreen");

// TUTORIAL SCREEN
const tutorialScreen = document.getElementById("tutorialScreen");

const tutorialPages = [
    document.getElementById("tutorialPage1"),
    document.getElementById("tutorialPage2"),
    document.getElementById("tutorialPage3"),
    document.getElementById("tutorialPage4"),
    document.getElementById("tutorialPage5")
];

const tutorialPrevButton =
    document.getElementById("tutorialPrevButton");

const tutorialNextButton =
    document.getElementById("tutorialNextButton");

const tutorialDoneButton =
    document.getElementById("tutorialDoneButton");

const tutorialPageIndicator =
    document.getElementById("tutorialPageIndicator");

const tutorialProgressFill =
    document.getElementById("tutorialProgressFill");

const tutorialDots =
    document.querySelectorAll(".tutorial-dot");

let currentTutorialPage = 0;

const backButton = document.getElementById("backButton");
const resetButton = document.getElementById("resetDrive");
const fullscreenButton = document.getElementById("fullscreenButton");

// SEPARATE GAME MODE ELEMENTS
const gameModeScreen = document.getElementById("gameModeScreen");
const exitGameModeButton = document.getElementById("exitGameModeButton");

const gameHudSlot = document.getElementById("gameHudSlot");
const gameRoadSlot = document.getElementById("gameRoadSlot");
const gameAbsSlot = document.getElementById("gameAbsSlot");
const gameControlsSlot = document.getElementById("gameControlsSlot");

// ORIGINAL POSITIONS
const gameHudHome = document.getElementById("gameHudHome");
const gameRoadHome = document.getElementById("gameRoadHome");
const gameAbsHome = document.getElementById("gameAbsHome");
const gameControlsHome = document.getElementById("gameControlsHome");

// ELEMENTS THAT MOVE BETWEEN SCREENS
const gameHud = document.querySelector(".game-hud");
const gameRoad = document.querySelector(".game-scene-panel");
const gameAbs = document.querySelector(".game-settings");
const gameControls = document.querySelector(".game-controls");

const canvas = document.getElementById("roadCanvas");
const ctx = canvas.getContext("2d");

const throttleInput = document.getElementById("throttle");
const brakeInput = document.getElementById("brake");
const absToggle = document.getElementById("absToggle");

const accelerateButton = document.getElementById("gameAccelerate");
const brakeButton = document.getElementById("gameBrake");

const speedValue = document.getElementById("speedValue");
const pressureValue = document.getElementById("pressureValue");
const slipValue = document.getElementById("slipValue");
const distanceValue = document.getElementById("distanceValue");

const speedMeter = document.getElementById("speedMeter");
const pressureMeter = document.getElementById("pressureMeter");
const slipMeter = document.getElementById("slipMeter");

const throttleReadout = document.getElementById("throttleReadout");
const brakeReadout = document.getElementById("brakeReadout");

const driveState = document.getElementById("driveState");

const systemMessage = document.getElementById("systemMessage");
const systemExplanation = document.getElementById("systemExplanation");

const valveState = document.getElementById("valveState");
const cycleFill = document.getElementById("cycleFill");

const releaseStep = document.getElementById("releaseStep");
const holdStep = document.getElementById("holdStep");
const buildStep = document.getElementById("buildStep");

const componentName = document.getElementById("componentName");
const componentDescription = document.getElementById("componentDescription");

const absStatusText = document.getElementById("absStatusText");

const liveComponents = {
    sensor: {
        box: document.getElementById("liveSensor"),
        status: document.getElementById("sensorStatus")
    },
    ecu: {
        box: document.getElementById("liveECU"),
        status: document.getElementById("ecuStatus")
    },
    modulator: {
        box: document.getElementById("liveModulator"),
        status: document.getElementById("modulatorStatus")
    },
    brakes: {
        box: document.getElementById("liveBrakes"),
        status: document.getElementById("brakesStatus")
    }
};

const componentLiveMessage =
    document.getElementById("componentLiveMessage");

// TEST CENTRE
const runAbsTestButton = document.getElementById("runAbsTest");
const runNoAbsTestButton = document.getElementById("runNoAbsTest");
const clearTestResultsButton = document.getElementById("clearTestResults");

const testStatus = document.getElementById("testStatus");
const testResultSummary = document.getElementById("testResultSummary");

// TEST RESULTS POPUP
const testResultPopup = document.getElementById("testResultPopup");

const popupTestTitle = document.getElementById("popupTestTitle");
const popupDistance = document.getElementById("popupDistance");
const popupTotalDistance = document.getElementById("popupTotalDistance");
const popupTime = document.getElementById("popupTime");
const popupSlip = document.getElementById("popupSlip");
const popupFinalSpeed = document.getElementById("popupFinalSpeed");

const submitTestResultsButton =
    document.getElementById("submitTestResults");

const discardTestResultsButton =
    document.getElementById("discardTestResults");

// Results waiting for user submission
let pendingTestResult = null;

const testResults = {
    abs: {
        distance: document.getElementById("absDistanceResult"),
        time: document.getElementById("absTimeResult"),
        slip: document.getElementById("absSlipResult"),
        finalSpeed: document.getElementById("absFinalSpeedResult")
    },
    noAbs: {
        distance: document.getElementById("noAbsDistanceResult"),
        time: document.getElementById("noAbsTimeResult"),
        slip: document.getElementById("noAbsSlipResult"),
        finalSpeed: document.getElementById("noAbsFinalSpeedResult")
    }
};


/* =========================================
   2. SIMULATION VARIABLES
========================================= */

let speed = 0;
let wheelSpeed = 0;

let distance = 0;
let carX = 250;
let sceneryOffset = 0;

let brakePressure = 0;
let wheelSlip = 0;

let valveMode = "BUILD";
let valveTimer = 0;

let previousTime = 0;
let simulationAccumulator = 0;

const FIXED_STEP = 1 / 60;
let simulationRunning = false;

const MAX_SPEED = 180;

// SIMULATED ROAD-TYRE GRIP
// 0.90 represents a dry asphalt surface in this model.
const ROAD_FRICTION = 0.90;
const GRAVITY = 9.81;

// Simplified road-grip coefficient.
// Lower grip means less tyre traction during braking.
const ROAD_GRIP = 0.85;
const pressedKeys = new Set();

// FIXED TEST CONDITIONS
const TEST_START_SPEED = 100;
const TEST_TRAVEL_DISTANCE = 500;
const TEST_BRAKE_INPUT = 0.5;

// Maximum physics step prevents unstable large updates.
const TEST_STEP_LIMIT = 0.05;

// Gradual acceleration.
// This gives approximately 3.04 m/s² acceleration.
const TEST_ACCELERATOR_INPUT = 0.65;

// Normal time progression.
// No artificial speed multiplier.
const TEST_SPEED_MULTIPLIER = 1;

const testData = {
    abs: null,
    noAbs: null
};

let activeTest = null;

/* =========================================
   NORMAL DRIVE RESULTS
========================================= */

const driveResultsToggle =
    document.getElementById("driveResultsToggle");

let driveResultsEnabled = true;

let normalDrive = {
    hasDriven: false,
    wasMoving: false,
    startDistance: 0,
    driveTime: 0,
    maximumSpeed: 0,
    maximumSlip: 0,
    braking: false,
    brakingStartDistance: 0,
    brakingDistance: 0
};

function updateDriveResultsToggle() {
    if (!driveResultsToggle) return;

    driveResultsToggle.textContent =
        `DRIVE RESULTS: ${driveResultsEnabled ? "ON" : "OFF"}`;

    driveResultsToggle.classList.toggle(
        "active",
        driveResultsEnabled
    );

    driveResultsToggle.setAttribute(
        "aria-pressed",
        String(driveResultsEnabled)
    );
}

driveResultsToggle?.addEventListener("click", () => {
    if (activeTest) return;

    driveResultsEnabled = !driveResultsEnabled;

    updateDriveResultsToggle();
});


/* =========================================
   3. SCREEN NAVIGATION + TUTORIAL
========================================= */

const startButton = document.getElementById("startButton");

const experienceButton = document.querySelector(
    ".home-cta-section .primary-button"
);

// Switch between the three main screens
function showScreen(screen) {

    homeScreen.classList.add("hidden");
    tutorialScreen.classList.add("hidden");
    labScreen.classList.add("hidden");

    screen.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// UPDATE TUTORIAL PAGE
function updateTutorialPage() {

    tutorialPages.forEach((page, index) => {

        if (!page) return;

        page.classList.toggle(
            "active",
            index === currentTutorialPage
        );
    });

    // Page indicator
    if (tutorialPageIndicator) {
        tutorialPageIndicator.textContent =
            `PAGE ${currentTutorialPage + 1} OF 5`;
    }

    // Progress bar
    if (tutorialProgressFill) {
        tutorialProgressFill.style.width =
            `${((currentTutorialPage + 1) / 5) * 100}%`;
    }

    // Progress dots
    tutorialDots.forEach((dot, index) => {

        dot.classList.toggle(
            "active",
            index === currentTutorialPage
        );

        dot.classList.toggle(
            "completed",
            index < currentTutorialPage
        );
    });

    // Previous button
    tutorialPrevButton.disabled =
        currentTutorialPage === 0;

    // Show DONE only on the final page
    tutorialNextButton.classList.toggle(
        "hidden",
        currentTutorialPage === 4
    );

    tutorialDoneButton.classList.toggle(
        "hidden",
        currentTutorialPage !== 4
    );
}


// START TUTORIAL
function startTutorial() {

    currentTutorialPage = 0;

    updateTutorialPage();

    showScreen(tutorialScreen);
}


// START DEMONSTRATION BUTTON
startButton.addEventListener("click", startTutorial);


// START YOUR EXPERIENCE BUTTON
experienceButton?.addEventListener("click", startTutorial);


// NEXT BUTTON
tutorialNextButton.addEventListener("click", () => {

    if (currentTutorialPage >= 4) return;

    currentTutorialPage++;

    updateTutorialPage();
});


// PREVIOUS BUTTON
tutorialPrevButton.addEventListener("click", () => {

    if (currentTutorialPage <= 0) return;

    currentTutorialPage--;

    updateTutorialPage();
});


// DONE BUTTON — ENTER DRIVING LAB
tutorialDoneButton.addEventListener("click", () => {

    showScreen(labScreen);

    simulationRunning = true;

    previousTime = 0;
    simulationAccumulator = 0;

    drawScene();
});


// RETURN TO HOME FROM DRIVING LAB
backButton.addEventListener("click", () => {

    if (activeTest) return;

    closeGameMode();

    simulationRunning = false;

    showScreen(homeScreen);

    restoreTestControls();
});


// CLICKABLE TUTORIAL PROGRESS DOTS
tutorialDots.forEach((dot, index) => {

    dot.style.cursor = "pointer";

    dot.addEventListener("click", () => {

        currentTutorialPage = index;

        updateTutorialPage();
    });
});


// Initialize tutorial display
updateTutorialPage();


/* =========================================
   4. INPUT CONTROLS
========================================= */

throttleInput.addEventListener("input", () => {

    if (activeTest) return;

    throttleReadout.textContent =
        throttleInput.value + "%";
});

brakeInput.addEventListener("input", () => {

    if (activeTest) return;

    brakeReadout.textContent =
        brakeInput.value + "%";
});

function setControlValue(input, value) {

    if (!input || activeTest) return;

    input.value = value;

    input.dispatchEvent(
        new Event("input", { bubbles: true })
    );
}


/* =========================================
   5. ON-SCREEN PEDAL BUTTONS
========================================= */

function setupPedal(button, input) {

    if (!button || !input) return;

    function pressPedal(event) {

        event.preventDefault();

        if (activeTest) return;

        button.classList.add("pressed");

        setControlValue(input, 75);

        if (
            button.setPointerCapture &&
            event.pointerId !== undefined
        ) {
            button.setPointerCapture(event.pointerId);
        }
    }

    function releasePedal() {

        button.classList.remove("pressed");

        if (!activeTest) {
            setControlValue(input, 0);
        }
    }

    button.addEventListener("pointerdown", pressPedal);
    button.addEventListener("pointerup", releasePedal);
    button.addEventListener("pointercancel", releasePedal);
    button.addEventListener("lostpointercapture", releasePedal);

    button.addEventListener("contextmenu", event => {
        event.preventDefault();
    });
}

setupPedal(accelerateButton, throttleInput);
setupPedal(brakeButton, brakeInput);


/* =========================================
   6. KEYBOARD CONTROLS
========================================= */

// Block all keyboard interaction during automatic tests.
document.addEventListener("keydown", event => {

    if (activeTest) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }

}, true);

document.addEventListener("keyup", event => {

    if (activeTest) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }

}, true);


function isTypingTarget(target) {

    return (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
    );
}

document.addEventListener("keydown", event => {

    if (activeTest) return;

    if (isTypingTarget(event.target)) return;

    const key = event.key.toLowerCase();

    // OPEN GAME MODE WITH F
    if (key === "f" && !event.repeat) {

        if (!simulationRunning) return;

        event.preventDefault();

        if (gameModeScreen.classList.contains("hidden")) {
            openGameMode();
        } else {
            closeGameMode();
        }

        return;
    }

    // EXIT GAME MODE WITH ESC
    if (key === "escape") {

        if (!gameModeScreen.classList.contains("hidden")) {
            event.preventDefault();
            closeGameMode();
        }

        return;
    }

    if (!simulationRunning) return;

    // ACCELERATOR
    if (key === "w" || key === "arrowup") {

        event.preventDefault();

        pressedKeys.add("accelerate");

        setControlValue(throttleInput, 75);
    }

    // BRAKE
    if (key === "s" || key === "arrowdown") {

        event.preventDefault();

        pressedKeys.add("brake");

        setControlValue(brakeInput, 75);
    }

    // ABS TOGGLE
    if (key === "x" && !event.repeat) {

        absToggle.checked = !absToggle.checked;

        updateDashboard();
    }

    // RESET
    if (key === "r" && !event.repeat) {
        resetSimulation();
    }
});

document.addEventListener("keyup", event => {

    if (activeTest) return;

    const key = event.key.toLowerCase();

    if (key === "w" || key === "arrowup") {

        pressedKeys.delete("accelerate");

        setControlValue(throttleInput, 0);
    }

    if (key === "s" || key === "arrowdown") {

        pressedKeys.delete("brake");

        setControlValue(brakeInput, 0);
    }
});

window.addEventListener("blur", () => {

    pressedKeys.clear();

    if (!activeTest) {
        setControlValue(throttleInput, 0);
        setControlValue(brakeInput, 0);
    }

    accelerateButton?.classList.remove("pressed");
    brakeButton?.classList.remove("pressed");
});


/* =========================================
   7. SEPARATE GAME MODE SCREEN
========================================= */

function openGameMode() {

    if (activeTest) return;

    if (
        !gameModeScreen ||
        !gameModeScreen.classList.contains("hidden")
    ) {
        return;
    }

    // Move HUD into Game Mode
    gameHudSlot.appendChild(gameHud);

    // Move road and car into Game Mode
    gameRoadSlot.appendChild(gameRoad);

    // Move ABS settings into Game Mode
    gameAbsSlot.appendChild(gameAbs);

    // Move accelerator and brake into Game Mode
    gameControlsSlot.appendChild(gameControls);

    // Show Game Mode
    gameModeScreen.classList.remove("hidden");

    document.body.classList.add("game-mode-active");

    fullscreenButton.textContent = "⛶ EXIT GAME MODE";
}

function closeGameMode() {

    // Do not allow the test to be interrupted
    if (activeTest) return;

    if (
        !gameModeScreen ||
        gameModeScreen.classList.contains("hidden")
    ) {
        return;
    }

    // Restore HUD
    gameHudHome.after(gameHud);

    // Restore road and car
    gameRoadHome.after(gameRoad);

    // Restore ABS settings
    gameAbsHome.after(gameAbs);

    // Restore accelerator and brake
    gameControlsHome.after(gameControls);

    // Hide Game Mode
    gameModeScreen.classList.add("hidden");

    document.body.classList.remove("game-mode-active");

    fullscreenButton.textContent = "⛶ GAME MODE (F)";
}

// GAME MODE BUTTON
fullscreenButton.addEventListener("click", () => {

    if (activeTest) return;

    if (gameModeScreen.classList.contains("hidden")) {
        openGameMode();
    } else {
        closeGameMode();
    }
});

// EXIT GAME MODE BUTTON
exitGameModeButton.addEventListener("click", () => {

    if (activeTest) return;

    closeGameMode();
});


/* =========================================
   8. RESET SIMULATION
========================================= */

function resetSimulation() {

    // Never allow reset during automatic tests
    if (activeTest) return;

    speed = 0;
    wheelSpeed = 0;
    distance = 0;

        normalDrive = {
        hasDriven: false,
        wasMoving: false,
        startDistance: 0,
        driveTime: 0,
        maximumSpeed: 0,
        maximumSlip: 0,
        braking: false,
        brakingStartDistance: 0,
        brakingDistance: 0
    };

    testResultPopup.classList.add("hidden");

    carX = 250;
    sceneryOffset = 0;

    brakePressure = 0;
    wheelSlip = 0;

    valveMode = "BUILD";
    valveTimer = 0;

    pressedKeys.clear();

    throttleInput.value = 0;
    brakeInput.value = 0;

    throttleReadout.textContent = "0%";
    brakeReadout.textContent = "0%";

    absToggle.checked = true;

    accelerateButton?.classList.remove("pressed");
    brakeButton?.classList.remove("pressed");

    updateDashboard();
    drawScene();
}

resetButton.addEventListener("click", resetSimulation);


/* =========================================
   9. SHARED PHYSICS MODEL
========================================= */


function physicsStep(state, throttle, brake, absEnabled, dt) {

    // Convert the simulated road grip into a maximum
    // acceleration in km/h per second.
    const maximumGripAcceleration =
        ROAD_FRICTION * GRAVITY * 3.6;

    /* -----------------------------------------
       1. ACCELERATION
    ----------------------------------------- */

    // Braking overrides acceleration.
const requestedAcceleration =
    brake > 0.01 ? 0 : throttle * 38;

    const actualAcceleration = Math.min(
        requestedAcceleration,
        maximumGripAcceleration
    );

    state.speed += actualAcceleration * dt;

state.speed = Math.min(MAX_SPEED, state.speed);

/* -----------------------------------------
   NATURAL COASTING DECELERATION
----------------------------------------- */

// When the accelerator is released, the car
// gradually loses speed due to road resistance
// and air resistance.

if (throttle <= 0.01) {

    // Rolling resistance from tyre-road contact.
    const rollingResistance = 0.8 * ROAD_FRICTION;

    // Air resistance increases with vehicle speed.
    const airResistance = state.speed * 0.012;

    const naturalDeceleration =
        rollingResistance + airResistance;

    state.speed = Math.max(
        0,
        state.speed - naturalDeceleration * dt
    );
}

    /* -----------------------------------------
       2. BRAKE PRESSURE
    ----------------------------------------- */

    const requestedPressure = brake * 100;

    state.brakePressure +=
        (requestedPressure - state.brakePressure) *
        Math.min(1, dt * 7);

    let effectivePressure = state.brakePressure / 100;

    /* -----------------------------------------
       3. CALCULATE CURRENT WHEEL SLIP
    ----------------------------------------- */

    if (state.speed > 1) {

        state.wheelSlip = Math.max(
            0,
            (state.speed - state.wheelSpeed) /
            state.speed * 100
        );

    } else {

        state.wheelSlip = 0;
    }

    /* -----------------------------------------
       4. ABS PRESSURE CONTROL
    ----------------------------------------- */

    if (absEnabled && brake > 0.01 && state.speed > 5) {

        state.valveTimer += dt;

        // Release pressure when slip becomes excessive.
        if (state.wheelSlip > 18) {

            state.valveMode = "RELEASE";

        // Hold pressure while slip is in the upper range.
        } else if (state.wheelSlip > 12) {

            state.valveMode = "HOLD";

        // Build pressure when the wheel regains grip.
        } else if (state.wheelSlip < 8) {

            state.valveMode = "BUILD";
        }

        if (state.valveMode === "RELEASE") {

            effectivePressure *= 0.35;

        } else if (state.valveMode === "HOLD") {

            effectivePressure *= 0.65;

        } else {

            effectivePressure *= 1;
        }

    } else {

        state.valveMode = "BUILD";
        state.valveTimer = 0;
    }

    /* -----------------------------------------
       5. TYRE-ROAD FRICTION
    ----------------------------------------- */

    // Tyre grip is strongest around moderate slip.
    // A heavily slipping or locked wheel has less grip.
    const slipRatio = state.wheelSlip / 100;

    let tractionFactor;

    if (slipRatio <= 0.12) {

        tractionFactor =
            0.35 + (slipRatio / 0.12) * 0.65;

    } else {

        tractionFactor =
            1 - ((slipRatio - 0.12) / 0.88) * 0.72;
    }

    tractionFactor = THREE_SAFE_CLAMP(
        tractionFactor,
        0.28,
        1
    );

    const availableTyreGrip =
        maximumGripAcceleration * tractionFactor;

    /* -----------------------------------------
       6. VEHICLE BRAKING FORCE
    ----------------------------------------- */

    const requestedBraking =
        effectivePressure * 42;

    const actualBraking = Math.min(
        requestedBraking,
        availableTyreGrip
    );

    state.speed -= actualBraking * dt;

    state.speed = Math.max(
        0,
        Math.min(MAX_SPEED, state.speed)
    );

    /* -----------------------------------------
       7. WHEEL ROTATION
    ----------------------------------------- */

    if (brake > 0.01) {

        // Braking pressure slows the wheel.
        const wheelBraking =
            effectivePressure * 75;

        state.wheelSpeed -= wheelBraking * dt;

        // Tyre contact with the road helps the wheel
        // regain rotation as it moves with the vehicle.
        state.wheelSpeed +=
            (state.speed - state.wheelSpeed) *
            Math.min(1, dt * (3 + ROAD_FRICTION * 5));

    } else {

        // Without braking, wheel speed follows vehicle speed.
        state.wheelSpeed +=
            (state.speed - state.wheelSpeed) *
            Math.min(1, dt * 8);
    }

    state.wheelSpeed = Math.max(
        0,
        Math.min(MAX_SPEED, state.wheelSpeed)
    );

    /* -----------------------------------------
       8. FINAL WHEEL SLIP
    ----------------------------------------- */

    if (state.speed > 1) {

        state.wheelSlip = Math.max(
            0,
            (state.speed - state.wheelSpeed) /
            state.speed * 100
        );

    } else {

        state.wheelSlip = 0;
    }

    state.wheelSlip = Math.min(
        100,
        state.wheelSlip
    );

    /* -----------------------------------------
       9. DISTANCE
    ----------------------------------------- */

    state.distance +=
        (state.speed / 3.6) * dt;

    return state;
}

// Small helper to keep traction values within their limits.
function THREE_SAFE_CLAMP(value, min, max) {
    return Math.max(min, Math.min(max, value));
}


/* =========================================
   10. LIVE VEHICLE PHYSICS
========================================= */

function updateNormalDriveResults(dt) {

    const throttle = Number(throttleInput.value);
    const brake = Number(brakeInput.value);

    // Detect the beginning of a driving session.
    if (speed > 1 && !normalDrive.hasDriven) {
        normalDrive.hasDriven = true;
        normalDrive.startDistance = distance;
    }

    if (normalDrive.hasDriven) {

        normalDrive.driveTime += dt;

        normalDrive.maximumSpeed = Math.max(
            normalDrive.maximumSpeed,
            speed
        );

        normalDrive.maximumSlip = Math.max(
            normalDrive.maximumSlip,
            wheelSlip
        );

        // Record the latest braking distance.
        if (brake > 1 && speed > 0.5) {

            if (!normalDrive.braking) {
                normalDrive.braking = true;
                normalDrive.brakingStartDistance = distance;
            }

            normalDrive.brakingDistance =
                distance - normalDrive.brakingStartDistance;
        }

        // Detect a complete stop after driving.
        if (
            normalDrive.wasMoving &&
            speed <= 0.05 &&
            throttle <= 1
        ) {

            speed = 0;
            wheelSpeed = 0;

            normalDrive.wasMoving = false;

            if (driveResultsEnabled) {
                showNormalDriveResults();
            }

        } else if (speed > 0.5) {

            normalDrive.wasMoving = true;
        }
    }
}

function showNormalDriveResults() {

    if (!testResultPopup) return;

    // This is a normal drive, not an ABS comparison test.
    pendingTestResult = null;

    popupTestTitle.textContent = "DRIVE SESSION RESULTS";

    popupDistance.textContent =
        formatTestResult(normalDrive.brakingDistance, "m");

    if (popupTotalDistance) {
        popupTotalDistance.textContent =
            formatTestResult(
                distance - normalDrive.startDistance,
                "m"
            );
    }

    popupTime.textContent =
        formatTestResult(normalDrive.driveTime, "s");

    popupSlip.textContent =
        formatTestResult(normalDrive.maximumSlip, "%");

    popupFinalSpeed.textContent = "0.0 km/h";

    // Hide Submit because normal drives are not test submissions.
    submitTestResultsButton.hidden = true;

    // Use the existing Discard button as Close.
    discardTestResultsButton.textContent = "CLOSE";

    testResultPopup.classList.remove("hidden");
}

function updatePhysics(deltaTime) {

    // Normal driving uses normal simulation speed.
    const dt = Math.min(
        deltaTime,
        TEST_STEP_LIMIT
    );

    const throttle =
        Number(throttleInput.value) / 100;

    const brake =
        Number(brakeInput.value) / 100;

    const absEnabled = absToggle.checked;

    const state = physicsStep(
        {
            speed,
            wheelSpeed,
            brakePressure,
            wheelSlip,
            distance,
            valveMode,
            valveTimer
        },
        throttle,
        brake,
        absEnabled,
        dt
    );

    speed = state.speed;
    wheelSpeed = state.wheelSpeed;

    brakePressure = state.brakePressure;
    wheelSlip = state.wheelSlip;

    distance = state.distance;

    valveMode = state.valveMode;
    valveTimer = state.valveTimer;

    sceneryOffset += speed * 3.2 * dt;

    carX = 250;

        updateDashboard();

    // Track normal driving and detect a complete stop.
    updateNormalDriveResults(dt);
}


/* =========================================
   11. DASHBOARD
========================================= */

function updateDashboard() {

    speedValue.textContent = Math.round(speed);
    pressureValue.textContent = Math.round(brakePressure);
    slipValue.textContent = Math.round(wheelSlip);

    // During an automatic test, this is the distance
    // travelled SINCE the car reached 100 km/h.
    distanceValue.textContent = distance.toFixed(1);

    speedMeter.style.width =
        (speed / MAX_SPEED * 100) + "%";

    pressureMeter.style.width =
        brakePressure + "%";

    slipMeter.style.width =
        wheelSlip + "%";

    driveState.textContent =
        speed > 1 ? "MOVING" : "STATIONARY";

    updateAbsStatus();
    updateValveDisplay();
    updateSystemMessage();
    updateLiveComponents();

    // SEND LIVE SIMULATION DATA TO THE 3D DRIVING SCENE
window.dispatchEvent(
    new CustomEvent("bw:sim-update", {
        detail: {
            speed: speed,
            brakePressure: brakePressure,
            wheelSlip: wheelSlip,
            absActive: absToggle.checked,
            valveMode: valveMode
        }
    })
);
}


/* =========================================
   12. ABS ON / OFF STATUS
========================================= */

function updateAbsStatus() {

    if (!absStatusText) return;

    if (absToggle.checked) {

        absStatusText.textContent = "ABS ENABLED";

        absStatusText.classList.remove("off");

    } else {

        absStatusText.textContent = "ABS DISABLED";

        absStatusText.classList.add("off");
    }
}


/* =========================================
   13. ABS VALVE DISPLAY
========================================= */

function updateValveDisplay() {

    valveState.textContent = valveMode;
    cycleFill.style.width = brakePressure + "%";

    releaseStep.classList.remove("active");
    holdStep.classList.remove("active");
    buildStep.classList.remove("active");

    if (valveMode === "RELEASE") {

        releaseStep.classList.add("active");

    } else if (valveMode === "HOLD") {

        holdStep.classList.add("active");

    } else {

        buildStep.classList.add("active");
    }
}


/* =========================================
   14. SYSTEM EXPLANATION
========================================= */

function updateSystemMessage() {

    const brake = Number(brakeInput.value);
    const absEnabled = absToggle.checked;

    if (activeTest && activeTest.phase === "accelerating") {

        systemMessage.textContent =
            "Automatic test: accelerating.";

        systemExplanation.textContent =
            "The vehicle is gradually increasing its speed until it reaches 100 km/h.";

    } else if (activeTest && activeTest.phase === "cruising") {

        systemMessage.textContent =
            "Automatic test: controlled cruising.";

        systemExplanation.textContent =
            `The vehicle has reached 100 km/h. It has travelled ${activeTest.cruiseDistance.toFixed(1)} of 500 metres before braking begins.`;

    } else if (activeTest && activeTest.phase === "braking") {

        systemMessage.textContent =
            "Automatic test: braking.";

        systemExplanation.textContent =
            `The vehicle is braking automatically. Distance travelled since reaching 100 km/h: ${activeTest.distanceAfter100.toFixed(1)} metres.`;

    } else if (speed < 1 && brake < 1) {

        systemMessage.textContent =
            "Ready when you are.";

        systemExplanation.textContent =
            "Use the accelerator to drive manually, or run an automatic ABS comparison test.";

    } else if (brake < 1 && speed > 1) {

        systemMessage.textContent =
            "Vehicle accelerating.";

        systemExplanation.textContent =
            "The accelerator increases vehicle speed while the road moves towards the vehicle.";

    } else if (absEnabled && valveMode === "RELEASE") {

        systemMessage.textContent =
            "ABS: Releasing pressure.";

        systemExplanation.textContent =
            "The system temporarily reduces brake pressure to help the wheel regain rotation.";

    } else if (absEnabled && valveMode === "HOLD") {

        systemMessage.textContent =
            "ABS: Holding pressure.";

        systemExplanation.textContent =
            "The system holds pressure briefly while monitoring wheel behaviour.";

    } else if (absEnabled && valveMode === "BUILD") {

        systemMessage.textContent =
            "ABS: Building pressure.";

        systemExplanation.textContent =
            "The system increases braking pressure when wheel behaviour allows it.";

    } else if (!absEnabled && wheelSlip > 25) {

        systemMessage.textContent =
            "High wheel slip detected.";

        systemExplanation.textContent =
            "ABS is switched off. The wheel is slowing significantly compared with the vehicle.";

    } else if (!absEnabled) {

        systemMessage.textContent =
            "ABS is switched off.";

        systemExplanation.textContent =
            "Brake pressure follows the brake input without ABS pressure cycling.";

    } else {

        systemMessage.textContent =
            "Braking in progress.";

        systemExplanation.textContent =
            "The braking system is slowing the vehicle while ABS monitors wheel behaviour.";
    }
}


/* =========================================
   15. LIVE ABS COMPONENT MONITOR
========================================= */

function setComponentState(component, active, statusText) {

    if (!component.box || !component.status) return;

    component.box.classList.toggle("active", active);
    component.box.classList.toggle("inactive", !active);

    component.status.textContent = statusText;
}

function updateLiveComponents() {

    const moving = speed > 1;

    const braking =
        Number(brakeInput.value) > 1;

    const absEnabled = absToggle.checked;

    const wheelMonitoring = moving || braking;
    const ecuWorking = wheelMonitoring;

    const modulatorWorking =
        absEnabled && braking && speed > 5;

    const brakesWorking =
        braking && speed > 0.5;

    setComponentState(
        liveComponents.sensor,
        wheelMonitoring,
        wheelMonitoring ? "MONITORING" : "STANDBY"
    );

    setComponentState(
        liveComponents.ecu,
        ecuWorking,
        ecuWorking ? "PROCESSING" : "STANDBY"
    );

    let modulatorStatus = "STANDBY";

    if (!absEnabled) {

        modulatorStatus = "BYPASSED";

    } else if (modulatorWorking) {

        modulatorStatus = valveMode + " PRESSURE";
    }

    setComponentState(
        liveComponents.modulator,
        modulatorWorking,
        modulatorStatus
    );

    setComponentState(
        liveComponents.brakes,
        brakesWorking,
        brakesWorking ? "BRAKING" : "READY"
    );

    if (!componentLiveMessage) return;

    if (!absEnabled) {

        componentLiveMessage.textContent =
            "ABS is OFF. The sensors and control module are not controlling brake pressure in this simplified demonstration.";

    } else if (modulatorWorking) {

        componentLiveMessage.textContent =
            "ABS is active. Wheel sensors send information to the control module, which adjusts the hydraulic modulator.";

    } else if (wheelMonitoring) {

        componentLiveMessage.textContent =
            "The wheel speed sensors are monitoring wheel rotation. ABS is ready to respond if braking causes excessive wheel slip.";

    } else {

        componentLiveMessage.textContent =
            "Start driving to activate wheel monitoring. Apply the brakes to see the ABS components respond.";
    }
}


/* =========================================
   16. COMPONENT INFORMATION
========================================= */

const componentData = {

    sensor: {
        name: "Wheel Speed Sensor",
        description:
            "Wheel speed sensors monitor how quickly each wheel rotates. They send this information to the ABS control module, which uses it to detect a wheel that is slowing too quickly."
    },

    ecu: {
        name: "ABS Control Module",
        description:
            "The electronic control unit (ECU) processes information from the wheel speed sensors. It decides when brake pressure needs to be adjusted."
    },

    modulator: {
        name: "Hydraulic Modulator",
        description:
            "The hydraulic modulator uses valves to release, hold, or increase brake fluid pressure. This allows ABS to adjust braking pressure rapidly."
    },

    brakes: {
        name: "Brake Caliper & Rotor",
        description:
            "The caliper presses brake pads against the rotating rotor. This creates friction that slows the wheel and helps slow the vehicle."
    }
};

document.querySelectorAll(".component-card").forEach(card => {

    card.addEventListener("click", () => {

        if (activeTest) return;

        const component = card.dataset.component;
        const information = componentData[component];

        if (!information) return;

        document.querySelectorAll(".component-card").forEach(item => {
            item.classList.remove("active");
        });

        card.classList.add("active");

        componentName.textContent = information.name;
        componentDescription.textContent = information.description;
    });
});


/* =========================================
   17. AUTOMATIC ABS COMPARISON TESTS
========================================= */

function setTestStatus(message, type = "") {

    if (!testStatus) return;

    testStatus.textContent = message;

    testStatus.classList.remove(
        "success",
        "error",
        "running"
    );

    if (type) {
        testStatus.classList.add(type);
    }
}

function formatTestResult(value, unit) {

    return `${value.toFixed(1)} ${unit}`;
}


/* =========================================
   LOCK AND UNLOCK TEST CONTROLS
========================================= */

function lockTestControls() {

    throttleInput.disabled = true;
    brakeInput.disabled = true;
    absToggle.disabled = true;

    if (accelerateButton) {
        accelerateButton.disabled = true;
    }

    if (brakeButton) {
        brakeButton.disabled = true;
    }

    if (runAbsTestButton) {
        runAbsTestButton.disabled = true;
    }

    if (runNoAbsTestButton) {
        runNoAbsTestButton.disabled = true;
    }

    if (clearTestResultsButton) {
        clearTestResultsButton.disabled = true;
    }

    if (resetButton) {
        resetButton.disabled = true;
    }

    if (backButton) {
        backButton.disabled = true;
    }

    if (fullscreenButton) {
        fullscreenButton.disabled = true;
    }

    if (exitGameModeButton) {
        exitGameModeButton.disabled = true;
    }

    // Both screens remain visible but non-interactive.
    // Keep the results popup OUTSIDE these two screens.
    if (labScreen) {
        labScreen.inert = true;
    }

    if (gameModeScreen) {
        gameModeScreen.inert = true;
    }

    document.body.classList.add("automatic-test-running");

    if (driveResultsToggle) {
    driveResultsToggle.disabled = true;
}
}


function restoreTestControls() {

    throttleInput.disabled = false;
    brakeInput.disabled = false;
    absToggle.disabled = false;

    if (accelerateButton) {
        accelerateButton.disabled = false;
    }

    if (brakeButton) {
        brakeButton.disabled = false;
    }

    if (runAbsTestButton) {
        runAbsTestButton.disabled = false;
    }

    if (runNoAbsTestButton) {
        runNoAbsTestButton.disabled = false;
    }

    if (clearTestResultsButton) {
        clearTestResultsButton.disabled = false;
    }

    if (resetButton) {
        resetButton.disabled = false;
    }

    if (backButton) {
        backButton.disabled = false;
    }

    if (fullscreenButton) {
        fullscreenButton.disabled = false;
    }

    if (exitGameModeButton) {
        exitGameModeButton.disabled = false;
    }

    if (labScreen) {
        labScreen.inert = false;
    }

    if (gameModeScreen) {
        gameModeScreen.inert = false;
    }

    document.body.classList.remove("automatic-test-running");

    if (driveResultsToggle) {
    driveResultsToggle.disabled = false;
}
}


/* =========================================
   START AUTOMATIC TEST
========================================= */

function startAutomaticTest(absEnabled) {

    if (activeTest || pendingTestResult) return;

    const type = absEnabled ? "abs" : "noAbs";
    const label = absEnabled ? "ABS ON" : "ABS OFF";

    // Set the selected ABS condition
    absToggle.checked = absEnabled;

        // Close any previous normal-drive results.
    testResultPopup.classList.add("hidden");

    // Restore automatic-test popup buttons.
    submitTestResultsButton.hidden = false;
    discardTestResultsButton.textContent = "DISCARD RESULTS";

    // Start with fresh normal-drive tracking.
    normalDrive.hasDriven = false;
    normalDrive.wasMoving = false;
    
    // Reset vehicle state
    speed = 0;
    wheelSpeed = 0;
    distance = 0;

    brakePressure = 0;
    wheelSlip = 0;

    valveMode = "BUILD";
    valveTimer = 0;

    sceneryOffset = 0;
    carX = canvas.width / 2;

    throttleInput.value = 0;
    brakeInput.value = 0;

    throttleReadout.textContent = "0%";
    brakeReadout.textContent = "0%";

    pressedKeys.clear();

    accelerateButton?.classList.remove("pressed");
    brakeButton?.classList.remove("pressed");

    activeTest = {

        type,
        label,
        absEnabled,

        phase: "accelerating",

        state: {
            speed: 0,
            wheelSpeed: 0,
            brakePressure: 0,
            wheelSlip: 0,
            distance: 0,
            valveMode: "BUILD",
            valveTimer: 0
        },

        // Distance travelled after reaching 100 km/h
        cruiseDistance: 0,
        distanceAt100: 0,
        distanceAfter100: 0,
        brakingStartDistance: 0,
        brakingTime: 0,
        brakingDistance: 0,
        maximumSlip: 0
    };

    lockTestControls();

    simulationRunning = true;
    previousTime = 0;
    simulationAccumulator = 0;

    setTestStatus(
        `${label}: gradually accelerating to 100 km/h. Controls are locked.`,
        "running"
    );

    updateDashboard();
    drawScene();
}


/* =========================================
   UPDATE AUTOMATIC TEST
========================================= */

function updateAutomaticTest(deltaTime) {

    if (!activeTest) return;

    // Normal time progression with a maximum physics step.
    const dt = Math.min(
        deltaTime * TEST_SPEED_MULTIPLIER,
        TEST_STEP_LIMIT
    );

    const run = activeTest;


    /* -----------------------------------------
       STAGE 1: GRADUALLY ACCELERATE TO 100 KM/H
    ----------------------------------------- */

    if (run.phase === "accelerating") {

        physicsStep(
            run.state,
            TEST_ACCELERATOR_INPUT,
            0,
            run.absEnabled,
            dt
        );

        if (run.state.speed >= TEST_START_SPEED) {

            run.state.speed = TEST_START_SPEED;
            run.state.wheelSpeed = TEST_START_SPEED;

            run.phase = "cruising";

            // Record the distance at the exact start
            // of the 100 km/h measurement stage.
            run.distanceAt100 = run.state.distance;

            run.distanceAfter100 = 0;
            run.cruiseDistance = 0;

            setTestStatus(
                `${run.label}: 100 km/h reached. The 500 m measurement has started!`,
                "running"
            );
        }
    }


    /* -----------------------------------------
       STAGE 2: TRAVEL EXACTLY 500 METRES
       AT A CONSTANT 100 KM/H
    ----------------------------------------- */

    else if (run.phase === "cruising") {

        run.state.speed = TEST_START_SPEED;
        run.state.wheelSpeed = TEST_START_SPEED;

        run.state.brakePressure = 0;
        run.state.wheelSlip = 0;

        const distanceThisFrame =
            (TEST_START_SPEED / 3.6) * dt;

        const remainingDistance =
            TEST_TRAVEL_DISTANCE - run.cruiseDistance;

        const actualDistance = Math.min(
            distanceThisFrame,
            remainingDistance
        );

        run.cruiseDistance += actualDistance;
        run.state.distance += actualDistance;

        // Total distance since reaching 100 km/h
        run.distanceAfter100 =
            run.state.distance - run.distanceAt100;

        // Display live cruising distance
        setTestStatus(
            `${run.label}: 100 km/h | Distance travelled: ${run.cruiseDistance.toFixed(1)} / ${TEST_TRAVEL_DISTANCE} m`,
            "running"
        );

        // Start braking ONLY after 500 m is completed.
        if (run.cruiseDistance >= TEST_TRAVEL_DISTANCE) {

            run.cruiseDistance = TEST_TRAVEL_DISTANCE;

            run.phase = "braking";

            run.brakingStartDistance =
                run.state.distance;

            brakeInput.value =
                TEST_BRAKE_INPUT * 100;

            brakeReadout.textContent = "50%";

            setTestStatus(
                `${run.label}: 500 metres completed. Applying 50% braking...`,
                "running"
            );
        }
    }


    /* -----------------------------------------
       STAGE 3: AUTOMATIC 50% BRAKING
    ----------------------------------------- */

    else if (run.phase === "braking") {

        physicsStep(
            run.state,
            0,
            TEST_BRAKE_INPUT,
            run.absEnabled,
            dt
        );

        run.brakingTime += dt;

        // Braking distance ONLY
        run.brakingDistance =
            run.state.distance - run.brakingStartDistance;

        // Total distance since reaching 100 km/h
        run.distanceAfter100 =
            run.state.distance - run.distanceAt100;

        run.maximumSlip = Math.max(
            run.maximumSlip,
            run.state.wheelSlip
        );

        setTestStatus(
            `${run.label}: Distance since 100 km/h: ${run.distanceAfter100.toFixed(1)} m | Braking distance: ${run.brakingDistance.toFixed(1)} m`,
            "running"
        );

        if (run.state.speed <= 0.05) {

            run.state.speed = 0;
            run.state.wheelSpeed = 0;

            finishAutomaticTest();
        }
    }


    /* -----------------------------------------
       COPY VALUES TO THE MAIN DASHBOARD
    ----------------------------------------- */

    speed = run.state.speed;
    wheelSpeed = run.state.wheelSpeed;

    brakePressure = run.state.brakePressure;
    wheelSlip = run.state.wheelSlip;

    // Always display distance since 100 km/h.
    // Keep this value after the test has finished too.
    distance = run.distanceAfter100;

    valveMode = run.state.valveMode;
    valveTimer = run.state.valveTimer;

    sceneryOffset += speed * 3.2 * dt;

    updateDashboard();
}


/* =========================================
   FINISH AUTOMATIC TEST
========================================= */

function finishAutomaticTest() {

    if (!activeTest) return;

    const run = activeTest;

    // Collect all final results FIRST.
    const results = {

        distance: run.brakingDistance,

        totalDistanceAfter100: run.distanceAfter100,

        time: run.brakingTime,

        maxSlip: run.maximumSlip,

        finalSpeed: 0
    };

    // Keep results pending until user submission.
    pendingTestResult = {
        type: run.type,
        label: run.label,
        results: results
    };

    activeTest = null;

    brakeInput.value = 0;
    brakeReadout.textContent = "0%";

    throttleInput.value = 0;
    throttleReadout.textContent = "0%";

    // Unlock the interface now that the test has ended.
    restoreTestControls();

    // Prepare popup information.
    popupTestTitle.textContent =
        `${run.label} TEST RESULTS`;

    // Braking-only distance
    popupDistance.textContent =
        formatTestResult(results.distance, "m");

    // Total distance from reaching 100 km/h
    if (popupTotalDistance) {
        popupTotalDistance.textContent =
            formatTestResult(results.totalDistanceAfter100, "m");
    }

    popupTime.textContent =
        formatTestResult(results.time, "s");

    popupSlip.textContent =
        formatTestResult(results.maxSlip, "%");

    popupFinalSpeed.textContent =
        formatTestResult(results.finalSpeed, "km/h");

    // Display popup.
    testResultPopup.classList.remove("hidden");

    setTestStatus(
        `${run.label} test completed. Review your results.`,
        "success"
    );

    updateDashboard();
    drawScene();
}


/* =========================================
   TEST RESULTS SUBMISSION
========================================= */

submitTestResultsButton.addEventListener("click", () => {

    if (!pendingTestResult) return;

    submitTestResultsButton.hidden = false;
    discardTestResultsButton.textContent = "DISCARD RESULTS";

    const type = pendingTestResult.type;
    const results = pendingTestResult.results;

    // Save results in the correct test section.
    testData[type] = results;

    // Display results in the Driving Lab.
    displayTestResults(type, results);

    // Update comparison report.
    updateTestSummary();

    // Clear pending results.
    pendingTestResult = null;

    // Close popup.
    testResultPopup.classList.add("hidden");

    setTestStatus(
        "Results successfully submitted to the Driving Lab.",
        "success"
    );
});


discardTestResultsButton.addEventListener("click", () => {

    // Normal-drive results: simply close the popup.
    if (!pendingTestResult) {

                testResultPopup.classList.add("hidden");

        discardTestResultsButton.textContent =
            "DISCARD RESULTS";

        // Prepare a fresh session for the next drive.
        normalDrive = {
            hasDriven: false,
            wasMoving: false,
            startDistance: 0,
            driveTime: 0,
            maximumSpeed: 0,
            maximumSlip: 0,
            braking: false,
            brakingStartDistance: 0,
            brakingDistance: 0
        };

        return;
    }

    // Automatic ABS test results: discard normally.
    pendingTestResult = null;

    testResultPopup.classList.add("hidden");

    discardTestResultsButton.textContent =
        "DISCARD RESULTS";

    setTestStatus(
        "Results discarded. They were not submitted.",
        "error"
    );
});


function clearOneTestResult(type) {

    const group = testResults[type];

    if (!group) return;

    Object.values(group).forEach(element => {

        if (element) {
            element.textContent = "—";
        }
    });
}


function displayTestResults(type, results) {

    const target = testResults[type];

    if (!target) return;

    if (target.distance) {
        target.distance.textContent =
            formatTestResult(results.distance, "m");
    }

    if (target.time) {
        target.time.textContent =
            formatTestResult(results.time, "s");
    }

    if (target.slip) {
        target.slip.textContent =
            formatTestResult(results.maxSlip, "%");
    }

    if (target.finalSpeed) {
        target.finalSpeed.textContent =
            formatTestResult(results.finalSpeed, "km/h");
    }
}


/* =========================================
   TEST COMPARISON SUMMARY
========================================= */

function updateTestSummary() {

    if (!testResultSummary) return;

    if (!testData.abs || !testData.noAbs) {

        testResultSummary.textContent =
            "Complete both tests to generate the comparison report.";

        return;
    }

    const withABS = testData.abs;
    const withoutABS = testData.noAbs;

    // Compare braking-only distance.
    const distanceDifference =
        withoutABS.distance - withABS.distance;

    const timeDifference =
        withoutABS.time - withABS.time;

    const slipDifference =
        withoutABS.maxSlip - withABS.maxSlip;

    let summary =
        "Both tests accelerated from 0 to 100 km/h, " +
        "then travelled 500 metres at 100 km/h before braking. " +
        "Both used the same 50% braking input. ";

    if (Math.abs(distanceDifference) < 0.1) {

        summary +=
            "The stopping distances were almost identical. ";

    } else if (distanceDifference > 0) {

        summary +=
            `The ABS test stopped ${distanceDifference.toFixed(1)} metres sooner. `;

    } else {

        summary +=
            `The ABS test travelled ${Math.abs(distanceDifference).toFixed(1)} metres farther before stopping. `;
    }

    if (slipDifference > 0.1) {

        summary +=
            `Maximum wheel slip was ${slipDifference.toFixed(1)} percentage points lower with ABS. `;

    } else if (slipDifference < -0.1) {

        summary +=
            `Maximum wheel slip was ${Math.abs(slipDifference).toFixed(1)} percentage points higher with ABS in this simulation. `;

    } else {

        summary +=
            "Maximum wheel slip was almost the same in both tests. ";
    }

    if (Math.abs(timeDifference) >= 0.1) {

        summary +=
            `The stopping time difference was ${Math.abs(timeDifference).toFixed(1)} seconds. `;
    }

    summary +=
        "ABS is designed to help prevent excessive wheel lock and maintain steering control. " +
        "These results come from a simplified educational simulation, not real vehicle tests.";

    testResultSummary.textContent = summary;
}


/* =========================================
   TEST BUTTONS
========================================= */

// TEST WITH ABS — OPEN GAME MODE FIRST
runAbsTestButton?.addEventListener("click", () => {

    if (activeTest || pendingTestResult) return;

    openGameMode();

    startAutomaticTest(true);
});


// TEST WITHOUT ABS — OPEN GAME MODE FIRST
runNoAbsTestButton?.addEventListener("click", () => {

    if (activeTest || pendingTestResult) return;

    openGameMode();

    startAutomaticTest(false);
});


clearTestResultsButton?.addEventListener("click", () => {

    if (activeTest || pendingTestResult) return;

    testData.abs = null;
    testData.noAbs = null;

    clearOneTestResult("abs");
    clearOneTestResult("noAbs");

    testResultSummary.textContent =
        "Complete both tests to generate the comparison report.";

    setTestStatus("Test results cleared.");
});


/* =========================================
   18. DRAW ROAD — SIDE VIEW
========================================= */

function drawRoad() {

    const roadY = canvas.height * 0.72;

    // SKY
    ctx.fillStyle = "#101923";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        roadY
    );

    // BACKGROUND SCENERY
    for (let i = 0; i < 14; i++) {

        const totalWidth = 150;

        const x =
            ((i * totalWidth - sceneryOffset) %
                (canvas.width + totalWidth) +
                (canvas.width + totalWidth)) %
            (canvas.width + totalWidth);

        // BUILDINGS
        ctx.fillStyle = "#1c2a36";

        ctx.fillRect(
            x,
            roadY - 95,
            65,
            95
        );

        // WINDOWS
        ctx.fillStyle = "#314453";

        for (let w = 0; w < 3; w++) {

            ctx.fillRect(
                x + 10 + w * 18,
                roadY - 78,
                8,
                12
            );

            ctx.fillRect(
                x + 10 + w * 18,
                roadY - 50,
                8,
                12
            );
        }
    }

    // ROAD
    ctx.fillStyle = "#303941";

    ctx.fillRect(
        0,
        roadY,
        canvas.width,
        canvas.height - roadY
    );

    // ROAD EDGES
    ctx.fillStyle = "#d6dce2";

    ctx.fillRect(
        0,
        roadY,
        canvas.width,
        4
    );

    ctx.fillRect(
        0,
        canvas.height - 5,
        canvas.width,
        5
    );

    // MOVING LANE MARKINGS
    const dashWidth = 65;
    const gap = 65;
    const total = dashWidth + gap;

    ctx.fillStyle = "#e9edf0";

    for (
        let i = 0;
        i < Math.ceil(canvas.width / total) + 2;
        i++
    ) {

        const x =
            ((i * total - sceneryOffset) %
                (canvas.width + total) +
                (canvas.width + total)) %
            (canvas.width + total);

        ctx.fillRect(
            x,
            roadY + (canvas.height - roadY) * 0.55,
            dashWidth,
            5
        );
    }
}


/* =========================================
   19. DRAW CAR — SIDE VIEW
========================================= */

function drawCar() {

    const roadY = canvas.height * 0.72;

    // FIXED CAR POSITION
    const carPositionX = canvas.width * 0.22;
    const carPositionY = roadY - 55;

    ctx.save();

    ctx.translate(
        carPositionX,
        carPositionY
    );

    // CAR SHADOW
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";

    ctx.beginPath();

    ctx.ellipse(
        95,
        76,
        100,
        10,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // MAIN CAR BODY
    ctx.fillStyle = "#08b9d5";

    ctx.beginPath();

    ctx.moveTo(5, 55);
    ctx.lineTo(18, 35);
    ctx.lineTo(48, 30);
    ctx.lineTo(70, 8);
    ctx.lineTo(125, 8);
    ctx.lineTo(153, 32);
    ctx.lineTo(180, 38);
    ctx.lineTo(190, 55);
    ctx.lineTo(190, 68);
    ctx.lineTo(5, 68);

    ctx.closePath();
    ctx.fill();

    // WINDOWS
    ctx.fillStyle = "#142b3a";

    ctx.beginPath();

    ctx.moveTo(55, 30);
    ctx.lineTo(75, 13);
    ctx.lineTo(119, 13);
    ctx.lineTo(140, 32);

    ctx.closePath();
    ctx.fill();

    // WINDOW DIVIDER
    ctx.strokeStyle = "#08b9d5";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(99, 13);
    ctx.lineTo(99, 32);
    ctx.stroke();

    // FRONT LIGHT
    ctx.fillStyle = "#f5f7fa";
    ctx.fillRect(180, 43, 8, 9);

    // REAR LIGHT
    ctx.fillStyle = "#ff5a45";
    ctx.fillRect(7, 43, 7, 10);

    // WHEELS
    const wheelRotation = distance * 0.8;

    drawWheel(48, 67, wheelRotation);
    drawWheel(151, 67, wheelRotation);

    ctx.restore();
}


/* =========================================
   20. DRAW WHEELS
========================================= */

function drawWheel(x, y, rotation = 0) {

    ctx.save();

    ctx.translate(x, y);
    ctx.rotate(rotation);

    // TYRE
    ctx.fillStyle = "#080d13";

    ctx.beginPath();
    ctx.arc(0, 0, 19, 0, Math.PI * 2);
    ctx.fill();

    // OUTER RIM
    ctx.strokeStyle = "#9baeba";
    ctx.lineWidth = 4;
    ctx.stroke();

    // WHEEL SPOKES
    ctx.strokeStyle = "#20d9f5";
    ctx.lineWidth = 3;

    for (let i = 0; i < 4; i++) {

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 13);
        ctx.stroke();

        ctx.rotate(Math.PI / 2);
    }

    // CENTRE HUB
    ctx.fillStyle = "#dce8ef";

    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}


/* =========================================
   21. DRAW SCENE + ANIMATION LOOP
========================================= */

// DRAW ROAD AND CAR TOGETHER
function drawScene() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawRoad();
    drawCar();
}


// MAIN ANIMATION LOOP

// MAIN ANIMATION LOOP — FIXED 60 FPS PHYSICS

function animate(currentTime) {

    if (!previousTime) {
        previousTime = currentTime;
        requestAnimationFrame(animate);
        return;
    }

    let frameTime =
        (currentTime - previousTime) / 1000;

    previousTime = currentTime;

    // Prevent huge updates after a browser pause.
    frameTime = Math.min(frameTime, 0.1);

    if (simulationRunning) {

        simulationAccumulator += frameTime;

        // Run physics at a consistent 60 updates per second.
        while (simulationAccumulator >= FIXED_STEP) {

            if (activeTest) {

                updateAutomaticTest(FIXED_STEP);

            } else {

                updatePhysics(FIXED_STEP);
            }

            simulationAccumulator -= FIXED_STEP;
        }

        // Render once per animation frame.
        drawScene();

    } else {

        simulationAccumulator = 0;
    }

    requestAnimationFrame(animate);
}


/* =========================================
   22. CLICKABLE SLIDER MARKERS
========================================= */

document.querySelectorAll(".slider-wrapper").forEach(wrapper => {

    const slider =
        wrapper.parentElement.querySelector('input[type="range"]');

    const markers =
        wrapper.querySelectorAll(".slider-marker");

    if (!slider) return;

    markers.forEach((marker, index) => {

        const values = [25, 50, 75];

        marker.style.cursor = "pointer";

        marker.setAttribute("role", "button");
        marker.setAttribute("tabindex", "0");

        marker.setAttribute(
            "aria-label",
            `Set control to ${values[index]} percent`
        );

        function setSliderValue() {

            if (activeTest) return;

            setControlValue(
                slider,
                values[index]
            );
        }

        marker.addEventListener("click", setSliderValue);

        marker.addEventListener("keydown", event => {

            if (activeTest) return;

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                setSliderValue();
            }
        });
    });
});


/* =========================================
   23. ABS TOGGLE LISTENER
========================================= */

absToggle.addEventListener("change", () => {

    if (activeTest) return;

    updateDashboard();
});


/* =========================================
   24. INITIALIZE SIMULATOR
========================================= */

updateDashboard();

drawScene();

setTestStatus("Ready to run braking tests.");

if (testResultSummary) {

    testResultSummary.textContent =
        "Complete both tests to generate the comparison report.";
}

updateDriveResultsToggle();
requestAnimationFrame(animate);
