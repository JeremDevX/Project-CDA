export type OfferPlanId = "essentiel" | "standard" | "premium";

export type OfferPlan = {
  id: OfferPlanId;
  title: string;
  price: string;
  taxLabel: string;
  badge?: string;
  isPopular?: boolean;
  recipientLimit: number | null;
  recipientLimitLabel: string;
  recipientPreviewCount: number;
  imageLimit: number | null;
  imageLimitLabel: string;
  imagePreviewCount: number;
  allowsVideo: boolean;
  videoLabel: string;
  features: string[];
};

export const offerPlans: OfferPlan[] = [
  {
    id: "essentiel",
    title: "Essentiel",
    price: "19€",
    taxLabel: "TTC",
    recipientLimit: 1,
    recipientLimitLabel: "1 destinataire unique",
    recipientPreviewCount: 1,
    imageLimit: 0,
    imageLimitLabel: "Aucune image",
    imagePreviewCount: 0,
    allowsVideo: false,
    videoLabel: "Vidéo non incluse",
    features: [
      "1 destinataire unique",
      "Conservation 10 ans",
      "Message texte illimité",
    ],
  },
  {
    id: "standard",
    title: "Standard",
    price: "39€",
    taxLabel: "TTC",
    badge: "La plus populaire",
    isPopular: true,
    recipientLimit: 5,
    recipientLimitLabel: "Jusqu'à 5 destinataires",
    recipientPreviewCount: 2,
    imageLimit: 10,
    imageLimitLabel: "10 images HD",
    imagePreviewCount: 4,
    allowsVideo: false,
    videoLabel: "Vidéo non incluse",
    features: [
      "Jusqu'à 5 destinataires",
      "Conservation 25 ans",
      "Texte + 10 images HD",
    ],
  },
  {
    id: "premium",
    title: "Premium",
    price: "49€",
    taxLabel: "TTC",
    recipientLimit: null,
    recipientLimitLabel: "Destinataires illimités",
    recipientPreviewCount: 3,
    imageLimit: null,
    imageLimitLabel: "Images illimitées",
    imagePreviewCount: 4,
    allowsVideo: true,
    videoLabel: "Vidéo incluse",
    features: [
      "Destinataires illimités",
      "Conservation à vie",
      "Texte + images + vidéo",
    ],
  },
];
