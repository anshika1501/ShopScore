import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number | null; // 1-5 or null
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
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= Math.round(activeValue);

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(star)}
            onMouseEnter={() => interactive && setHoverValue(star)}
            onMouseLeave={() => interactive && setHoverValue(null)}
            className={`${
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
            } focus:outline-none`}
            title={interactive ? `Rate ${star} star${star > 1 ? 's' : ''}` : undefined}
          >
            <Star
              className={`${sizeMap[size]} ${
                isFilled
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 fill-transparent'
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
};
