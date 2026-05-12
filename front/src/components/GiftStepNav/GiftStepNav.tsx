import { Check } from "lucide-react";
import { Link } from "react-router";
import type { GiftEditionStep } from "../../api/gifts";
import {
  getGiftProgressNumber,
  getGiftStepPath,
  giftProgressSteps,
} from "../../helpers/giftProgress";
import "./GiftStepNav.css";

interface GiftStepNavProps {
  giftId: number;
  currentStep: GiftEditionStep;
  lastEditionStep?: GiftEditionStep | null;
}

export default function GiftStepNav(props: GiftStepNavProps) {
  const currentNumber = getGiftProgressNumber(props.currentStep);
  const currentStepLabel =
    giftProgressSteps.find((step) => step.number === currentNumber)?.label ??
    "Étape";
  const lastNumber = Math.max(
    currentNumber,
    getGiftProgressNumber(props.lastEditionStep),
  );

  return (
    <nav className="gift-step-nav" aria-label="Étapes de création du gift">
      <div className="gift-step-nav__mobile-current">
        <span>
          Étape {currentNumber}/{giftProgressSteps.length}
        </span>
        <strong>{currentStepLabel}</strong>
      </div>

      {giftProgressSteps.map((step) => {
        const isCurrent = step.number === currentNumber;
        const isDone = step.number < currentNumber;
        const isReachable = step.number <= lastNumber;
        const content = (
          <>
            <span className="gift-step-nav__circle">
              {isDone ? <Check size={15} /> : step.number}
            </span>
            <span className="gift-step-nav__label">{step.label}</span>
          </>
        );

        return (
          <div
            className={[
              "gift-step-nav__item",
              isCurrent ? "gift-step-nav__item--current" : "",
              isDone ? "gift-step-nav__item--done" : "",
              !isReachable ? "gift-step-nav__item--disabled" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={step.number}
          >
            {isReachable ? (
              <Link
                to={getGiftStepPath(props.giftId, step.pathStep)}
                aria-label={`Aller à l'étape ${step.number} : ${step.label}`}
              >
                {content}
              </Link>
            ) : (
              <span aria-disabled="true">{content}</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
