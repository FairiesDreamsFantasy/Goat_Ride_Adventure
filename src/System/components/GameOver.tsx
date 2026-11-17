import React from 'react';

const GameOver: React.FC = () => {
  return (
    <main>
      <div 
        style={{
          textAlign: 'center',
          display: 'block',
          verticalAlign: 'center',
          color: 'LightBlue',
          backgroundColor: '#000000',
          borderWidth: '4px',
          borderColor: 'LightBlue'
        }} 
        id="Game_Over_Box"
        className="p-8 rounded-lg"
      >
        <h1 className="text-4xl font-bold mb-4">GAME OVER</h1>
        <div id="Visuals_4_Game_Over_Box" className="text-center block w-full max-w-full mt-2 mb-2 p-0">
          {/* Visual image goes here */}
          <p>Visual representation of Game Over</p>
        </div>
        <div id="Message_Paragraphs" className="mb-4">
          <p>Your adventure ends here. You may restart the level if you wish.</p>
        </div>
        <div id="Donation_Links" className="mb-4">
          {/* Donation links go here */}
        </div>
        <button 
          id="Play_Again_Button"
          className="bg-LightBlue text-black px-4 py-2 rounded"
          onClick={() => window.location.reload()}
        >
          Play Again
        </button>
      </div>
    </main>
  );
};

export default GameOver;
