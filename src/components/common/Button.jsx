import React from 'react';

const variants = {
  primary:
    'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] shadow-sm hover:-translate-y-0.5 focus:ring-[var(--color-primary)]',
  secondary:
    'bg-white text-gray-700 border border-[var(--color-border)] hover:bg-gray-50 shadow-sm hover:-translate-y-0.5 focus:ring-gray-300',
  accent:
    'bg-[var(--color-secondary)] text-[#4A4A4A] hover:bg-[var(--color-secondary-dark)] hover:-translate-y-0.5 focus:ring-[var(--color-secondary)]',
  outline:
    'bg-transparent text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] focus:ring-[var(--color-primary)]',
  ghost:
    'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-300',
};

const sizes = {
  sm: 'px-4 h-9 text-sm',
  md: 'px-5 h-11 text-sm',
  lg: 'w-full max-w-[450px] h-[58px] text-lg',
};

const ArrowIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--color-primary)"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  iconRight,
  showArrow = false,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        'relative inline-flex items-center justify-center rounded-[50px] font-medium',
        'transition-all duration-200 ease-out active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        className,
      ].join(' ')}
      {...props}
    >
      {/* 
        Horizontal padding is responsive: 
        - Smaller px-10 on mobile to prevent extreme text wrapping.
        - Larger px-14/px-16 on larger screens to avoid overlap with the absolute icon.
      */}
      <span className="w-full text-center px-10 sm:px-14 xl:px-16 leading-tight">
        {children}
      </span>
      
      {(iconRight || showArrow) && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm transition-transform group-hover:translate-x-1">
          {showArrow ? (
            <ArrowIcon />
          ) : (
            <span className="text-[var(--color-primary)]">{iconRight}</span>
          )}
        </div>
      )}
    </button>
  );
}
