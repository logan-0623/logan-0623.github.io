import React, { useState, useEffect } from 'react';
import { Menu, X, Github, Mail, Moon, Sun } from 'lucide-react';
import { PROFILE } from '../constants';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDark, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Profile', href: '#profile' },
    { name: 'Education', href: '#education' },
    { name: 'Research', href: '#experience' },
    { name: 'Publications', href: '#publications' },
  ];

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#fafaf9]/90 dark:bg-[#0c0a09]/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 py-3' 
          : 'bg-transparent border-b border-transparent py-6'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <div 
          className="text-xl font-serif font-bold cursor-pointer text-stone-900 dark:text-stone-100 tracking-tight border-2 border-stone-900 dark:border-stone-100 px-2 py-1" 
          onClick={() => handleNavClick('#profile')}
        >
          ZL.
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.href)}
              className="text-sm font-mono text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors relative group"
            >
              <span className="opacity-0 -ml-3 group-hover:opacity-100 transition-all duration-300 text-stone-400 inline-block absolute left-0 transform group-hover:-translate-x-2">&lt;</span>
              {link.name}
              <span className="opacity-0 -mr-3 group-hover:opacity-100 transition-all duration-300 text-stone-400 inline-block absolute right-0 transform group-hover:translate-x-2">/&gt;</span>
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-5">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors text-stone-900 dark:text-stone-100 rounded-full"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="h-4 w-px bg-stone-300 dark:bg-stone-700"></div>
          <a href={`mailto:${PROFILE.email}`} className="text-stone-500 hover:text-black dark:text-stone-400 dark:hover:text-stone-100 transition-colors">
            <Mail size={18} />
          </a>
          <a href={`https://${PROFILE.website}`} target="_blank" rel="noreferrer" className="text-stone-500 hover:text-black dark:text-stone-400 dark:hover:text-stone-100 transition-colors">
            <Github size={18} />
          </a>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 md:hidden">
            <button
                onClick={toggleTheme}
                className="text-stone-900 dark:text-stone-100"
            >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
                className="text-stone-900 dark:text-stone-100"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#fafaf9] dark:bg-[#0c0a09] border-b border-stone-200 dark:border-stone-800 p-6 flex flex-col gap-4 shadow-xl">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.href)}
              className="text-left text-lg font-mono font-medium text-stone-900 dark:text-stone-100"
            >
              {link.name}
            </button>
          ))}
          <div className="flex gap-4 pt-4 border-t border-stone-200 dark:border-stone-800">
            <a href={`mailto:${PROFILE.email}`} className="text-stone-600 dark:text-stone-400">
              <Mail size={22} />
            </a>
            <a href={`https://${PROFILE.website}`} target="_blank" rel="noreferrer" className="text-stone-600 dark:text-stone-400">
              <Github size={22} />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;