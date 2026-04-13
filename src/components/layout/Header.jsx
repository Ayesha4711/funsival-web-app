import React from 'react';
import Link from 'next/link';
import Button from '../common/Button';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {/* Logo Placeholder */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
            F
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Funsival
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Home
          </Link>
          <Link href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Features
          </Link>
          <Link href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Pricing
          </Link>
          <Link href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            About
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden sm:inline-flex">
            Log in
          </Button>
          <Button variant="primary">
            Get Started
          </Button>
          
          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
