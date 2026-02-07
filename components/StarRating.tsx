export function StarIcon({
  filled = true,
  className = "w-5 h-5",
}: {
  filled?: boolean;
  className?: string;
}) {
  if (filled) {
    return (
      <svg
        className={`${className} text-yellow-400`}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }

  return (
    <svg
      className={`${className} text-gray-300`}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function StarRating({
  rating,
  size = "w-5 h-5",
  showLabel = true,
}: {
  rating: number | null;
  size?: string;
  showLabel?: boolean;
}) {
  if (rating === null) {
    return <span className="text-gray-400">レビューなし</span>;
  }

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="relative">
            {i < fullStars ? (
              <StarIcon filled={true} className={size} />
            ) : i === fullStars && hasHalfStar ? (
              <div className="relative">
                <StarIcon filled={false} className={size} />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: "50%" }}
                >
                  <StarIcon filled={true} className={size} />
                </div>
              </div>
            ) : (
              <StarIcon filled={false} className={size} />
            )}
          </div>
        ))}
      </div>
      {showLabel && (
        <span className="text-sm font-semibold text-gray-900">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export function SimpleStarDisplay({
  rating,
  size = "w-4 h-4",
}: {
  rating: number;
  size?: string;
}) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: Math.round(rating) }).map((_, i) => (
        <StarIcon key={i} filled={true} className={size} />
      ))}
    </div>
  );
}
