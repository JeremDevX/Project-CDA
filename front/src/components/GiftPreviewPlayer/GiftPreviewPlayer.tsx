import { ImageIcon, PlayCircle } from "lucide-react";
import type { GiftMedia } from "../../api/giftMedia";
import "./GiftPreviewPlayer.css";

type GiftPreviewPlayerProps = {
  title?: string;
  message?: string;
  medias: GiftMedia[];
};

function getMessageHtml(message?: string) {
  if (!message || message.replace(/<[^>]*>/g, "").trim().length === 0) {
    return "<p>Aucun message renseigné.</p>";
  }

  return message;
}

export default function GiftPreviewPlayer(props: GiftPreviewPlayerProps) {
  return (
    <article className="gift-preview-player">
      <div className="gift-preview-player__bar">
        <span aria-hidden="true" />
        <strong>LegacyGift Preview</strong>
      </div>

      <div className="gift-preview-player__body">
        <h2>{props.title || "Gift sans titre"}</h2>

        <div
          className="gift-preview-player__message"
          dangerouslySetInnerHTML={{
            __html: getMessageHtml(props.message),
          }}
        />

        {props.medias.length > 0 ? (
          <section className="gift-preview-player__gallery">
            {props.medias.map((media) => (
              <figure key={media.id} className="gift-preview-player__media">
                {media.type === "image" && media.url ? (
                  <img src={media.url} alt={media.originalName ?? "Souvenir"} />
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
  );
}
