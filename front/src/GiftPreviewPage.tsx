import {
  Check,
  CircleHelp,
  ImageIcon,
  Maximize2,
  Pencil,
  PlayCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getGiftById, type Gift } from "./api/gifts";
import { getGiftMedias, type GiftMedia } from "./api/giftMedia";
import Button from "./components/Button/Button";
import { getErrorMessage } from "./helpers/helpers";
import { useUserState } from "./store/useAppStore";
import "./GiftPreviewPage.css";

const previewInfoItems = [
  {
    icon: Pencil,
    title: "Gardez le contrôle",
    text: "Rien n'est définitif. Tant que votre Gift n'est pas activé, vous pouvez revenir en arrière pour ajuster vos mots ou changer vos photos.",
  },
  {
    icon: Maximize2,
    title: "Lisible partout",
    text: "Que vos proches ouvrent ce message sur un ordinateur, une tablette ou un smartphone, la mise en page s'adaptera parfaitement pour eux.",
  },
  {
    icon: CircleHelp,
    title: "Nous sommes là pour vous",
    text: "Une question sur le rendu ou besoin d'aide pour la mise en forme ? Notre équipe vous accompagne à chaque étape de votre création.",
  },
];

function getMessageHtml(message?: string) {
  if (!message || message.replace(/<[^>]*>/g, "").trim().length === 0) {
    return "<p>Aucun message renseigné.</p>";
  }

  return message;
}

export default function GiftPreviewPage() {
  const navigate = useNavigate();
  const { giftId } = useParams();
  const token = useUserState((state) => state.token);
  const numericGiftId = Number(giftId);

  const [gift, setGift] = useState<Gift | null>(null);
  const [medias, setMedias] = useState<GiftMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadPreview() {
      if (!token || !Number.isInteger(numericGiftId)) {
        setErrorMessage("Gift introuvable");
        setIsLoading(false);
        return;
      }

      try {
        const [giftResponse, mediaResponse] = await Promise.all([
          getGiftById(token, numericGiftId),
          getGiftMedias(token, numericGiftId),
        ]);

        setGift(giftResponse.gift);
        setMedias(mediaResponse.medias);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    loadPreview();
  }, [token, numericGiftId]);

  const hasMedias = medias.length > 0;

  return (
    <section className="gift-preview-page">
      <div className="gift-preview-page__content">
        <header className="gift-preview-page__header">
          <span className="gift-preview-page__kicker">
            Mode prévisualisation
          </span>
          <h1>Découvrez le message qu'ils recevront</h1>
          <p>
            Prenez un instant pour relire votre message. <br /> C'est ainsi que
            vos proches découvriront vos mots et vos images une fois le moment
            venu.
          </p>
        </header>

        {isLoading ? (
          <p className="gift-preview-page__status">Chargement...</p>
        ) : null}

        {errorMessage ? (
          <p className="gift-preview-page__error">{errorMessage}</p>
        ) : null}

        {!isLoading && gift ? (
          <article className="gift-preview-page__player">
            <div className="gift-preview-page__player-bar">
              <span aria-hidden="true"></span>
              <strong>LegacyGift preview</strong>
            </div>

            <div className="gift-preview-page__player-body">
              <h2>{gift.title || "Gift sans titre"}</h2>

              <div
                className="gift-preview-page__message"
                dangerouslySetInnerHTML={{
                  __html: getMessageHtml(gift.message),
                }}
              />

              {hasMedias ? (
                <section className="gift-preview-page__gallery">
                  {medias.map((media) => (
                    <figure key={media.id} className="gift-preview-page__media">
                      {media.type === "image" && media.url ? (
                        <img
                          src={media.url}
                          alt={media.originalName ?? "Souvenir"}
                        />
                      ) : null}

                      {media.type === "video" && media.url ? (
                        <video src={media.url} controls />
                      ) : null}

                      {!media.url ? (
                        <span>
                          {media.type === "video" ? (
                            <PlayCircle size={24} />
                          ) : (
                            <ImageIcon size={24} />
                          )}
                        </span>
                      ) : null}
                    </figure>
                  ))}
                </section>
              ) : null}
            </div>
          </article>
        ) : null}

        {!isLoading && gift ? (
          <div className="gift-preview-page__info-list">
            {previewInfoItems.map((item) => (
              <div key={item.title} className="gift-preview-page__info-item">
                <span className="gift-preview-page__info-icon">
                  <item.icon size={20} />
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="gift-preview-page__footer">
        <Button
          type="secondary"
          label="Modifier le contenu"
          href={`/gifts/${numericGiftId}/composition`}
          icon={<Pencil size={16} />}
          iconPosition="left"
        />
        <Button
          type="primary"
          label="Tout est correct"
          onClick={() => navigate(`/gifts/${numericGiftId}/recipients`)}
          icon={<Check size={18} />}
          iconPosition="right"
          disabled={isLoading || !gift}
        />
      </div>
    </section>
  );
}
