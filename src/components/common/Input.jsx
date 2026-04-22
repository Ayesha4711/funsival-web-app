import React from 'react';

export default function Input({
  id,
  label,
  type = 'text',
  placeholder = '',
  className = '',
  icon: Icon,
  suffix,
  hint,
  error,
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-semibold text-[var(--color-text)] ml-1"
        >
          {label}
        </label>
      )}
      <div className="relative group flex items-center">
        {Icon && (
          <div className="absolute left-4 text-[var(--color-text-subtle)] group-focus-within:text-[var(--color-primary)] transition-colors">
            {Icon}
          </div>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          onInput={props.onChange}
          className={[
            'w-full rounded-full border py-3.5 text-sm transition-all duration-200',
            Icon ? 'pl-11' : 'pl-5',
            suffix ? 'pr-12' : 'pr-5',
            'text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)]',
            error 
              ? 'border-red-300 bg-red-50/50 focus:ring-red-100 focus:border-red-400' 
              : 'border-[var(--color-border)] bg-white hover:border-[var(--color-text-subtle)] focus:ring-[var(--color-primary)/20] focus:border-[var(--color-primary)]',
            'focus:outline-none focus:ring-2',
            className,
          ].join(' ')}
          {...props}
        />
        {suffix && (
          <div className="absolute right-4 flex items-center">
            {suffix}
          </div>
        )}
      </div>
      {hint && !error && (
        <p className="text-xs text-[var(--color-text-muted)] ml-4">{hint}</p>
      )}
      {error && (
        <div className="flex items-center gap-1.5 ml-4 mt-0.5 text-red-500">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
