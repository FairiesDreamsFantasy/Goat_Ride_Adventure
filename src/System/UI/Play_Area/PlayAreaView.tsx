import React, { useEffect, useRef, useState } from 'react';
import { useGameEngine } from '../../Logic/useGameEngine';
import InterstitialAd from '../../components/InterstitialAd';
import { RiderCharacter } from '../../Logic/types';

interface PlayAreaViewProps {
  onBack: () => void;
  selectedGoat: string;
  selectedRider: RiderCharacter | null;
}

export default function PlayAreaView({ onBack, selectedGoat, selectedRider }: PlayAreaViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showAd, setShowAd] = useState(false);
  const { gameState, score, level, topScore, controls } = useGameEngine(canvasRef, selectedGoat, selectedRider, showAd);
  const [isPortrait, setIsPortrait] = useState(false);
  const [rotateView, setRotateView] = useState(false);
  const prevLevel = useRef(level);

  // Monitor screen layout context in a highly performant way
  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (level !== prevLevel.current && level > 1) {
      setShowAd(true);
      prevLevel.current = level;
    }
  }, [level]);

  return (
    <div className="Play_Area min-h-screen flex flex-col bg-black overflow-hidden relative">
      {showAd && <InterstitialAd onComplete={() => setShowAd(false)} />}
      
      <header className="p-4 border-b border-white/10 flex justify-between items-center z-10">
        <h1>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onBack(); }}
            className="text-white hover:text-blue-400 text-2xl font-serif font-black uppercase leading-[0.8] tracking-tighter inline-block"
          >
            Goat Ride<br />Adventure
          </a>
        </h1>
        {isPortrait && (
          <button 
            id="rotate-layout-btn"
            onClick={() => setRotateView(prev => !prev)}
            className="bg-zinc-900 border border-white/20 text-white px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider hover:bg-zinc-800 transition-all focus:outline-none focus:ring-1 focus:ring-white/40"
          >
            {rotateView ? "🔄 Fit Screen" : "🔄 Full Rotate"}
          </button>
        )}
      </header>

      <main className="flex-1 flex flex-col p-4 md:p-8" role="main" aria-label="Goat Ride Adventure Game View">
        <div 
          className={`Game_Screen_Surround flex flex-col max-w-6xl mx-auto w-full border-4 border-white/20 bg-black transition-all duration-300 ${
            isPortrait 
              ? rotateView
                ? 'origin-top-left rotate-90 w-[84vh] h-[100vw] absolute left-[100vw] top-0 z-50' 
                : 'flex-none h-auto w-full aspect-[16/10] max-h-[45vh]'
              : 'flex-1'
          }`}
        >
          {/* HUD Bar per user request */}
          <div 
            className="HUD_Bar p-4 flex justify-between items-center text-xl font-serif font-black uppercase"
            style={{ color: '#FFFFFF', backgroundColor: '#000000' }}
          >
            <div className="flex gap-8">
              <div>Level: {level}</div>
              <div>Score: {formatScore(score)}</div>
            </div>
            <div className="flex flex-col items-center">
              <div 
                className="text-[10px] uppercase tracking-tighter"
                style={{ color: '#FF4500' }}
              >
                Top Score: {formatScore(topScore)}
              </div>
            </div>
            <div className="flex gap-8">
              <div>Speed: {gameState.speed.toFixed(1)}</div>
              <div className={gameState.cruiseControl ? "text-blue-400" : "text-gray-500"}>
                CRUISE: {gameState.cruiseControl ? "ON" : "OFF"}
              </div>
            </div>
          </div>

          <div 
            id="game-container" 
            ref={containerRef}
            tabIndex={0}
            className="Outer_Animation_Screen flex-1 bg-black relative focus:outline-none h-full"
          >
            <canvas 
              ref={canvasRef}
              id="gameCanvas"
              role="image"
              aria-label="Interactive game area. Use Arrow keys to move and Space to jump over obstacles like bushes, rocks, and logs. Current level and score are shown in the HUD above."
              className="Animation_Screen w-full h-full block"
              style={{ backgroundColor: 'Black' }}
            />
            
            {/* On-screen controls hints for accessibility */}
            <div className="absolute bottom-4 left-4 text-[10px] text-white/30 uppercase tracking-widest space-y-1">
              <p>Arrows: Move | Space: Jump</p>
              <p>I: Inc Speed | K: Dec Speed</p>
              <p>S: Bleat | Esc: Main Menu</p>
            </div>
          </div>
        </div>
        
        {isPortrait && !rotateView && (
          <div className="Portrait_Controls_Helper mt-auto p-4 bg-zinc-950/80 border border-white/10 rounded-md text-xs text-white/60 font-mono text-center">
            <p className="font-bold text-white mb-1 uppercase tracking-wider text-[11px]">Portrait View Optimized</p>
            <p>The native landscape goat track is fitted on the upper portion of your screen.</p>
            <p className="mt-1">Tap <strong className="text-blue-400">"Full Rotate"</strong> at the top to fill screen sideways.</p>
          </div>
        )}
      </main>

      <footer className="p-4 text-center text-white/20 text-[10px] uppercase tracking-widest font-mono">
        High-Fidelity N64 Simulation Mode
      </footer>
    </div>
  );
}

function formatScore(score: bigint): string {
  const s = score.toString();
  if (s.length <= 3) return s;
  if (s.length <= 6) return (Number(score) / 1000).toFixed(1) + 'K';
  if (s.length <= 9) return (Number(score / 1000000n)).toFixed(1) + 'M';
  if (s.length <= 12) return (Number(score / 1000000000n)).toFixed(1) + 'B';
  if (s.length <= 15) return (Number(score / 1000000000000n)).toFixed(1) + 'T';
  return s.slice(0, 3) + '...' + (s.length - 3) + ' digits';
}
