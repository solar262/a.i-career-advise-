import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-primary border-t border-brand-border mt-12">
      <div className="container mx-auto px-4 py-4 text-center text-brand-text-secondary text-sm">
        <p>&copy; {new Date().getFullYear()} Aura Intelligence. All rights reserved.</p>
        <p>Powered by AI to unlock human potential.</p>
      </div>
    </footer>
  );
};

export default Footer;