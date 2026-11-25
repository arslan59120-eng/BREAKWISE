BRAKEWISE — React + Three.js upgrade

WHAT IS INCLUDED
- Your original index.html, style.css and script.js are preserved.
- Vite runs the project locally.
- React powers the interactive ABS cycle explorer.
- Three.js powers a new interactive 3D vehicle scene.
- The 3D car is built from simple geometric shapes, so no external model file is needed.
- Drag across the 3D scene to rotate the car.

REQUIREMENTS
1. Install Node.js LTS: https://nodejs.org/
2. Open this extracted project folder in VS Code.

RUN THE PROJECT
1. In VS Code, choose Terminal > New Terminal.
2. Run: npm install
3. Run: npm run dev
4. Open the local URL printed in the terminal.

IMPORTANT
- Do not open index.html directly by double-clicking it. Use the Vite server.
- Do not delete script.js or style.css; they contain the existing simulator and design.
- This is a progressive upgrade, not a complete rewrite of the original simulator.
- The new Three.js scene is a starter visual demonstration. It is separate from the
  original driving simulation and has not been connected to its physics yet.

FILE ROLES
index.html             Existing page structure + React mount point
style.css              Original stylesheet
script.js              Original driving simulator logic
package.json            Project dependencies, including Three.js
src/main.jsx            React entry point
src/App.jsx              React ABS cycle explorer + 3D viewer
src/ThreeCarScene.jsx    Three.js scene and interactive 3D car
src/react.css            Styles for React and Three.js sections
