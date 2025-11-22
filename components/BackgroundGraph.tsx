import React, { useEffect, useRef } from 'react';
import { CODE_SNIPPETS } from '../constants';

const BackgroundGraph: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Configuration
    const fontSize = 14; // Slightly larger for code aesthetics
    const fontFamily = 'JetBrains Mono, monospace';
    
    interface Typer {
      x: number;
      y: number;
      text: string;
      typedIndex: number;
      delay: number;
      life: number;
      speed: number;
      opacity: number;
    }

    const typers: Typer[] = [];
    const maxTypers = 15; // Balanced density

    const resetTyper = (t: Typer) => {
      // Spread them out more given the tilt
      t.x = Math.random() * width * 1.2 - width * 0.1;
      t.y = Math.random() * height * 1.2 - height * 0.1;
      t.text = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
      t.typedIndex = 0;
      t.delay = Math.random() * 200; 
      t.life = 400; 
      t.speed = Math.random() * 0.5 + 0.3; // Slower, more deliberate typing
      t.opacity = 0;
    };

    // Initialize pool
    for (let i = 0; i < maxTypers; i++) {
      const t = {
        x: 0, y: 0, text: '', typedIndex: 0, delay: 0, life: 0, speed: 1, opacity: 0
      };
      resetTyper(t);
      t.delay = Math.random() * 1000; 
      typers.push(t);
    }

    const render = () => {
      // Clear logic
      ctx.clearRect(0, 0, width, height);
      
      // Update and Draw
      typers.forEach(t => {
        if (t.delay > 0) {
          t.delay--;
          return;
        }

        // Fade in - Subtle target opacity
        // Light Mode: Very subtle brownish gray (0.12)
        // Dark Mode: Subtle white (0.12)
        const targetOpacity = isDark ? 0.12 : 0.15;
        
        if (t.opacity < targetOpacity) {
            t.opacity += 0.002;
        }

        // Typing logic
        if (t.typedIndex < t.text.length) {
            if (Math.random() < 0.2) { 
                t.typedIndex += 1;
            }
        } else {
            // Wait then die
            t.life--;
            if (t.life < 0) {
               t.opacity -= 0.002;
               if (t.opacity <= 0) {
                   resetTyper(t);
               }
            }
        }

        // Draw
        ctx.font = `${fontSize}px ${fontFamily}`;
        // Light mode: warm brownish gray, Dark mode: pure white text
        const color = isDark ? `rgba(255, 255, 255, ${t.opacity})` : `rgba(87, 83, 78, ${t.opacity})`;
        ctx.fillStyle = color;
        
        const currentText = t.text.substring(0, Math.floor(t.typedIndex));
        ctx.fillText(currentText, t.x, t.y);

        // Blinking Cursor
        if (t.typedIndex < t.text.length && Math.floor(Date.now() / 400) % 2 === 0) {
             const metrics = ctx.measureText(currentText);
             const cursorOpacity = isDark ? t.opacity * 2 : t.opacity * 2;
             ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${cursorOpacity})` : `rgba(87, 83, 78, ${cursorOpacity})`;
             ctx.fillRect(t.x + metrics.width + 2, t.y - fontSize + 3, 8, fontSize);
        }
      });

      requestAnimationFrame(render);
    };

    const animationId = requestAnimationFrame(render);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ transform: 'rotate(-30deg) scale(1.5)' }} 
    />
  );
};

export default BackgroundGraph;