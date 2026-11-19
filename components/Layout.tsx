
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative">
      <header className="bg-[#ff00ff] border-b-8 border-black p-4 sticky top-0 z-50 shadow-[0_8px_0_0_rgba(0,0,0,1)]">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-[#00ffff] pop-art-border p-3 rotate-[-5deg] pop-art-shadow-sm">
              <i className="fas fa-bolt text-black text-3xl"></i>
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-comic tracking-tighter uppercase italic leading-none text-black">
                POP-ART <span className="text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">VIBES</span>
              </h1>
              <p className="font-comic text-black text-sm md:text-lg tracking-widest opacity-90 uppercase bg-white/20 px-2 inline-block">Hyper-Saturated Transforms</p>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="bg-black border-2 border-white px-3 py-1 rotate-2 shadow-lg">
               <p className="text-[10px] font-black uppercase text-[#00ffff] tracking-tighter text-center">Created by Bhishm Patel</p>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow max-w-[1600px] w-full mx-auto p-4 md:p-8 relative z-10">
        {children}
      </main>
      <footer className="bg-black text-white p-8 border-t-8 border-[#00ffff]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="space-y-1">
            <p className="font-comic text-3xl text-[#ff00ff] uppercase tracking-tighter italic">Created by Bhishm Patel</p>
            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-[#00ffff] opacity-80">POP-ART ENGINE • HYPER-COLOR EDITION</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <p className="font-comic text-sm text-white uppercase opacity-50 italic">Artist Profile:</p>
            <a 
              href="https://www.instagram.com/art_of_timeline/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-[#ff00ff] text-white w-12 h-12 flex items-center justify-center rounded-full hover:bg-[#00ffff] hover:text-black hover:scale-125 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] border-2 border-black"
            >
              <i className="fab fa-instagram text-2xl"></i>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;