import React from 'react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
                F
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Funsival
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Building the future of modern web experiences with premium UI and interaction design.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Features</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Integrations</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Pricing</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Changelog</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Funsival. All rights reserved.
          </p>
          <div className="flex gap-4">
            {/* Social icons placeholders */}
            <div className="w-8 h-8 rounded-full bg-slate-200 hover:bg-indigo-100 transition-colors cursor-pointer"></div>
            <div className="w-8 h-8 rounded-full bg-slate-200 hover:bg-indigo-100 transition-colors cursor-pointer"></div>
            <div className="w-8 h-8 rounded-full bg-slate-200 hover:bg-indigo-100 transition-colors cursor-pointer"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
