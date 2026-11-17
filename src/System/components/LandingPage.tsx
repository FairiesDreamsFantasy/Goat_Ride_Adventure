import React, { useState } from 'react';
import { motion } from 'motion/react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { validateAICourtesy } from '../Logic/CourtesySafeguards';

// Dynamic raw imports of the standalone portable build so it never goes out-of-sync
// @ts-ignore
import rawHtml from '../../../public/portable/index.html?raw';
// @ts-ignore
import rawCSS from '../../../public/portable/Assets/CSS/Game_Style.css?raw';
// @ts-ignore
import rawAudio from '../../../public/portable/Assets/JS/audio.js?raw';
// @ts-ignore
import rawConstants from '../../../public/portable/Assets/JS/constants.js?raw';
// @ts-ignore
import rawGame from '../../../public/portable/Assets/JS/game.js?raw';

interface LandingPageProps {
  onStartGame: () => void;
}

export default function LandingPage({ onStartGame }: LandingPageProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('FDF_AI_API_KEY') || '');
  const [safeguardError, setSafeguardError] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      const zip = new JSZip();
      const buildFolder = zip.folder("Goat_Ride_Adventure_Build");
      const assetsFolder = buildFolder?.folder("Assets");
      const cssFolder = assetsFolder?.folder("CSS");
      const jsFolder = assetsFolder?.folder("JS");

      // The standalone HTML shell exactly as requested
      const htmlContent = rawHtml;

      // Modular standalone game engine - Comprehensive, Scientific & Artistic
      const cssContent = rawCSS;
      const constantsJsContent = rawConstants;
      const audioJsContent = rawAudio;
      const gameJsContent = rawGame;

      buildFolder?.file("index.html", htmlContent);
      cssFolder?.file("Game_Style.css", cssContent);
      jsFolder?.file("constants.js", constantsJsContent);
      jsFolder?.file("audio.js", audioJsContent);
      jsFolder?.file("game.js", gameJsContent);

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "Goat_Ride_Adventure_Source.zip");
      
      speak("Your modular standalone goat engine is ready. Upload the contents of the Goat Ride Adventure Build folder to your server.");
    } catch (error) {
      console.error("Download failed", error);
      speak("There was an issue preparing your download.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0fdf4] text-[#14532d] font-sans overflow-y-auto">
      <header className="p-12 md:p-24 border-b border-[#14532d]/10 bg-white shadow-sm overflow-hidden relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <h1 className="text-7xl md:text-9xl font-serif font-black uppercase leading-[0.8] tracking-tighter">
            <a href="/" className="hover:text-green-600 transition-colors">
              Goat Ride<br />Adventure
            </a>
          </h1>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-green-500/5 -skew-x-12 translate-x-20" />
      </header>

      <nav id="Navigation" className="bg-white border-b border-[#14532d]/10 px-12 md:px-24 py-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-bold uppercase tracking-tight">
            <li><a href="https://fairiesdreamsfantasy.com" className="hover:underline">Go to fairiesdreamsfantasy.com</a></li>
            <li><a href="https://arcade.fairiesdreamsfantasy.com" className="hover:underline text-green-700">&lt;Back To Fairies Dreams & Fantasy Arcade</a></li>
            <li><a href="https://arcade.fairiesdreamsfantasy.com/Browse/index.html" className="hover:underline">Browse</a></li>
            <li><a href="https://arcade.fairiesdreamsfantasy.com/Blog" className="hover:underline">The Fairies Dreams & Fantasy Arcade Blog</a></li>
            <li><a href="https://wiki.fairiesdreamsfantasy.com" className="hover:underline">The Fairies Dreams & Fantasy Wiki</a></li>
            <li><a href="https://news.fairiesdreamsfantasy.com" className="hover:underline">The Fairies Dreams & Fantasy News</a></li>
            <li><a href="https://premium.fairiesdreamsfantasy.com" className="hover:underline">Fairies Dreams & Fantasy Premium</a></li>
            <li><a href="https://channel.fairiesdreamsfantasy.com" className="hover:underline">The Fairies Dreams & Fantasy Channel</a></li>
            <li><a href="https://classifieds.fairiesdreamsfantasy.com" className="hover:underline">Classifieds</a></li>
          </ul>
          <form action="https://arcade.fairiesdreamsfantasy.com/Search_Results/index.html" method="get" className="flex gap-2">
            <input 
              type="search" 
              name="q"
              placeholder="Search Arcade..."
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button type="submit" className="px-4 py-2 bg-[#14532d] text-white rounded-lg text-sm font-bold uppercase transition-colors hover:bg-green-700">Search</button>
            <button type="reset" className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold uppercase hover:bg-gray-50">Clear</button>
          </form>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto p-12 md:p-24 space-y-16 flex flex-col items-center text-center md:text-left md:items-start">
        <div className="w-full flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2 aspect-square bg-white rounded-[40px] shadow-2xl flex flex-col items-center justify-center p-8 border-8 border-white group overflow-hidden relative">
             <img 
               src="https://picsum.photos/seed/goat-ride/800/800" 
               alt="Goat with a person riding her" 
               className="w-full h-full object-cover rounded-[20px] shadow-inner mb-4 transition-transform group-hover:scale-105 duration-700"
               referrerPolicy="no-referrer"
             />
             <div className="absolute top-4 right-4 bg-yellow-400 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                Art & Craftsmanship
             </div>
          </div>

          <div className="w-full md:w-1/2 space-y-8">
            <h2 className="text-4xl font-serif font-bold italic tracking-tight leading-tight">
              A forward-facing POV of riding a goat through breathtaking worlds.
            </h2>
            <div className="space-y-6 text-xl opacity-90 leading-relaxed">
              <p>
                Ride a goat and jump over obstacles to earn points, and go through these places what you never imagine before.
              </p>
              <p>
                Can you jump over as much obstacles? Use your skills to dodge or jump over obstacles. 
                For this instances, bushes, rocks, logs, bricks, etc.
              </p>
              <p className="font-bold border-l-4 border-green-600 pl-4 py-2 bg-green-50">
                Each goat is unique.
              </p>
              <p className="text-sm font-bold opacity-50">Version 1.0.5</p>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                id="start-game-btn"
                onClick={onStartGame}
                className="group relative inline-flex items-center justify-center gap-4 px-12 py-8 bg-[#14532d] text-white text-3xl font-black uppercase tracking-tighter hover:bg-green-700 transition-all rounded-3xl shadow-2xl active:scale-95 w-full"
              >
                Start Game
                <span className="text-2xl transition-transform group-hover:translate-x-2">→</span>
              </button>

              <button 
                id="settings-btn"
                onClick={() => setShowSettings(true)}
                className="inline-flex items-center justify-center gap-4 px-12 py-4 bg-white border-2 border-[#14532d]/20 text-[#14532d] text-xl font-bold uppercase tracking-tight hover:bg-green-50 transition-all rounded-[24px] w-full"
              >
                Settings
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-16 py-16">
          <section className="bg-white p-8 rounded-[40px] border border-[#14532d]/10 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] opacity-40 mb-6 flex items-center gap-4">
              <span className="w-8 h-px bg-[#14532d]/20" />
              Editor's Selection
            </h3>
            <p className="text-2xl font-serif italic leading-relaxed text-[#14532d]/80">
              "A remarkable intersection of scientific simulation and whimsical exploration. 
              The forward-facing perspective creates an unparalleled sense of presence on the 
              back of these scientifically-dimensioned creatures."
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-xs">ED</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-60">
                Editorial Staff, FDF Arcade
              </div>
            </div>
          </section>

          <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 border-t border-[#14532d]/10">
           <div className="space-y-2">
             <h3 className="text-xs font-bold uppercase tracking-widest opacity-40">Scientific Precision</h3>
             <p className="text-lg">Equine-inspired rhythm based gallop with dual-thump clops.</p>
           </div>
           <div className="space-y-2">
             <h3 className="text-xs font-bold uppercase tracking-widest opacity-40">Immense Worlds</h3>
             <p className="text-lg">Explore Caves, Jungles, and Mountains with environmental reverberation.</p>
           </div>
           <div className="space-y-2">
             <h3 className="text-xs font-bold uppercase tracking-widest opacity-40">Arcade Scoring</h3>
             <p className="text-lg">10 points per jump. Over 400 levels of increasing difficulty.</p>
           </div>
        </section>
        </div>
      </main>

      <footer className="p-12 md:p-24 bg-white border-t border-[#14532d]/10 flex flex-col gap-12">
        <div className="max-w-6xl mx-auto w-full text-center">
          <h2 className="text-xl font-serif font-bold italic mb-6">Useful Links</h2>
          <ul className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-xs font-bold uppercase tracking-widest opacity-70">
            <li><a href="https://arcade.fairiesdreamsfantasy.com/About" className="hover:text-green-600 transition-colors">About</a></li>
            <li><a href="https://support.fairiesdreamsfantasy.com/arcade" className="hover:text-green-600 transition-colors">Fairies Dreams & Fantasy Arcade Support</a></li>
            <li><a href="https://arcade.fairiesdreamsfantasy.com/Disclosure" className="hover:text-green-600 transition-colors">Disclosure</a></li>
            <li><a href="https://arcade.fairiesdreamsfantasy.com/Privacy_Policy" className="hover:text-green-600 transition-colors">Privacy Policy</a></li>
          </ul>
        </div>

        <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div className="space-y-4">
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">
              © 2026 FAIRIES DREAMS & FANTASY ARCADE • GOAT RIDE ADVENTURE
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm font-bold">
              <a 
                href="/api/download-production" 
                className="inline-block text-sm font-bold underline hover:no-underline decoration-green-600 underline-offset-4 text-green-800"
                onClick={() => {
                  speak("Preparing and downloading compiled production build.");
                }}
              >
                Download Production Server Build (TSX Compiled)
              </a>
              <span className="opacity-20 hidden md:inline">|</span>
              <a 
                href="#" 
                className="inline-block text-sm font-bold underline hover:no-underline decoration-green-600 underline-offset-4 opacity-70 hover:opacity-100"
                onClick={(e) => {
                  e.preventDefault();
                  handleDownload();
                }}
              >
                Download Standalone Portable Build
              </a>
              <span className="opacity-20 hidden md:inline">|</span>
              <a 
                href="/api/download-source" 
                className="inline-block text-sm font-bold underline hover:no-underline decoration-green-600 underline-offset-4 opacity-70 hover:opacity-100"
                onClick={() => {
                  speak("Initiating dev source code download.");
                }}
              >
                Download Full Source
              </a>
              <span className="opacity-20 hidden md:inline">|</span>
              <a 
                href="https://github.com/Fairies-Dreams-Fantasy/Goat_Ride_Adventure" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block text-sm font-bold underline hover:no-underline decoration-green-600 underline-offset-4 opacity-70 hover:opacity-100"
              >
                Open Source (GitHub)
              </a>
            </div>
        </div>
        
        <div className="flex gap-16 text-[10px] font-black uppercase tracking-widest opacity-50">
           <span>Goat_Ride_Adventure/Assets</span>
           <span>index.html</span>
        </div>
      </div>
    </footer>

    {showSettings && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl p-10 relative overflow-hidden border border-[#14532d]/10">
          <button 
            className="absolute top-8 right-8 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            onClick={() => setShowSettings(false)}
          >
            <span className="sr-only">Close Settings</span>
            <span className="text-xl">✕</span>
          </button>
          
          <h1 className="text-5xl font-serif font-black uppercase tracking-tighter text-[#14532d] mb-10 leading-[0.8]">Settings</h1>
          
          <div className="space-y-12">
            <section className="space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] opacity-40 flex items-center gap-4">
                <span className="w-8 h-px bg-[#14532d]/20" />
                AI Settings
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-2">External API Key (Gemini/OpenAI/Claude)</label>
                  <input 
                    type="password"
                    placeholder="Paste your secret key here..."
                    className="w-full p-5 bg-[#f0fdf4] border border-[#14532d]/10 rounded-2xl font-mono text-sm focus:outline-none focus:ring-4 focus:ring-[#14532d]/5 transition-all"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setSafeguardError(null);
                    }}
                  />
                </div>

                {safeguardError && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-mono">
                    ⚠️ {safeguardError}
                  </div>
                )}

                <div className="p-4 bg-zinc-50 border border-[#14532d]/10 rounded-xl space-y-2 text-[11px] text-zinc-600 leading-normal">
                  <p className="font-bold uppercase tracking-wider text-[#14532d]">⚠️ Safe AI Usage Safeguards Agreement</p>
                  <p>
                    By activating external linguistic engines, you pledge to treat AI strictly as a tool, not a burden on RAM/CPU or society.
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Strict zero-tolerance on sexualized or erotic topics, fetishism, and bestiality</li>
                    <li>No self-harm, weapons, violence, terrorism, child spanking, drug cartels, tobacco, or greed promotion</li>
                    <li>Lightweight locally-run algorithms ensuring safety and mental peace.</li>
                  </ul>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    className="flex-1 h-14 bg-[#14532d] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-700 transition-all shadow-lg active:scale-[0.98]"
                    onClick={() => {
                      const validation = validateAICourtesy(apiKey);
                      if (!validation.isValid) {
                        setSafeguardError(validation.errorReason || "Safeguard check failed.");
                        speak("Safety block triggered. Key contains restricted stems.");
                        return;
                      }
                      setSafeguardError(null);
                      localStorage.setItem('FDF_AI_API_KEY', apiKey);
                      speak("AI configurations localized. Key set.");
                    }}
                  >
                    Set
                  </button>
                  <button 
                    className="h-14 px-8 bg-white border-2 border-red-100 text-red-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-50 transition-all active:scale-[0.98]"
                    onClick={() => {
                      setApiKey('');
                      setSafeguardError(null);
                      localStorage.removeItem('FDF_AI_API_KEY');
                      speak("Credentials purged from local storage.");
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </section>
            
            <div className="p-6 bg-[#14532d]/5 rounded-3xl border border-[#14532d]/10">
              <p className="text-sm font-serif italic text-[#14532d]/70 leading-relaxed">
                "This interface enables high-fidelity connectivity for cloud-based linguistics and heuristic systems, bridging the gap between local simulation and distributed intelligence."
              </p>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
}

function speak(text: string) {
  if (!text) return;
  // Upgrade: Web Speech API Latency Reduction Strategy
  // 1. Cancel previous utterances immediately to prevent queue buildup
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  
  // 2. Adjust parameters for "Editorial Staff" persona clarity
  utterance.rate = 1.05; 
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  window.speechSynthesis.speak(utterance);
}
