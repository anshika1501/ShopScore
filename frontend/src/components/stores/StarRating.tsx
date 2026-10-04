import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number | null; // 1-5 or null (supports fractional ratings like 4.5)
  onChange?: (rating: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  interactive = false,
  size = 'md',
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const activeValue = hoverValue !== null ? hoverValue : value || 0;

  return (
    <div
      className="inline-flex items-center space-x-1"
      role="img"
      aria-label={`Rating: ${activeValue} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        // Compute fill percentage (supports half-stars for fractional ratings)
        let fillPercentage = 0;
        if (interactive) {
          fillPercentage = star <= activeValue ? 100 : 0;
        } else {
          const diff = activeValue - (star - 1);
          if (diff >= 0.75) {
            fillPercentage = 100;
          } else if (diff >= 0.25) {
            fillPercentage = 50;
          } else {
            fillPercentage = 0;
          }
        }

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(star)}
            onMouseEnter={() => interactive && setHoverValue(star)}
            onMouseLeave={() => interactive && setHoverValue(null)}
            className={`relative inline-flex items-center justify-center ${
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
            } focus:outline-none`}
            title={interactive ? `Rate ${star} star${star > 1 ? 's' : ''}` : `${activeValue} / 5 stars`}
          >
            {/* Background base star */}
            <Star
              className={`${sizeMap[size]} text-gray-300 fill-transparent transition-colors`}
            />

            {/* Foreground star with proportional clip for half/full stars */}
            {fillPercentage > 0 && (
              <span
                className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
                style={{ width: `${fillPercentage}%` }}
              >
                <Star
                  className={`${sizeMap[size]} text-yellow-400 fill-yellow-400 max-w-none shrink-0 transition-colors`}
                />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
