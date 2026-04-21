import React from 'react';
import Image from 'next/image';
import googleIcon from '@/assets/icons/Google.jpg';
import facebookIcon from '@/assets/icons/Facebook.jpg';
import appleIcon from '@/assets/icons/Iphone.jpg';
import emailIcon from '@/assets/icons/Email.jpg';

const ICON_MAP = {
  google: googleIcon,
  facebook: facebookIcon,
  apple: appleIcon,
  email: emailIcon,
};

export default function SocialButton({ type, icon, label, onClick, className = '' }) {
  const assetIcon = type ? ICON_MAP[type] : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex w-full items-center justify-center rounded-full border border-[var(--color-border)]',
        'bg-white px-6 py-4 text-sm font-semibold text-[var(--color-text)]',
        'cursor-pointer hover:bg-gray-50 transition-all duration-150 active:scale-[0.98]',
        'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-1',
        className,
      ].join(' ')}
    >
      <div className="flex items-center w-[210px]">
        <span className="shrink-0 flex items-center justify-center w-6 mr-3">
          {assetIcon ? (
            <Image src={assetIcon} alt={label} width={20} height={20} className="object-contain" />
          ) : (
            icon && <span className="scale-110">{icon}</span>
          )}
        </span>
        <span className="flex-1 text-left">{label}</span>
      </div>
    </button>
  );
}
