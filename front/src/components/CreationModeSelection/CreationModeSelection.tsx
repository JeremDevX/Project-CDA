import { CheckIcon, InfoIcon } from "lucide-react";

import { creationModes, type CreationModeId } from "../../data/creationModes";
import "./CreationModeSelection.css";

type CreationModeSelectionProps = {
  selectedMode: CreationModeId;
  onSelectMode: (mode: CreationModeId) => void;
};

export default function CreationModeSelection({
  selectedMode,
  onSelectMode,
}: CreationModeSelectionProps) {
  return (
    <div className="creation-mode-selection">
      <header className="creation-mode-selection__header">
        <h1>Choisissez votre mode de rédaction</h1>
        <p>
          Choisissez l'approche qui vous ressemble pour commencer à écrire votre
          histoire. Vous pourrez prévisualiser et modifier votre contenu avant
          validation finale.
        </p>
      </header>

      <div className="creation-mode-selection__cards">
        {creationModes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;

          return (
            <button
              key={mode.id}
              className={[
                "creation-mode-selection__card",
                isSelected ? "creation-mode-selection__card--selected" : "",
                !mode.isAvailable
                  ? "creation-mode-selection__card--disabled"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              type="button"
              data-testid={`creation-mode-${mode.id}`}
              disabled={!mode.isAvailable}
              onClick={() => onSelectMode(mode.id)}
            >
              <span className="creation-mode-selection__card-top">
                <span className="creation-mode-selection__icon">
                  <Icon size={22} />
                </span>

                <span className="creation-mode-selection__status">
                  {mode.label ? (
                    <span className="creation-mode-selection__badge">
                      {mode.label}
                    </span>
                  ) : null}

                  {isSelected ? (
                    <span className="creation-mode-selection__check">
                      <CheckIcon size={16} />
                    </span>
                  ) : null}
                </span>
              </span>

              <span className="creation-mode-selection__content">
                <strong>{mode.title}</strong>
                <span>{mode.description}</span>
                <small>{mode.actionLabel}</small>
              </span>
            </button>
          );
        })}
      </div>

      <aside className="creation-mode-selection__notice">
        <span className="creation-mode-selection__notice-icon">
          <InfoIcon size={18} />
        </span>
        <div>
          <strong>Créez à votre rythme, sans engagement</strong>
          <p>
            Toute création débute par un brouillon gratuit et illimité. Votre
            progression sera conservée pendant 30 jours pour vous laisser le
            temps de finaliser votre message.
          </p>
        </div>
      </aside>
    </div>
  );
}
