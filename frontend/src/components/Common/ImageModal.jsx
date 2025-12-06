import React from "react";
import { RxCross1 } from "react-icons/rx";

const ImageModal = ({ isOpen, onClose, imageUrl, images = [], currentIndex = 0 }) => {
  const [currentIdx, setCurrentIdx] = React.useState(currentIndex);
  const hasMultiple = images.length > 1;

  React.useEffect(() => {
    setCurrentIdx(currentIndex);
  }, [currentIndex, isOpen]);

  const handlePrev = React.useCallback(() => {
    if (hasMultiple) {
      setCurrentIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    }
  }, [hasMultiple, images.length]);

  const handleNext = React.useCallback(() => {
    if (hasMultiple) {
      setCurrentIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }
  }, [hasMultiple, images.length]);

  React.useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          onClose();
        } else if (e.key === "ArrowLeft" && hasMultiple) {
          handlePrev();
        } else if (e.key === "ArrowRight" && hasMultiple) {
          handleNext();
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "auto";
      };
    }
  }, [isOpen, hasMultiple, handlePrev, handleNext, onClose]);

  if (!isOpen) return null;

  // Determine which image to show
  const currentImage = images.length > 0 ? images[currentIdx] : imageUrl;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black bg-opacity-90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-all"
        >
          <RxCross1 size={24} />
        </button>

        {/* Previous Button */}
        {hasMultiple && (
          <button
            onClick={handlePrev}
            className="absolute left-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 transition-all"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* Image */}
        <img
          src={currentImage}
          alt="Preview"
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/800";
          }}
        />

        {/* Next Button */}
        {hasMultiple && (
          <button
            onClick={handleNext}
            className="absolute right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 transition-all"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

        {/* Image Counter */}
        {hasMultiple && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
            {currentIdx + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageModal;

