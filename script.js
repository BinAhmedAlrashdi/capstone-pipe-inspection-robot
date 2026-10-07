"use strict";

// UI simulation only. This file makes no network requests or hardware calls.
// Internal convention: right = 0, forward/up = 90, left = 180, backward/down = 270.
// Keep angles here only; operators see arrows and direction names, never degrees.
const directions = Object.freeze({
  right: 0,
  upRight: 45,
  forward: 90,
  upLeft: 135,
  left: 180,
  downLeft: 225,
  backward: 270,
  downRight: 315,
});

const directionLabels = Object.freeze({
  right: "Right",
  upRight: "Forward right",
  forward: "Forward",
  upLeft: "Forward left",
  left: "Left",
  downLeft: "Backward left",
  backward: "Backward",
  downRight: "Backward right",
});

// null means stopped. An angle of 0 is a valid RIGHT command, never STOP.
const state = { direction: null, angle: null };

// Speed is a text preference only. Reload defaults to Normal; STOP preserves it.
// No numeric speed, PWM, or percentage mapping is defined at this stage.
let selectedSpeed = "normal";
const speedOptions = ["slow", "normal", "fast"];

// Collect the display elements and native controls once after HTML has loaded.
const directionButtons = document.querySelectorAll("[data-direction]");
const speedButtons = document.querySelectorAll("[data-speed]");
const stopButton = document.querySelector("#motion-stop");
const motionStatus = document.querySelector("#motion-status");
const motionReadout = document.querySelector("#motion-readout");
const steeringDirection = document.querySelector("#steering-direction");
const steeringValue = document.querySelector("#steering-value");
const feedback = document.querySelector("#interaction-feedback");

// Keep exactly one speed selected, including accessible pressed-button state.
function renderSpeedSelection() {
  speedButtons.forEach((button) => {
    const active = button.dataset.speed === selectedSpeed;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

// Selection updates this preference only; it never issues a direction command.
// Future backend/UART speed handling belongs in sendDirection's backend hook.
function setSpeed(speed) {
  if (!speedOptions.includes(speed)) {
    console.warn("Ignored invalid speed selection.");
    return;
  }

  selectedSpeed = speed;
  renderSpeedSelection();
  console.log("Speed:", speed);
  feedback.textContent = `Selected speed: ${speed}.`;
}

// Render simulated command state only; connection and other telemetry stay mock.
function renderSimulation(message) {
  const stopped = state.direction === null;
  const label = stopped ? "Stopped" : directionLabels[state.direction];

  motionStatus.textContent = label;
  motionReadout.dataset.active = String(!stopped);
  steeringDirection.textContent = label;
  steeringValue.textContent = label;

  directionButtons.forEach((button) => {
    const active = button.dataset.direction === state.direction;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  stopButton.classList.toggle("is-active", stopped);
  stopButton.setAttribute("aria-pressed", String(stopped));

  feedback.textContent = message || `Simulated motion: ${label}.`;
}

// Direction-command entry point. Validate the mapping before changing UI state.
// FUTURE BACKEND HOOK: insert the browser-to-backend direction call here.
// That backend will translate the command for NanoPi/UART; no transport exists yet.
function sendDirection(direction, angle) {
  if (!Object.hasOwn(directions, direction) || directions[direction] !== angle) {
    console.warn("Ignored invalid direction command.");
    return;
  }

  // FUTURE BACKEND/UART SPEED HOOK: include selectedSpeed with direction and angle
  // in the backend request here. The backend will interpret the text speed later.
  console.log(`Direction: ${direction.toUpperCase()}\nAngle: ${angle}\nSpeed: ${selectedSpeed}`);
  state.direction = direction;
  state.angle = angle;
  renderSimulation();
}

// Separate STOP entry point shared by the center button and emergency control.
// FUTURE BACKEND HOOK: insert a distinct STOP call here, never direction/angle 0.
// STOP does not read or change selectedSpeed; it clears motion immediately.
function sendStop() {
  console.log("Command: STOP");
  state.direction = null;
  state.angle = null;
  renderSimulation();
}

// Native buttons support mouse clicks, touch, and keyboard Enter/Space activation.
speedButtons.forEach((button) => {
  button.addEventListener("click", () => setSpeed(button.dataset.speed));
});

directionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.direction;
    sendDirection(direction, directions[direction]);
  });
});

stopButton.addEventListener("click", sendStop);
document.querySelector("#emergency-stop").addEventListener("click", () => {
  sendStop();
  feedback.textContent = "Emergency stop activated in the simulation. Motion stopped.";
});

// Page load resets the display without issuing a command, including a STOP command.
renderSpeedSelection();
renderSimulation();
