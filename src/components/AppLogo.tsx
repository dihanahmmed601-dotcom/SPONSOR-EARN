import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface AppLogoProps {
  className?: string;
  imgClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  src?: string;
  alt?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  imgClassName = '',
  size = 'md',
  showText = false,
  src = '/app-logo.png?v=2',
  alt = 'SPONSOR EARN'
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-16 h-16 rounded-2xl',
    xl: 'w-24 h-24 rounded-3xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const containerClass = `${sizeClasses[size]} overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-lg shadow-amber-500/20 relative ${className}`;

  return (
    <div className="flex items-center gap-3">
      <div className={containerClass}>
        {!hasError ? (
          <img
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            className={`w-full h-full object-cover ${imgClassName}`}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-inner">
            <Sparkles className={`${iconSizes[size]} text-slate-950 animate-pulse`} />
          </div>
        )}
      </div>
      {showText && (
        <div>
          <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-amber-300 via-amber-200 to-white bg-clip-text text-transparent">
            SPONSOR EARN
          </h1>
          <p className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">
            Watch • Earn • Grow
          </p>
        </div>
      )}
    </div>
  );
};
