import { Trash2 } from "lucide-react";
import type { GiftMediaLibraryImage } from "../../api/giftMedia";
import "./GiftMediaLibrary.css";

type GiftMediaLibraryProps = {
  images: GiftMediaLibraryImage[];
  selectedImageId: number | null;
  deletingImageId: number | null;
  onSelectImage: (imageId: number) => void;
  onDeleteImage: (imageId: number) => void;
};

function formatFileSize(sizeBytes: number) {
  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function GiftMediaLibrary(props: GiftMediaLibraryProps) {
  return (
    <div className="gift-media-library">
      <div className="gift-media-library__header">
        <h2>Galerie</h2>
        <p>Images deja importees, disponibles pour ce gift.</p>
      </div>

      {props.images.length > 0 ? (
        <div className="gift-media-library__grid">
          {props.images.map((image) => (
            <article key={image.id} className="gift-media-library__card">
              <button
                type="button"
                className="gift-media-library__delete"
                aria-label="Supprimer cette image de la galerie"
                disabled={props.deletingImageId === image.id}
                onClick={() => props.onDeleteImage(image.id)}
              >
                <Trash2 size={15} />
              </button>
              <button
                type="button"
                className="gift-media-library__select"
                disabled={
                  props.selectedImageId === image.id ||
                  props.deletingImageId === image.id
                }
                onClick={() => props.onSelectImage(image.id)}
              >
                <span className="gift-media-library__preview">
                  {image.url ? (
                    <img
                      src={image.url}
                      alt={image.originalName ?? "Image importee"}
                    />
                  ) : null}
                </span>
                <span className="gift-media-library__footer">
                  <strong>{image.originalName ?? "image"}</strong>
                  <small>
                    {props.deletingImageId === image.id
                      ? "Suppression"
                      : props.selectedImageId === image.id
                        ? "Ajout en cours"
                        : formatFileSize(image.sizeBytes)}
                  </small>
                </span>
              </button>
            </article>
          ))}
        </div>
      ) : (
        <p className="gift-media-library__empty">
          Aucune image disponible dans la galerie.
        </p>
      )}
    </div>
  );
}
