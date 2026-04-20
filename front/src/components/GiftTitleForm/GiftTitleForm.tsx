import "./GiftTitleForm.css";

type GiftTitleFormProps = {
  titleValue: string;
  onTitleChange: (value: string) => void;
  maxLength: number;
  disabled?: boolean;
};

export default function GiftTitleForm({
  titleValue,
  onTitleChange,
  maxLength,
  disabled = false,
}: GiftTitleFormProps) {
  return (
    <div className="gift-title-form">
      <label htmlFor="gift-title">Votre témoignage *</label>
      <input
        id="gift-title"
        type="text"
        value={titleValue}
        maxLength={maxLength}
        disabled={disabled}
        placeholder="À ma famille, avec tout mon amour"
        onChange={(event) => onTitleChange(event.target.value)}
      />
      <p>Ce titre servira de référence pour vous et vos bénéficiaires.</p>
    </div>
  );
}
