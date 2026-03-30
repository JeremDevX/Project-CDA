import { useState } from "react";
import "./HowItWorksSection.css";

const steps = [
  {
    title: "Rédiger votre message",
    detail:
      "Composez vos messages, ajoutez des images, prenez le temps de structurer ce que vous souhaitez transmettre.",
  },
  {
    title: "Choisir les destinataires",
    detail: "Choisissez les destinataires qui recevront vos messages.",
  },
  {
    title: "Définir les tiers de confiance",
    detail:
      "Nommez vos tiers de confiance qui valideront le moment venu la transmission.",
  },
  {
    title: "Activer votre gift",
    detail:
      "Activez votre gift et laissez le processus suivre son cours selon vos règles.",
  },
];

export default function HowItWorksSection() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = steps[activeStepIndex];

  return (
    <section className="how-it-works">
      <h2 className="section-title">Comment ça fonctionne</h2>
      <div className="how-it-works-layout">
        <div className="how-it-works-list">
          {steps.map((step, index) => {
            const isActive = index === activeStepIndex;

            return (
              <button
                key={step.title}
                className={`step ${isActive ? "step-active" : ""}`}
                type="button"
                onClick={() => setActiveStepIndex(index)}
              >
                <div
                  className={`step-number ${isActive ? "" : "step-number-inactive"}`}
                >
                  {index + 1}
                </div>
                <div className="step-content">
                  <span className="step-label">Étape {index + 1}</span>
                  <span className="step-title">{step.title}</span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="vp-card preview-card">
          <div className="preview-image-placeholder">Image WIP</div>
          <p className="preview-detail">{activeStep.detail}</p>
        </div>
      </div>
    </section>
  );
}
