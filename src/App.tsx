import React, { useState } from 'react';
import LandingPage from './System/components/LandingPage';
import RiderSelectionScreen from './System/components/RiderSelectionScreen';
import GoatSelectionScreen from './System/UI/Goat_Selection/GoatSelectionScreen';
import PlayAreaView from './System/UI/Play_Area/PlayAreaView';
import InterstitialAd from './System/components/InterstitialAd';
import { RiderCharacter } from './System/Logic/types';

export default function App() {
  const [view, setView] = useState<'landing' | 'rider_selection' | 'selection' | 'play' | 'interstitial'>('landing');
  const [selectedGoat, setSelectedGoat] = useState('white_standard');
  const [selectedRider, setSelectedRider] = useState<RiderCharacter | null>(null);
  const [nextView, setNextView] = useState<'play'>('play');

  const goToRiderSelection = () => setView('rider_selection');
  
  const handleRiderSelect = (rider: RiderCharacter) => {
    setSelectedRider(rider);
    setView('selection');
  };

  const handleStart = (goat: string) => {
    setSelectedGoat(goat);
    setNextView('play');
    setView('interstitial');
  };

  const handleAdComplete = () => {
    setView(nextView);
  };

  return (
    <div className="min-h-screen bg-black">
      {view === 'landing' && <LandingPage onStartGame={goToRiderSelection} />}
      {view === 'rider_selection' && <RiderSelectionScreen onSelect={handleRiderSelect} onBack={() => setView('landing')} />}
      {view === 'selection' && <GoatSelectionScreen onSelect={handleStart} onBack={() => setView('rider_selection')} />}
      {view === 'interstitial' && <InterstitialAd onComplete={handleAdComplete} />}
      {view === 'play' && <PlayAreaView onBack={() => setView('selection')} selectedGoat={selectedGoat} selectedRider={selectedRider} />}
    </div>
  );
}
