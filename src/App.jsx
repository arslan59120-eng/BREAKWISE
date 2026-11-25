
import { useState } from "react";

const stages = [
  {
    name: "RELEASE",
    number: "01",
    symbol: "↓",
    description:
      "The simulated ABS reduces brake pressure so the wheel can regain rotation.",
    detail: "Pressure decreases"
  },
  {
    name: "HOLD",
    number: "02",
    symbol: "Ⅱ",
    description:
      "The system briefly maintains pressure while it continues monitoring wheel behaviour.",
    detail: "Pressure is maintained"
  },
  {
    name: "BUILD",
    number: "03",
    symbol: "↑",
    description:
      "The system increases brake pressure again when conditions allow.",
    detail: "Pressure increases"
  }
];

export default function App() {
  const [activeStage, setActiveStage] = useState(0);
  const stage = stages[activeStage];

  return (
    <section className="react-explorer" aria-labelledby="react-explorer-title">
      <div className="react-explorer-heading">
        <p className="eyebrow">INTERACTIVE LEARNING / REACT</p>

        <h2 id="react-explorer-title">
          Explore the <span>ABS cycle.</span>
        </h2>

        <p>
          Select each stage to see how the simulated braking system
          regulates hydraulic pressure.
        </p>
      </div>

      <div className="react-explorer-panel">
        <div
          className="react-stage-list"
          role="tablist"
          aria-label="ABS cycle stages"
        >
          {stages.map((item, index) => (
            <button
              className={`react-stage-button ${
                activeStage === index ? "active" : ""
              }`}
              key={item.name}
              type="button"
              role="tab"
              aria-selected={activeStage === index}
              onClick={() => setActiveStage(index)}
            >
              <span>{item.number}</span>
              {item.name}
            </button>
          ))}
        </div>

        <div className="react-stage-display" role="tabpanel">
          <div className="react-stage-symbol" key={stage.name}>
            {stage.symbol}
          </div>

          <div>
            <span className="react-stage-kicker">
              CURRENT STAGE / {stage.number}
            </span>

            <h3>{stage.name}</h3>

            <p>{stage.description}</p>

            <strong className="react-stage-detail">
              {stage.detail}
            </strong>
          </div>
        </div>

        <div className="react-explorer-footer">
          <span>ABS PRESSURE REGULATION</span>
          <span>{activeStage + 1} / 3</span>
        </div>
      </div>
    </section>
  );
}
