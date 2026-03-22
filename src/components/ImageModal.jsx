import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageModal({ images, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  if (!images || images.length === 0) return null;

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={24} />
        </button>
        
        {images.length > 1 && (
          <button className="modal-prev" onClick={handlePrev} aria-label="Previous image">
            <ChevronLeft size={36} />
          </button>
        )}
        
        <img src={images[currentIndex].src} alt={images[currentIndex].title || "Enlarged view"} className="modal-image" />
        
        {images.length > 1 && (
          <button className="modal-next" onClick={handleNext} aria-label="Next image">
            <ChevronRight size={36} />
          </button>
        )}
      </div>
    </div>
  );
}
