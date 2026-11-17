import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ALL_RIDERS } from '../../Characters/Riders';
import { RiderCharacter } from '../Logic/types';
import { User, ChevronRight, Scale, Info, Shirt, Crosshair } from 'lucide-react';

interface Props {
  onSelect: (rider: RiderCharacter) => void;
  onBack: () => void;
}

export default function RiderSelectionScreen({ onSelect, onBack }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedRider = ALL_RIDERS[selectedIndex];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-8 flex flex-col items-center overflow-y-auto">
      <header className="text-center mb-12">
        <h1 className="text-6xl md:text-8xl font-black text-pink-500 uppercase italic tracking-tighter leading-none">
          Goat Ride<br />Adventure
        </h1>
        <div className="mt-4 flex flex-col items-center">
          <div className="h-0.5 w-64 bg-emerald-500 mb-2"></div>
          <span className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-xs">Babylon-Free Craftsmanship</span>
        </div>
      </header>

      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-black uppercase tracking-tight italic border-l-4 border-pink-500 pl-4">
              Choose Your Character
            </h2>
            <p className="text-zinc-400 leading-relaxed max-w-xl italic">
              Each character is unique. However; we don't do stereotypes here because, its associated with "Babylon". We promise!
            </p>
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-4">
              <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                <Info size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-emerald-400 font-bold uppercase text-xs tracking-widest">Scientific Advisory: Giant Breed Compatibility</h4>
                <p className="text-zinc-500 text-xs leading-relaxed italic">
                  All goats in our care have been scientifically bred to "Giant Breed" proportions (reaching 5.5 - 8.5 feet in height). This craftsmanship ensures that riders of all heights, from dwarf to 6'2", can be accommodated with realistic anatomical precision and safe riding geometry.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-3 pt-4">
            {ALL_RIDERS.map((rider, index) => (
              <button
                key={rider.id}
                onClick={() => setSelectedIndex(index)}
                className={`relative aspect-square rounded-xl transition-all duration-300 overflow-hidden border-2 
                  ${selectedIndex === index 
                    ? 'border-pink-500 scale-110 z-10 shadow-[0_0_20px_rgba(236,72,153,0.3)]' 
                    : 'border-white/5 hover:border-white/20 grayscale opacity-40 hover:opacity-100 hover:grayscale-0'
                  }`}
                aria-label={`Select ${rider.name}`}
              >
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                  <User size={32} className={selectedIndex === index ? "text-pink-500" : "text-zinc-600"} />
                </div>
                {rider.isDwarf && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_emerald]" />
                )}
              </button>
            ))}
          </div>

          <div className="pt-8 flex justify-center lg:justify-start">
            <button
              onClick={() => onSelect(selectedRider)}
              className="group flex items-center gap-4 bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-xl transition-all active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
            >
              Next
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <aside className="bg-zinc-900/50 rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="bg-zinc-800/80 p-8 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-500">
                <User size={40} />
              </div>
              <div>
                <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white">
                  {selectedRider.name}
                </h3>
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                  {selectedRider.ethnicity}
                </span>
              </div>
            </div>
            {selectedRider.babylonFree && (
              <div className="flex flex-col items-end">
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                  Babylon-Free
                </span>
              </div>
            )}
          </div>

          <div className="p-8 space-y-8 lg:max-h-[60vh] lg:overflow-y-auto custom-scrollbar-dark">
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-pink-500 text-xs font-black uppercase tracking-widest">
                <Info size={14} />
                <span>Biography</span>
              </div>
              <p className="text-zinc-300 leading-relaxed text-sm italic font-medium">
                "{selectedRider.bio}"
              </p>
            </section>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <DetailItem 
                  icon={<Scale size={16} />} 
                  label="Height" 
                  value={selectedRider.height} 
                  color="text-blue-400"
                />
                <DetailItem 
                  icon={<Crosshair size={16} />} 
                  label="Capabilities" 
                  value={`${selectedRider.hasPOV ? 'POV' : ''}${selectedRider.hasPOV && selectedRider.hasRiderView ? ' / ' : ''}${selectedRider.hasRiderView ? 'Rider View' : ''}`} 
                  color="text-amber-400"
                />
              </div>
              <div className="space-y-4">
                <DetailItem 
                  icon={<div className="w-3 h-3 rounded-full" style={{ background: selectedRider.hairColor }} />} 
                  label="Hair Color" 
                  value={selectedRider.hairColor} 
                  color="text-zinc-400"
                />
                <DetailItem 
                  icon={<div className="w-4 h-4 flex items-center justify-center text-[10px]" style={{ color: selectedRider.eyeColor.split(' ')[0] }}>👁️</div>} 
                  label="Eye Color" 
                  value={selectedRider.eyeColor} 
                  color="text-zinc-400"
                />
              </div>
            </div>

            <section className="space-y-3 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-widest">
                <Shirt size={14} />
                <span>Attire</span>
              </div>
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-zinc-500 uppercase font-black block mb-2 tracking-widest">Summer</span>
                  <p className="text-zinc-200 text-xs leading-relaxed">{selectedRider.attire.summer}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 opacity-80">
                  <span className="text-[10px] text-zinc-500 uppercase font-black block mb-2 tracking-widest">Winter</span>
                  <p className="text-zinc-200 text-xs leading-relaxed">{selectedRider.attire.winter}</p>
                </div>
              </div>
            </section>
          </div>
        </aside>
      </main>

      <footer className="mt-auto pt-12 text-center">
        <button 
          onClick={onBack}
          className="text-zinc-600 hover:text-zinc-300 font-bold uppercase tracking-widest text-xs transition-colors"
        >
          ← Back to Title
        </button>
      </footer>
    </div>
  );
}

function DetailItem({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-1 ${color}`}>{icon}</div>
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block leading-none mb-1">
          {label}
        </span>
        <span className="text-white font-bold text-sm tracking-tight">{value}</span>
      </div>
    </div>
  );
}
