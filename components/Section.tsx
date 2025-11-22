import React from 'react';

interface SectionProps {
  id: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ id, title, subtitle, children, className = "" }) => {
  return (
    <section id={id} className={`py-24 relative z-10 ${className}`}>
      <div className="max-w-5xl mx-auto px-6">
        {(title || subtitle) && (
          <div className="mb-16 flex flex-col md:flex-row md:items-baseline gap-4 md:gap-8 border-b border-stone-200 dark:border-stone-800 pb-6">
            {title && (
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-stone-500 dark:text-stone-400 font-mono text-xs uppercase tracking-widest">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;