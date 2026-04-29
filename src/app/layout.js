import localFont from 'next/font/local';
import { Inter, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import StoreProvider from '@/store/StoreProvider';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const sofiaPro = localFont({
  src: [
    {
      path: '../../public/fonts/Sofia Pro Regular Az.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Sofia Pro Medium Az.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Sofia Pro Medium Az.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Sofia Pro Medium Az.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-sofia-pro',
  display: 'swap',
  adjustFontFallback: false,
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Funsival Dev',
  description: 'Funsival Dev Application',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sofiaPro.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          {children}
          <Toaster
            position="top-right"
            closeButton
            toastOptions={{
              unstyled: true,
              classNames: {
                toast:
                  "relative flex items-center gap-3 w-full bg-white rounded-2xl border border-[#F5C842] px-4 py-3.5",
                title: "text-sm font-semibold text-[#1A1A1A] leading-snug",
                description: "text-xs text-[#6B6B6B] mt-0.5 leading-snug",
                closeButton:
                  "!absolute !top-1/2 !-translate-y-1/2 !right-2 !left-auto !translate-x-0 !bg-gray-100 hover:!bg-gray-200 !border-0 !shadow-none !rounded-full !w-5 !h-5 !flex !items-center !justify-center text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors",
                error:
                  "relative flex items-center gap-3 w-full bg-white rounded-2xl border border-[#F5C842] px-4 py-3.5",
                success:
                  "relative flex items-center gap-3 w-full bg-white rounded-2xl border border-[#F5C842] px-4 py-3.5",
                warning:
                  "relative flex items-center gap-3 w-full bg-white rounded-2xl border border-[#F5C842] px-4 py-3.5",
                info:
                  "relative flex items-center gap-3 w-full bg-white rounded-2xl border border-[#4A90D9] px-4 py-3.5",
              },
            }}
          />
        </StoreProvider>
      </body>
    </html>
  );
}
