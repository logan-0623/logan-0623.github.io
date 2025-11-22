import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import BackgroundGraph from './components/BackgroundGraph';
import Section from './components/Section';
import { PROFILE, EDUCATION, EXPERIENCE, PUBLICATIONS, PROJECTS, SKILLS, AWARDS, COURSEWORK } from './constants';
import { 
  MapPin, GraduationCap, ExternalLink, 
  ChevronRight, Download,
  Award, Mail, Github, Terminal, BookOpen
} from 'lucide-react';

// --- Components ---

const SpotlightCard = ({ children, className = "", href }: { children: React.ReactNode; className?: string, href?: string }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const Content = (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden h-full transition-all duration-300 
        bg-white dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800 
        hover:border-stone-400 dark:hover:border-stone-600 hover:scale-[1.01] hover:shadow-lg dark:hover:shadow-stone-900/20 ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(68, 64, 60, 0.05), transparent 40%)`,
        }}
      />
       <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0 dark:block hidden"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );

  if (href) {
    return <a href={href} target="_blank" rel="noreferrer" className="block h-full">{Content}</a>;
  }
  return Content;
};

const FadeIn: React.FC<{children: React.ReactNode, delay?: number}> = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
         if (entry.isIntersecting) setIsVisible(true);
      });
    }, { threshold: 0.1 });
    if (domRef.current) observer.observe(domRef.current);
    return () => {
      if (domRef.current) observer.unobserve(domRef.current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored) {
      setIsDark(stored === 'dark');
    } else {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  if (!loaded) return null;

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100 transition-colors duration-500 selection:bg-stone-900 selection:text-white dark:selection:bg-stone-200 dark:selection:text-black">
      <BackgroundGraph isDark={isDark} />
      <Navbar isDark={isDark} toggleTheme={toggleTheme} />

      {/* Hero Section */}
      <header id="profile" className="min-h-screen flex items-center relative z-10 pt-20">
        <div className="max-w-5xl mx-auto px-6 w-full">
            <FadeIn>
              <div className="max-w-4xl space-y-10">
                <div className="inline-flex items-center gap-3 px-4 py-2 text-xs font-mono border border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-black/50 backdrop-blur text-stone-600 dark:text-stone-400 uppercase tracking-widest rounded-full">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Open for Opportunities 2026
                </div>
                
                <h1 className="text-7xl md:text-9xl font-serif font-bold text-stone-900 dark:text-stone-50 tracking-tighter leading-none">
                  {PROFILE.name.split(' ')[0]}<br/>
                  <span className="text-stone-400 dark:text-stone-600">{PROFILE.name.split(' ')[1]}</span>
                </h1>
                
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                   <div className="h-px w-16 bg-stone-900 dark:bg-stone-100"></div>
                   <p className="text-xl md:text-2xl font-light font-mono text-stone-600 dark:text-stone-300">
                    {PROFILE.title}
                  </p>
                </div>

                <div className="text-lg text-stone-700 dark:text-stone-300 leading-relaxed max-w-2xl font-light pt-4 border-l-2 border-stone-200 dark:border-stone-800 pl-8">
                  <p className="mb-6">{PROFILE.description}</p>
                  
                  <div className="bg-stone-100/50 dark:bg-stone-900/30 p-4 rounded-sm border-l-2 border-stone-400 dark:border-stone-600">
                      <p className="font-mono text-sm leading-relaxed text-stone-800 dark:text-stone-300 mb-2">
                          <strong className="text-stone-900 dark:text-white font-semibold">Research Interests:</strong> Embodied AI · Multimodal Perception · Robotic Manipulation
                      </p>
                      <p className="font-mono text-sm leading-relaxed text-stone-800 dark:text-stone-300">
                          Currently working on VLA policies and Sim-to-Real transfer at <a href="https://smartlab.csc.liv.ac.uk/" target="_blank" rel="noreferrer" className="text-stone-900 dark:text-white font-bold border-b border-stone-400 dark:border-stone-500 hover:border-stone-900 dark:hover:border-white transition-colors">SmartLab</a>
                      </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 pt-4">
                   <a 
                    href="#experience"
                    className="group px-8 py-4 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 font-medium font-mono text-sm transition-all hover:bg-stone-800 dark:hover:bg-white flex items-center gap-3 shadow-lg dark:shadow-stone-100/10"
                  >
                    View Research <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                  <a 
                    href={PROFILE.scholar}
                    target="_blank"
                    rel="noreferrer"
                    className="group px-8 py-4 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-medium font-mono text-sm hover:bg-stone-50 dark:hover:bg-stone-900 transition-all flex items-center gap-3"
                  >
                    <BookOpen size={16} /> Google Scholar
                  </a>
                </div>
              </div>
            </FadeIn>
        </div>
      </header>

      {/* Education Section */}
      <Section id="education" title="01. Education">
        <div className="grid md:grid-cols-2 gap-6">
          {EDUCATION.map((edu, index) => (
            <FadeIn key={index} delay={index * 100}>
              <SpotlightCard className="p-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-sm">
                         <GraduationCap size={24} className="text-stone-900 dark:text-stone-100" />
                    </div>
                    <span className="font-mono text-xs text-stone-500 border border-stone-200 dark:border-stone-800 px-3 py-1 rounded-full">{edu.period}</span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">{edu.school}</h3>
                <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-sm mb-8 font-mono">
                  <MapPin size={14} /> {edu.location}
                </div>
                <div className="mt-auto space-y-4 font-mono text-sm border-t border-stone-100 dark:border-stone-800 pt-6">
                   <p className="text-lg font-medium text-stone-900 dark:text-stone-100">{edu.degree}</p>
                    <div className="flex items-center justify-between">
                        <span className="text-stone-500">GPA</span>
                        <span className="font-bold text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-900 px-2 py-0.5 rounded">{edu.gpa}</span>
                    </div>
                    {edu.honors && (
                         <div className="flex items-center justify-between">
                            <span className="text-stone-500">Honors</span>
                            <span className="text-stone-900 dark:text-stone-100 text-right">{edu.honors}</span>
                        </div>
                    )}
                </div>
              </SpotlightCard>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={300}>
            <div className="mt-8 p-10 border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1917]">
                <h4 className="font-mono text-xs text-stone-500 uppercase tracking-widest mb-6 border-b border-stone-100 dark:border-stone-800 pb-4">Relevant Coursework</h4>
                <div className="flex flex-wrap gap-x-8 gap-y-3">
                    {COURSEWORK.map((c, i) => (
                        <span key={i} className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-default text-sm font-mono relative pl-4">
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border border-stone-300 dark:border-stone-600 rounded-full"></span>
                            {c}
                        </span>
                    ))}
                </div>
            </div>
        </FadeIn>
      </Section>

      {/* Experience Section */}
      <Section id="experience" title="02. Research Experience">
        <div className="border-l border-stone-200 dark:border-stone-800 ml-4 md:ml-8 space-y-16">
          {EXPERIENCE.map((exp, index) => (
            <FadeIn key={exp.id} delay={index * 100}>
              <div className="relative pl-8 md:pl-16 group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[5px] top-2 w-[9px] h-[9px] bg-white dark:bg-black border-2 border-stone-300 dark:border-stone-600 rounded-full group-hover:border-stone-900 dark:group-hover:border-white group-hover:scale-125 transition-all duration-300"></div>
                  
                  <div className="grid md:grid-cols-[200px_1fr] gap-8 items-start">
                    <div className="font-mono text-xs text-stone-400 pt-1.5 uppercase tracking-wider group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors">
                        {exp.period}
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">{exp.role}</h3>
                        <div className="text-stone-600 dark:text-stone-300 font-serif italic mb-4 text-lg">{exp.lab}</div>
                        
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-stone-500 text-xs font-mono uppercase tracking-wider mb-6">
                            <span className="flex items-center gap-1"><MapPin size={12} /> {exp.location}</span>
                            {exp.advisor && <span className="px-2 py-0.5 border border-stone-200 dark:border-stone-800 rounded">Adv: {exp.advisor}</span>}
                        </div>
                        
                        <ul className="space-y-3">
                        {exp.details.map((detail, i) => (
                            <li key={i} className="text-stone-700 dark:text-stone-300 text-sm leading-7 pl-5 relative before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-1.5 before:h-1.5 before:bg-stone-300 dark:before:bg-stone-700 before:rounded-sm hover:before:bg-stone-900 dark:hover:before:bg-stone-100 before:transition-colors">
                            {detail}
                            </li>
                        ))}
                        </ul>
                    </div>
                  </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* Publications Section */}
      <Section id="publications" title="03. Publications" subtitle="Selected Works (AAAI, BIBM, ICPR)">
        <div className="grid gap-5">
          {PUBLICATIONS.map((pub, index) => (
            <FadeIn key={index} delay={index * 50}>
              <SpotlightCard href={pub.link} className="p-8 group">
                     <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                        <div className="space-y-3 flex-1">
                           <div className="flex flex-wrap items-center gap-3">
                              <span className="font-mono text-xs font-bold border-b-2 border-stone-900 text-stone-900 dark:border-stone-100 dark:text-stone-100 pb-0.5">
                                 {pub.venue}
                              </span>
                              {pub.status && (
                                  <span className="font-mono text-xs text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-900 px-2 py-0.5 rounded">
                                      {pub.status}
                                  </span>
                              )}
                           </div>
                           <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 leading-tight group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors">
                              {pub.title}
                           </h3>
                           <p className="text-stone-600 dark:text-stone-400 text-sm font-light font-mono text-xs leading-relaxed">{pub.authors}</p>
                        </div>
                        <div className="flex-shrink-0 self-start md:self-center">
                            <div className="p-3 rounded-full border border-stone-200 dark:border-stone-800 group-hover:border-stone-900 dark:group-hover:border-stone-100 transition-colors">
                                <ExternalLink size={20} className="text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors" />
                            </div>
                        </div>
                    </div>
              </SpotlightCard>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* Projects Section */}
      <Section id="projects" title="04. Technical Projects">
        <div className="grid md:grid-cols-2 gap-6">
            {PROJECTS.map((proj, index) => (
                <FadeIn key={index} delay={index * 150}>
                    <SpotlightCard className="flex flex-col h-full">
                        <div className="p-8 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50/50 dark:bg-stone-900/20">
                            <div className="flex items-center gap-3">
                                <proj.icon size={20} className="text-stone-900 dark:text-stone-100" />
                                <span className="font-mono text-xs text-stone-500">{proj.year}</span>
                            </div>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-stone-200 dark:bg-stone-800"></div>
                                <div className="w-2 h-2 rounded-full bg-stone-200 dark:bg-stone-800"></div>
                            </div>
                        </div>
                        <div className="p-8 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">{proj.title}</h3>
                            <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-8 flex-1">
                                {proj.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-auto">
                                {proj.tags.map(tag => (
                                    <span key={tag} className="text-[10px] font-mono px-2 py-1 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 uppercase tracking-wider">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </SpotlightCard>
                </FadeIn>
            ))}
        </div>
      </Section>

      {/* Skills Section */}
      <Section id="skills" title="05. Skills & Awards">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
            {SKILLS.map((skillGroup, idx) => (
                <FadeIn key={idx} delay={idx * 100}>
                    <div className="border-t-2 border-stone-900 dark:border-stone-100 pt-6 hover:translate-y-1 transition-transform duration-300">
                        <div className="flex items-center gap-3 mb-6 text-stone-900 dark:text-stone-100">
                            <skillGroup.icon size={18} />
                            <h3 className="font-bold font-mono text-sm uppercase tracking-widest">{skillGroup.category}</h3>
                        </div>
                        <ul className="space-y-2">
                            {skillGroup.items.map(skill => (
                                <li key={skill} className="text-stone-600 dark:text-stone-400 text-sm group flex items-center gap-2 hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-default">
                                    <span className="w-1 h-1 bg-stone-300 dark:bg-stone-700 group-hover:bg-stone-900 dark:group-hover:bg-stone-100 transition-colors rounded-full"></span>
                                    {skill}
                                </li>
                            ))}
                        </ul>
                    </div>
                </FadeIn>
            ))}
        </div>

        <FadeIn delay={300}>
            <div className="p-10 border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-[#1c1917] relative overflow-hidden">
                 {/* Decorative background element */}
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Award size={100} />
                </div>
                
                <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-8 flex items-center gap-3 relative z-10">
                    <Award className="text-stone-900 dark:text-stone-100" size={20} /> 
                    Honors & Recognition
                </h3>
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 relative z-10">
                    {AWARDS.map((award, i) => (
                        <div key={i} className="flex items-baseline gap-4 group border-b border-stone-200 dark:border-stone-800 pb-2 last:border-0">
                            <span className="font-mono text-xs text-stone-400 group-hover:text-stone-900 dark:group-hover:text-stone-100 transition-colors">0{i+1}.</span>
                            <span className="text-stone-700 dark:text-stone-300 font-medium text-sm">{award}</span>
                        </div>
                    ))}
                </div>
            </div>
        </FadeIn>
      </Section>

      {/* Footer */}
      <footer className="py-20 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0c0a09]">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left space-y-2">
                <p className="text-stone-900 dark:text-stone-100 font-serif font-bold text-2xl tracking-tighter">{PROFILE.name}</p>
                <p className="text-stone-500 text-xs font-mono uppercase tracking-widest">
                    Designed & Built with &lt;Code /&gt;
                </p>
            </div>
            <div className="flex items-center gap-6">
                <a href={`mailto:${PROFILE.email}`} className="group p-3 border border-stone-200 dark:border-stone-800 rounded-full hover:bg-stone-900 dark:hover:bg-stone-100 hover:border-stone-900 dark:hover:border-stone-100 transition-all">
                    <Mail size={20} className="text-stone-600 dark:text-stone-400 group-hover:text-white dark:group-hover:text-black transition-colors" />
                </a>
                <a href={`https://${PROFILE.website}`} target="_blank" rel="noreferrer" className="group p-3 border border-stone-200 dark:border-stone-800 rounded-full hover:bg-stone-900 dark:hover:bg-stone-100 hover:border-stone-900 dark:hover:border-stone-100 transition-all">
                    <Github size={20} className="text-stone-600 dark:text-stone-400 group-hover:text-white dark:group-hover:text-black transition-colors" />
                </a>
                 <a href={PROFILE.scholar} target="_blank" rel="noreferrer" className="group p-3 border border-stone-200 dark:border-stone-800 rounded-full hover:bg-stone-900 dark:hover:bg-stone-100 hover:border-stone-900 dark:hover:border-stone-100 transition-all">
                    <BookOpen size={20} className="text-stone-600 dark:text-stone-400 group-hover:text-white dark:group-hover:text-black transition-colors" />
                </a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;