import { X } from 'lucide-react';

export default function ImageModal({ src, onClose }) {
  if (!src) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={24} />
        </button>
        <img src={src} alt="Enlarged view" className="modal-image" />
      </div>
    </div>
  );
}
