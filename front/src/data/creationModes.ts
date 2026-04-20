import { BookOpenIcon, PenLineIcon, type LucideIcon } from "lucide-react";

export type CreationModeId = "free-writing" | "inspiration-guide";

export type CreationMode = {
  id: CreationModeId;
  title: string;
  label?: string;
  description: string;
  actionLabel: string;
  icon: LucideIcon;
  isAvailable: boolean;
};

export const creationModes: CreationMode[] = [
  {
    id: "free-writing",
    title: "Écriture libre",
    label: "Populaire",
    description:
      "Exprimez-vous avec vos propres mots, sans contraintes. Un espace épuré pour confier vos pensées, vos souvenirs et vos conseils en toute intimité.",
    actionLabel: "Sélectionner ce mode",
    icon: PenLineIcon,
    isAvailable: true,
  },
  {
    id: "inspiration-guide",
    title: "Guide d'inspiration",
    label: "WIP",
    description:
      "Laissez-vous porter par des thématiques suggérées. Ce parcours structuré pourra aider à ne rien oublier d'essentiel.",
    actionLabel: "Bientôt disponible",
    icon: BookOpenIcon,
    isAvailable: false,
  },
];
