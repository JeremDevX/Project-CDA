import { FileImage, ImageIcon, Info, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  getGiftById,
  updateGift,
  type Gift,
  type GiftEditionStep,
} from "./api/gifts";
import {
  deleteGiftMedia,
  deleteGiftMediaAsset,
  getGiftMediaLibrary,
  getGiftMedias,
  reuseGiftMedia,
  uploadGiftMedia,
  type GiftMedia,
  type GiftMediaLibraryImage,
  type GiftMediaType,
} from "./api/giftMedia";
import Button from "./components/Button/Button";
import GiftMediaLibrary from "./components/GiftMediaLibrary/GiftMediaLibrary";
import GiftStepNav from "./components/GiftStepNav/GiftStepNav";
import { getErrorMessage } from "./helpers/helpers";
import { getGiftSlotSummary } from "./helpers/offerLimits";
import { useUserState } from "./store/useAppStore";
import "./GiftMediaPage.css";

const MAX_MEDIA_FILE_SIZE_BYTES = 5 * 1024 * 1024;
type MediaSourceTab = "upload" | "library";

function formatFileSize(sizeBytes: number) {
  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function GiftMediaPage() {
  const navigate = useNavigate();
  const { giftId } = useParams();
  const token = useUserState((state) => state.token);
  const numericGiftId = Number(giftId);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [gift, setGift] = useState<Gift | null>(null);
  const [medias, setMedias] = useState<GiftMedia[]>([]);
  const [libraryImages, setLibraryImages] = useState<GiftMediaLibraryImage[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedLibraryImageId, setSelectedLibraryImageId] = useState<
    number | null
  >(null);
  const [deletingLibraryImageId, setDeletingLibraryImageId] = useState<
    number | null
  >(null);
  const [isSavingStep, setIsSavingStep] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeSourceTab, setActiveSourceTab] =
    useState<MediaSourceTab>("upload");
  const [errorMessage, setErrorMessage] = useState("");
  const [lastEditionStep, setLastEditionStep] =
    useState<GiftEditionStep | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!token || !Number.isInteger(numericGiftId)) {
        setErrorMessage("Gift introuvable");
        setIsLoading(false);
        return;
      }

      try {
        const [giftResponse, mediaResponse, libraryResponse] =
          await Promise.all([
            getGiftById(token, numericGiftId),
            getGiftMedias(token, numericGiftId),
            getGiftMediaLibrary(token, numericGiftId),
          ]);

        setGift(giftResponse.gift);
        setLastEditionStep(giftResponse.gift.lastEditionStep ?? null);
        setMedias(mediaResponse.medias);
        setLibraryImages(libraryResponse.images);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [token, numericGiftId]);

  async function refreshLibraryImages() {
    if (!token || !Number.isInteger(numericGiftId)) {
      return;
    }

    const response = await getGiftMediaLibrary(token, numericGiftId);
    setLibraryImages(response.images);
  }

  const limits = getGiftSlotSummary(gift?.offer);
  const imageCount = medias.filter((media) => media.type === "image").length;
  const videoCount = medias.filter((media) => media.type === "video").length;

  const canUploadImage =
    limits?.imageLimit !== undefined &&
    (limits.imageLimit === null || imageCount < limits.imageLimit);

  const canUploadVideo =
    limits?.videoLimit !== undefined && videoCount < limits.videoLimit;

  const canUploadMedia = canUploadImage || canUploadVideo;
  const totalLimit =
    limits?.imageLimit === null
      ? null
      : (limits?.imageLimit ?? 0) + (limits?.videoLimit ?? 0);
  const mediaCount = medias.length;
  const remainingCount =
    totalLimit === null ? null : Math.max(totalLimit - mediaCount, 0);
  const counterLabel =
    totalLimit === null ? `${mediaCount}/∞` : `${mediaCount}/${totalLimit}`;
  const acceptedFormats = [
    canUploadImage ? "image/jpeg,image/png,image/heic,image/heif" : "",
    canUploadVideo ? "video/mp4,video/webm,video/quicktime" : "",
  ]
    .filter(Boolean)
    .join(",");
  const availableLibraryImages = libraryImages.filter(
    (image) => !image.isAlreadyLinked,
  );

  function getFileMediaType(file: File): GiftMediaType | null {
    if (file.type.startsWith("image/")) {
      return "image";
    }

    if (file.type.startsWith("video/")) {
      return "video";
    }

    return null;
  }

  async function uploadFile(file: File) {
    if (!token || !Number.isInteger(numericGiftId)) {
      return;
    }

    if (file.size > MAX_MEDIA_FILE_SIZE_BYTES) {
      setErrorMessage("Le fichier ne doit pas depasser 5 MB");
      return;
    }

    const mediaType = getFileMediaType(file);

    if (!mediaType) {
      setErrorMessage("Format de fichier non autorise");
      return;
    }

    if (mediaType === "image" && !canUploadImage) {
      setErrorMessage("Limite d'images atteinte ou offre incompatible");
      return;
    }

    if (mediaType === "video" && !canUploadVideo) {
      setErrorMessage("Limite de videos atteinte ou offre incompatible");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");

    try {
      const response = await uploadGiftMedia(
        token,
        numericGiftId,
        mediaType,
        file,
      );
      setMedias((currentMedias) => [...currentMedias, response.media]);
      await refreshLibraryImages();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleFiles(files?: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    for (const file of Array.from(files)) {
      await uploadFile(file);
    }
  }

  async function handleDelete(mediaId: number) {
    if (!token || !Number.isInteger(numericGiftId)) {
      return;
    }

    try {
      await deleteGiftMedia(token, numericGiftId, mediaId);
      setMedias((currentMedias) =>
        currentMedias.filter((media) => media.id !== mediaId),
      );
      await refreshLibraryImages();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  async function handleReuseImage(sourceMediaId: number) {
    if (!token || !Number.isInteger(numericGiftId)) {
      return;
    }

    setSelectedLibraryImageId(sourceMediaId);
    setErrorMessage("");

    try {
      const response = await reuseGiftMedia(
        token,
        numericGiftId,
        sourceMediaId,
      );
      setMedias((currentMedias) => [...currentMedias, response.media]);
      await refreshLibraryImages();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSelectedLibraryImageId(null);
    }
  }

  async function handleDeleteLibraryImage(mediaAssetId: number) {
    if (!token || !Number.isInteger(numericGiftId)) {
      return;
    }

    const shouldDelete = window.confirm(
      "Supprimer cette image de la galerie ? Elle sera aussi retiree des autres gifts qui l'utilisent.",
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingLibraryImageId(mediaAssetId);
    setErrorMessage("");

    try {
      await deleteGiftMediaAsset(token, numericGiftId, mediaAssetId);
      setLibraryImages((currentImages) =>
        currentImages.filter((image) => image.id !== mediaAssetId),
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setDeletingLibraryImageId(null);
    }
  }

  async function handleNext() {
    if (!token || !Number.isInteger(numericGiftId)) {
      return;
    }

    setIsSavingStep(true);
    setErrorMessage("");

    try {
      await updateGift(token, numericGiftId, { lastEditionStep: "preview" });
      navigate(`/gifts/${numericGiftId}/preview`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSavingStep(false);
    }
  }

  return (
    <section className="gift-media-page">
      {Number.isInteger(numericGiftId) ? (
        <GiftStepNav
          giftId={numericGiftId}
          currentStep="images"
          lastEditionStep={lastEditionStep}
        />
      ) : null}

      <div className="gift-media-page__content">
        <header className="gift-media-page__header">
          <h1>Illustrez votre message</h1>
          <p>Ajoutez des photos pour accompagner vos mots.</p>
          <small>
            Ces souvenirs visuels seront precieusement conserves avec votre
            temoignage.
          </small>
        </header>

        {isLoading ? (
          <p className="gift-media-page__status">Chargement...</p>
        ) : null}

        {!isLoading && !canUploadMedia ? (
          <aside className="gift-media-page__notice">
            Cette offre ne permet pas d'ajouter de medias ou la limite est
            atteinte.
          </aside>
        ) : null}

        {canUploadMedia ? (
          <section className="gift-media-page__source">
            <div className="gift-media-page__tabs" role="tablist">
              <button
                type="button"
                className={
                  activeSourceTab === "upload"
                    ? "gift-media-page__tab gift-media-page__tab--active"
                    : "gift-media-page__tab"
                }
                aria-selected={activeSourceTab === "upload"}
                onClick={() => setActiveSourceTab("upload")}
              >
                <Upload size={16} />
                Importer
              </button>
              <button
                type="button"
                className={
                  activeSourceTab === "library"
                    ? "gift-media-page__tab gift-media-page__tab--active"
                    : "gift-media-page__tab"
                }
                aria-selected={activeSourceTab === "library"}
                disabled={!canUploadImage}
                onClick={() => setActiveSourceTab("library")}
              >
                <ImageIcon size={16} />
                Galerie
              </button>
            </div>

            {activeSourceTab === "upload" ? (
              <div
                className={[
                  "gift-media-page__dropzone",
                  isDragging ? "gift-media-page__dropzone--active" : "",
                ].join(" ")}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  handleFiles(event.dataTransfer.files);
                }}
              >
                <span className="gift-media-page__drop-icon">
                  <Upload size={28} />
                </span>
                <strong>Glissez vos plus beaux souvenirs ici</strong>
                <p>Ou parcourez vos fichiers pour selectionner vos medias.</p>

                <button
                  type="button"
                  className="gift-media-page__upload-button"
                  data-testid="gift-media-upload-button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon size={16} />
                  {isUploading
                    ? "Ajout en cours"
                    : canUploadVideo
                      ? "Choisir des medias"
                      : "Choisir des photos"}
                </button>

                <input
                  ref={fileInputRef}
                  aria-label="Choisir des medias a importer"
                  type="file"
                  accept={acceptedFormats}
                  multiple
                  disabled={isUploading}
                  onChange={(event) => {
                    handleFiles(event.target.files);
                    event.target.value = "";
                  }}
                />

                <div className="gift-media-page__drop-meta">
                  <span>
                    <FileImage size={14} />
                    Formats acceptes : JPG, PNG, HEIC
                    {canUploadVideo ? ", MP4, WebM, MOV" : ""}
                  </span>
                  <span>
                    <Info size={14} />
                    Taille max par fichier : 5 Mo
                  </span>
                </div>
              </div>
            ) : null}

            {activeSourceTab === "library" ? (
              <GiftMediaLibrary
                images={availableLibraryImages}
                selectedImageId={selectedLibraryImageId}
                deletingImageId={deletingLibraryImageId}
                onSelectImage={handleReuseImage}
                onDeleteImage={handleDeleteLibraryImage}
              />
            ) : null}
          </section>
        ) : (
          <input
            ref={fileInputRef}
            aria-label="Import de medias indisponible"
            type="file"
            accept={acceptedFormats}
            multiple
            disabled
            className="gift-media-page__hidden-input"
          />
        )}

        <section className="gift-media-page__souvenirs">
          <div className="gift-media-page__souvenirs-header">
            <div className="gift-media-page__souvenirs-title">
              <h2>Vos souvenirs</h2>
              <span>{counterLabel}</span>
            </div>

            {remainingCount !== null && remainingCount > 0 ? (
              <p>
                Ces images seront jointes a votre message final. Vous pouvez
                encore en ajouter {remainingCount}.
              </p>
            ) : null}
          </div>

          <div className="gift-media-page__grid">
            {medias.map((media) => (
              <article key={media.id} className="gift-media-page__card">
                <div className="gift-media-page__preview">
                  {media.type === "image" && media.url ? (
                    <img
                      src={media.url}
                      alt={media.originalName ?? "Souvenir"}
                    />
                  ) : null}

                  {media.type === "video" && media.url ? (
                    <video src={media.url} controls />
                  ) : null}
                </div>

                <div className="gift-media-page__card-footer">
                  <div>
                    <strong>{media.originalName ?? "media"}</strong>
                    <small>{formatFileSize(media.sizeBytes)}</small>
                  </div>
                  <button
                    type="button"
                    aria-label="Supprimer ce media"
                    onClick={() => handleDelete(media.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}

            {canUploadMedia && medias.length > 0 ? (
              <button
                type="button"
                className="gift-media-page__add-card"
                disabled={isUploading}
                onClick={() => {
                  setActiveSourceTab("upload");
                  window.setTimeout(() => fileInputRef.current?.click(), 0);
                }}
              >
                <Upload size={24} />
                <span>Ajouter une autre</span>
              </button>
            ) : null}
          </div>
        </section>

        {errorMessage ? (
          <p className="gift-media-page__error">{errorMessage}</p>
        ) : null}
      </div>

      <div className="gift-media-page__footer">
        <Button
          type="secondary"
          label="Retour"
          href={`/gifts/${numericGiftId}/composition`}
        />
        <Button
          type="primary"
          label={isSavingStep ? "Enregistrement" : "Suivant"}
          onClick={handleNext}
          disabled={isSavingStep}
          dataTestId="gift-media-next"
        />
      </div>
    </section>
  );
}
