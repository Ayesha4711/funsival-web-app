import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import StoreProvider from '@/store/StoreProvider';
import './globals.css';

const sophiaPro = Plus_Jakarta_Sans({
  variable: '--font-sophia-pro',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
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
      className={`${sophiaPro.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              unstyled: true,
              classNames: {
                toast:
                  "flex items-center gap-3 w-full bg-white rounded-2xl border border-[#F5C842] px-4 py-3.5 shadow-md",
                title: "text-sm font-semibold text-[#1A1A1A] leading-snug",
                description: "text-xs text-[#6B6B6B] mt-0.5 leading-snug",
                closeButton:
                  "ml-auto shrink-0 text-[#9E9E9E] hover:text-[#1A1A1A] transition-colors",
                error:
                  "flex items-center gap-3 w-full bg-white rounded-2xl border border-[#F5C842] px-4 py-3.5 shadow-md",
                success:
                  "flex items-center gap-3 w-full bg-white rounded-2xl border border-[#F5C842] px-4 py-3.5 shadow-md",
                warning:
                  "flex items-center gap-3 w-full bg-white rounded-2xl border border-[#F5C842] px-4 py-3.5 shadow-md",
                info:
                  "flex items-center gap-3 w-full bg-white rounded-2xl border border-[#4A90D9] px-4 py-3.5 shadow-md",
              },
            }}
          />
        </StoreProvider>
      </body>
    </html>
  );
}
