import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google';
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
  title: 'Funsival – Provider Signup',
  description: 'Sign up as a Funsival provider and grow your business.',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${sophiaPro.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
