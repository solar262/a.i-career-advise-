import React from 'react';
import { LogoIcon } from './IconComponents';

const Header: React.FC = () => {
  return (
    <header className="bg-brand-primary/80 backdrop-blur-sm sticky top-0 z-50 border-b border-brand-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <LogoIcon className="w-8 h-8 text-brand-accent" />
          <div>
            <h1 className="text-2xl font-bold text-brand-text-primary tracking-tight">
              Aura
            </h1>
            <p className="text-sm text-brand-text-secondary">Predictive Training Intelligence</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;