import React, { useEffect, useState } from 'react';

interface InterstitialAdProps {
  onComplete: () => void;
}

export default function InterstitialAd({ onComplete }: InterstitialAdProps) {
  const [secondsLeft, setSecondsLeft] = useState(30);

  useEffect(() => {
    // Auto-dismiss after 30 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 30000);

    const interval = setInterval(() => {
      setSecondsLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 z-[500] bg-white flex flex-col items-center justify-center p-8"
      id="Interstitial_Ad"
    >
      <div className="text-xl font-bold uppercase tracking-widest text-[#14532d] mb-4">
        🌿 FDF ARCADE INTERSTITIAL AD 🌿
      </div>
      <div className="text-sm font-semibold tracking-wider text-gray-500 mb-8">
        Game will resume automatically in <span className="font-mono text-lg text-emerald-600 font-bold">{secondsLeft}</span> seconds
      </div>
      
      <div 
        id="Advertisement" 
        className="flex items-center justify-center min-h-[250px] w-full border-t border-b border-gray-100 py-8"
      >
        {/* Revive Adserver Asynchronous JS Tag - Generated with Revive Adserver v5.5.2 */}
        <ins 
          data-revive-zoneid="14" 
          data-revive-id="fe1f19a638c05881542e31deb5ef01ad"
        ></ins>
        <script async src="//ads.fairiesdreamsfantasy.com/adserver/www/delivery/asyncjs.php"></script>
      </div>

      <button 
        onClick={onComplete}
        className="mt-12 px-8 py-4 bg-[#14532d] text-white font-bold uppercase tracking-wider rounded-2xl shadow-lg hover:bg-green-700 active:scale-95 transition-all text-lg"
      >
        Skip / Close Ad
      </button>
    </div>
  );
}
