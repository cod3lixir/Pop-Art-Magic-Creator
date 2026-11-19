
import React, { useState, useRef, useEffect } from 'react';
import Layout from './components/Layout';
import { PopArtConfig, PopArtMood, TransformationResult } from './types';
import { transformToPopArt } from './services/geminiService';

const MOODS: { label: PopArtMood; icon: string; color: string; desc: string }[] = [
  { label: 'Classic Pop Art', icon: 'fa-palette', color: 'bg-[#ff00ff]', desc: 'Lichtenstein-inspired dots and primary colors.' },
  { label: 'Cartoonish Pop Art', icon: 'fa-mask', color: 'bg-[#ffd700]', desc: 'Playful animation style with bold, bouncy colors.' },
  { label: 'Futuristic Pop', icon: 'fa-user-astronaut', color: 'bg-[#00ffff]', desc: 'Neon glows, holographic grids, and cyberpunk flair.' },
  { label: 'Retro Comic', icon: 'fa-book-open', color: 'bg-[#ffde03]', desc: '1960s silver age comic book style.' },
  { label: 'Funny/Caricature', icon: 'fa-laugh-squint', color: 'bg-[#39ff14]', desc: 'Exaggerated features and wacky colors.' },
  { label: 'Emotional/Dramatic', icon: 'fa-bolt', color: 'bg-[#ff3131]', desc: 'High contrast noir-meets-color drama.' },
  { label: 'Synthwave Glow', icon: 'fa-sun', color: 'bg-[#bc13fe]', desc: '80s retro-future with purple haze and neon grids.' },
  { label: 'Graffiti Urban', icon: 'fa-spray-can', color: 'bg-[#ffae42]', desc: 'Street art style with spray drips and gritty textures.' },
  { label: 'Vintage 50s Ad', icon: 'fa-tv', color: 'bg-[#1abc9c]', desc: 'Mid-century pastel tones and clean commercial ink.' },
  { label: 'Manga Noir', icon: 'fa-shuriken', color: 'bg-[#000000]', desc: 'Sharp black & white Japanese manga with screen tones.' },
  { label: 'Anime Inspired', icon: 'fa-fire', color: 'bg-[#4b0082]', desc: 'Modern anime look with vibrant cel-shading and dynamic energy.' },
  { label: 'Haldi Special', icon: 'fa-sun', color: 'bg-[#ffde03]', desc: 'Professional vector illustration with Haldi-themed comic elements.' }
];

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [config, setConfig] = useState<PopArtConfig>({
    mood: 'Classic Pop Art',
    coupleName: '',
    customText: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TransformationResult | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingMessages = [
    "Forging your masterpiece...",
    "Scanning environment vibe...",
    "Auto-detecting epic details...",
    "Injecting hyper-energy...",
    "Finalizing the vision..."
  ];

  useEffect(() => {
    if (loading) {
      let i = 0;
      const interval = setInterval(() => {
        setLoadingMsg(loadingMessages[i % loadingMessages.length]);
        i++;
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const startCamera = async () => {
    setIsCameraActive(true);
    setPreviewUrl(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Camera access denied or not available.");
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setPreviewUrl(dataUrl);
        
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        setIsCameraActive(false);
        
        fetch(dataUrl)
          .then(res => res.blob())
          .then(blob => {
            const capturedFile = new File([blob], "capture.png", { type: "image/png" });
            setFile(capturedFile);
          });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setResult(null);
        setError(null);
        setIsCameraActive(false);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleCreateArt = async () => {
    if (!previewUrl || !file) return;

    setLoading(true);
    setError(null);
    setLoadingMsg(loadingMessages[0]);

    try {
      const generatedUrl = await transformToPopArt(previewUrl, file.type, config);
      
      const newResult = {
        imageUrl: generatedUrl,
        originalUrl: previewUrl,
        timestamp: Date.now()
      };
      
      setResult(newResult);
    } catch (err: any) {
      if (err.message?.includes('429') || err.message?.toLowerCase().includes('quota')) {
        setError("Rate Limit Exceeded! Please wait 60 seconds and try again.");
      } else {
        setError(err.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `pop-art-${Date.now()}.png`;
    link.click();
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-8 items-start relative">
        {/* LEFT COLUMN: CONTROL PANEL */}
        <aside className="w-full lg:w-[420px] flex-shrink-0 space-y-6 lg:sticky lg:top-[120px]">
          <div className="bg-white pop-art-border pop-art-shadow p-6 relative">
            <div className="absolute -top-3 -left-3 bg-[#ff00ff] text-white font-comic px-3 py-1 pop-art-border-sm rotate-[-4deg] z-10 shadow-lg text-sm uppercase border-2 border-black">
              Bhishm Patel
            </div>
            
            <h2 className="text-3xl font-comic mb-6 uppercase border-b-4 border-black pb-2 flex items-center justify-between mt-2 text-black">
              CONTROLS
              <i className="fas fa-bolt text-[#ff00ff] animate-pulse"></i>
            </h2>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-[12px] font-black uppercase tracking-widest text-black">Step 1: Choose Style</label>
                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {MOODS.map(m => (
                    <button
                      key={m.label}
                      onClick={() => setConfig({ ...config, mood: m.label })}
                      className={`w-full flex items-center gap-4 p-3 border-4 font-bold transition-all text-left ${
                        config.mood === m.label 
                          ? `${m.color} border-black translate-x-1 -translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black` 
                          : 'bg-white border-gray-200 hover:border-black text-gray-500'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white pop-art-border-sm ${config.mood === m.label ? 'bg-black' : 'bg-gray-300'}`}>
                        <i className={`fas ${m.icon}`}></i>
                      </div>
                      <div>
                        <div className="text-sm uppercase leading-none mb-1">{m.label}</div>
                        <div className="text-[10px] leading-tight opacity-70 font-black">{m.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[12px] font-black uppercase tracking-widest text-black">Step 2: Names (Optional)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="e.g. Ayush & Rutvi"
                      value={config.coupleName}
                      onChange={(e) => setConfig({ ...config, coupleName: e.target.value })}
                      className="w-full pop-art-border-sm px-4 py-3 bg-white text-black text-xl font-black placeholder:text-gray-200 focus:outline-none focus:ring-4 focus:ring-[#00ffff] focus:border-black transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[12px] font-black uppercase tracking-widest text-black">Step 3: Caption (Optional)</label>
                  <div className="relative">
                    <textarea 
                      placeholder="e.g. Soulmates Forever!"
                      value={config.customText}
                      onChange={(e) => setConfig({ ...config, customText: e.target.value })}
                      rows={2}
                      className="w-full pop-art-border-sm px-4 py-3 bg-white text-black text-xl font-black placeholder:text-gray-200 focus:outline-none focus:ring-4 focus:ring-[#ffde03] focus:border-black transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[12px] font-black uppercase tracking-widest text-black">Step 4: Input Image</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="pop-art-border-sm bg-white hover:bg-black hover:text-white p-4 transition-all flex flex-col items-center gap-2"
                  >
                    <i className="fas fa-upload text-xl"></i>
                    <span className="text-[10px] font-black uppercase">Upload</span>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </button>
                  <button 
                    onClick={startCamera}
                    className="pop-art-border-sm bg-[#00ffff] hover:bg-black hover:text-[#00ffff] p-4 transition-all flex flex-col items-center gap-2"
                  >
                    <i className="fas fa-camera text-xl"></i>
                    <span className="text-[10px] font-black uppercase">Camera</span>
                  </button>
                </div>
              </div>

              <button
                disabled={!file || loading}
                onClick={handleCreateArt}
                className={`w-full font-comic text-4xl py-6 uppercase transition-all flex items-center justify-center gap-4 pop-art-border pop-art-shadow group active:translate-x-2 active:translate-y-2 active:shadow-none ${
                  !file || loading 
                    ? 'bg-gray-200 text-gray-400 border-gray-300 shadow-none' 
                    : 'bg-[#ff00ff] hover:bg-[#00ffff] hover:text-black text-white'
                }`}
              >
                {loading ? <><i className="fas fa-atom fa-spin"></i> GENERATING...</> : <><i className="fas fa-magic"></i> TRANSFORM!</>}
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: WORKSPACE */}
        <section className="flex-grow w-full space-y-8">
          {error && (
            <div className="bg-red-100 border-l-[12px] border-black p-6 pop-art-border-sm animate-pop shadow-xl">
              <div className="flex items-center gap-4 text-black">
                <i className="fas fa-skull text-4xl text-[#ff3131]"></i>
                <div>
                  <h4 className="font-comic text-2xl uppercase italic leading-none mb-1">SYSTEM ALERT!</h4>
                  <p className="text-sm font-bold opacity-80 uppercase leading-tight">{error}</p>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-white pop-art-border pop-art-shadow p-8 min-h-[600px] flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,255,0.1)_2px,transparent_2px)] bg-[size:20px:20px]"></div>
               <div className="relative z-10 text-center space-y-12">
                 <div className="flex gap-4 justify-center">
                    <div className="w-24 h-24 border-[8px] border-black border-t-[#ff00ff] rounded-full animate-spin"></div>
                 </div>
                 <h3 className="text-5xl md:text-7xl font-comic uppercase text-black mb-4 animate-bounce">
                   {loadingMsg}
                 </h3>
                 <p className="font-comic text-2xl text-[#ff00ff] uppercase italic">Injecting the Vibe!</p>
               </div>
            </div>
          )}

          {!loading && isCameraActive && (
            <div className="bg-black pop-art-border pop-art-shadow p-4 min-h-[600px] flex flex-col items-center justify-center relative">
               <video ref={videoRef} autoPlay playsInline className="max-w-full h-auto rounded-lg shadow-2xl" />
               <canvas ref={canvasRef} className="hidden" />
               <div className="mt-8 flex gap-4">
                 <button onClick={capturePhoto} className="bg-[#39ff14] text-black font-comic text-4xl px-12 py-4 pop-art-border pop-art-shadow-sm hover:scale-105 active:scale-95 transition-all">
                    CAPTURE!
                 </button>
                 <button onClick={() => setIsCameraActive(false)} className="bg-white text-black font-comic text-4xl px-8 py-4 pop-art-border pop-art-shadow-sm hover:scale-105 active:scale-95 transition-all">
                    CANCEL
                 </button>
               </div>
            </div>
          )}

          {!loading && !isCameraActive && !result && (
            <div className="bg-white pop-art-border pop-art-shadow p-8 min-h-[600px] flex flex-col items-center justify-center">
              {!previewUrl ? (
                <div className="text-center space-y-8 animate-pop">
                  <div className="bg-[#00ffff] pop-art-border p-12 rounded-full inline-block shadow-2xl border-black">
                    <i className="fas fa-camera text-8xl text-black"></i>
                  </div>
                  <h3 className="text-6xl font-comic uppercase tracking-tighter text-black">FEED ME A PHOTO!</h3>
                  <p className="font-comic text-2xl text-black/50 uppercase italic">Transform your vibe instantly!</p>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center gap-8 animate-pop">
                  <div className="flex items-center justify-between w-full border-b-4 border-black pb-4">
                    <h3 className="text-4xl font-comic uppercase text-[#ff00ff] italic">READY TO TRANSFORM!</h3>
                    <button onClick={() => { setPreviewUrl(null); setFile(null); }} className="font-comic text-xl text-black bg-[#ffde03] px-4 py-1 pop-art-border-sm hover:scale-110">RESET</button>
                  </div>
                  <div className="pop-art-border pop-art-shadow-sm bg-black p-2 max-w-lg">
                    <img src={previewUrl} className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700" />
                  </div>
                </div>
              )}
            </div>
          )}

          {result && !loading && (
            <div className="space-y-12 animate-pop pb-12">
              <div className="text-center md:text-left flex flex-col md:flex-row items-baseline gap-4">
                <h3 className="text-6xl md:text-8xl font-comic uppercase tracking-tighter text-black italic leading-none">
                   <span className="bg-[#00ffff] text-black px-4 mr-3 pop-art-border shadow-lg inline-block">BOOM!</span>
                   DONE
                </h3>
                <p className="font-comic text-2xl text-[#ff00ff] uppercase italic">Your masterpiece is ready!</p>
              </div>

              <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                <div className="bg-white pop-art-border pop-art-shadow-sm p-4 group relative">
                   <div className="bg-black p-1 overflow-hidden">
                      <img src={result.imageUrl} className="w-full h-auto block transform group-hover:scale-[1.01] transition-transform duration-700" alt="Result" />
                   </div>
                </div>
                <button 
                  onClick={() => handleDownload(result.imageUrl)} 
                  className="w-full bg-[#39ff14] text-black pop-art-border py-6 font-comic text-4xl uppercase hover:bg-black hover:text-[#39ff14] transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                   <i className="fas fa-download mr-4"></i> DOWNLOAD NOW
                </button>
              </div>

              <div className="bg-[#ff00ff] text-white pop-art-border p-6 pop-art-shadow-sm flex items-center gap-6 mt-12 max-w-4xl mx-auto">
                 <div className="bg-black text-[#00ffff] w-12 h-12 flex items-center justify-center pop-art-border rounded-full rotate-12 flex-shrink-0">
                    <i className="fas fa-heart text-xl"></i>
                 </div>
                 <p className="font-comic text-xl text-black">
                   Tag us <a href="https://www.instagram.com/art_of_timeline/" className="underline font-black hover:text-white">@art_of_timeline</a>!
                 </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default App;
