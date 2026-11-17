import React, { useState } from 'react';
import { getAvailableGoats } from '../../../Characters/Goats';
import { GoatCharacteristics } from '../../Logic/types';
import { motion, AnimatePresence } from 'motion/react';
import { SFXManager } from '../../Sound/SFX/SFXManager';

interface GoatSelectionScreenProps {
  onSelect: (goatId: string) => void;
  onBack: () => void;
}

export default function GoatSelectionScreen({ onSelect, onBack }: GoatSelectionScreenProps) {
  const goatsList = getAvailableGoats();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedGoat = selectedId ? goatsList[selectedId] : null;

  return (
    <div className="Goat_Selection min-h-screen bg-[#f5f5f0] text-[#1a1a1a] font-sans selection:bg-[#5A5A40] selection:text-white overflow-y-auto">
      <header className="p-8 border-b border-[#1a1a1a]/10">
        <h1 className="text-4xl font-serif font-black uppercase tracking-tighter leading-none">
          <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="hover:text-[#5A5A40] transition-colors">
            Goat Ride<br />Adventure
          </a>
        </h1>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        <section className="mb-12">
          <h2 className="text-5xl font-serif font-bold mb-4 tracking-tight">Pick A Goat To Ride</h2>
          <p className="text-xl opacity-80 max-w-2xl leading-relaxed">
            Choose your goat what you want to ride. Each &#128016; is unique of color, height, and style. 
            Imagine you are fulljoying time at your local amusement park.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 item-start">
          {/* 4x4 Grid */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 opacity-50">Goats To Ride</h3>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(goatsList).map(([id, goat]) => (
                <button
                  key={id}
                  id={`goat-btn-${id}`}
                  onClick={() => {
                    setSelectedId(id);
                    SFXManager.resumeAudio();
                    SFXManager.playBleat(goat);
                  }}
                  aria-label={`${goat.name}, a ${goat.size} ${goat.gender} goat. ${goat.color} color.`}
                  aria-selected={selectedId === id}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden group ${
                    selectedId === id 
                    ? 'bg-[#5A5A40] text-white shadow-xl scale-105' 
                    : 'bg-white border border-[#1a1a1a]/10 hover:border-[#5A5A40]/30 hover:bg-[#5A5A40]/5'
                  }`}
                >
                  <span className="text-3xl mb-1 group-hover:scale-125 transition-transform">🐐</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider">{goat.name}</span>
                  {selectedId === id && (
                    <motion.div 
                      layoutId="outline"
                      className="absolute inset-0 border-4 border-[#5A5A40] rounded-2xl"
                    />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Description Panel */}
          <section className="lg:sticky lg:top-8 lg:max-h-[85vh] lg:overflow-y-auto pr-4 custom-scrollbar">
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6 opacity-50">Goat Description</h4>
            <AnimatePresence mode="wait">
              {selectedGoat ? (
                <motion.div
                  key={selectedId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h5 className="text-6xl font-serif font-black">{selectedGoat.name}</h5>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-[#5A5A40] text-white text-[10px] rounded-full uppercase font-bold">
                        {selectedGoat.size}
                      </span>
                      <span className="px-3 py-1 border border-[#1a1a1a]/20 text-[10px] rounded-full uppercase font-bold">
                        {selectedGoat.gender}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedGoat.description.map((para, i) => (
                      <p key={i} className="text-lg leading-relaxed">{para}</p>
                    ))}
                  </div>

                  <ul className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm font-mono border-t border-[#1a1a1a]/10 pt-6">
                    <li><span className="opacity-50">COLOR:</span> {selectedGoat.color}</li>
                    <li><span className="opacity-50">HEIGHT:</span> {selectedGoat.height}</li>
                    <li><span className="opacity-50">LENGTH:</span> {selectedGoat.length}</li>
                    <li><span className="opacity-50">CHEST:</span> {selectedGoat.chest}</li>
                    <li><span className="opacity-50">WIDTH:</span> {selectedGoat.width}</li>
                    <li><span className="opacity-50">HORNS:</span> {selectedGoat.hornColor}</li>
                    <li><span className="opacity-50">EYES:</span> {selectedGoat.eyeColor}</li>
                  </ul>

                  <button
                    id="ride-now-btn"
                    onClick={() => onSelect(selectedId!)}
                    className="w-full py-6 bg-[#1a1a1a] text-white rounded-full text-xl font-bold hover:bg-[#5A5A40] transition-colors shadow-2xl active:scale-95"
                  >
                    Ride Now
                  </button>
                </motion.div>
              ) : (
                <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-[#1a1a1a]/10 rounded-3xl">
                  <p className="text-sm opacity-40 uppercase tracking-widest">Select a goat to view details</p>
                </div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      <footer className="p-8 border-t border-[#1a1a1a]/10 mt-16 flex justify-between items-center bg-white/50 backdrop-blur-sm">
        <p className="text-[10px] uppercase font-bold tracking-widest opacity-30">© 2026 GOAT RIDE ADVENTURE • SCIENTIFICALLY PRECISE</p>
        <button 
           onClick={onBack}
           className="text-[10px] uppercase font-bold underline hover:no-underline"
        >
          Back To Landing
        </button>
      </footer>
    </div>
  );
}
