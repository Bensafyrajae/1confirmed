import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  text?: string;
  center?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const colorClasses = {
  primary: 'border-indigo-500',
  secondary: 'border-gray-500',
  white: 'border-white',
  gray: 'border-gray-300',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
  center = false,
}) => {
  const spinnerElement = (
    <div className="flex flex-col items-center space-y-2">
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin rounded-full border-2 border-t-transparent`}
        role="status"
        aria-label="Chargement"
      />
      {text && (
        <p className="text-sm text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );

  if (center) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

// Composant pour les états de chargement pleine page
export const FullPageLoader: React.FC<{ text?: string }> = ({ text = 'Chargement...' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
    <LoadingSpinner size="xl" text={text} />
  </div>
);

// Composant pour les overlays de chargement
export const LoadingOverlay: React.FC<{ text?: string }> = ({ text }) => (
  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-60 backdrop-blur-sm rounded-lg">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

export default LoadingSpinner;import React from 'react';
import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'current';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    white: 'text-white',
    current: 'text-current',
  };

  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-2 border-transparent',
        'border-t-current border-r-current',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export { LoadingSpinner };
export default LoadingSpinner;