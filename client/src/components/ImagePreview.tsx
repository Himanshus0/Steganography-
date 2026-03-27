interface Props {
  originalSrc: string | null;
  encodedSrc: string | null;
}

export function ImagePreview({ originalSrc, encodedSrc }: Props) {
  if (!originalSrc && !encodedSrc) return null;

  return (
    <div className="image-preview-container">
      {originalSrc && (
        <div className="preview-card">
          <div className="preview-badge">Original</div>
          <img src={originalSrc} alt="Original cover" className="preview-img" />
        </div>
      )}
      {encodedSrc && (
        <div className="preview-card">
          <div className="preview-badge preview-badge--encoded">Encoded</div>
          <img src={encodedSrc} alt="Encoded image with hidden message" className="preview-img" />
          <div className="preview-hint">Visually identical — secret hidden inside ✓</div>
        </div>
      )}
    </div>
  );
}
