
import React from 'react';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
}

const Progress: React.FC<ProgressProps> = ({ className, value, ...props }) => {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div
      className={`relative h-2 w-full overflow-hidden rounded-full bg-secondary ${className}`}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - clampedValue}%)` }}
      />
    </div>
  );
};

export default Progress;
