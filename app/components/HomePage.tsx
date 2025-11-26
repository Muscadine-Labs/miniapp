'use client';

import React from 'react';

import Prism from './Prism';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full h-screen relative">
        {/* Prism Background Layer */}
        <div className="absolute inset-0 w-full h-full">
          <Prism
              animationType="3drotate"
              timeScale={0.5}
              height={3.5}
              baseWidth={5.5}
              scale={2.5}
              hueShift={0}
              colorFrequency={1}
              noise={0}
              glow={1}
          />
        </div>
        
        {/* Overlay content */}
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-30 z-10 px-4">
          <div className="text-center w-full max-w-md">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl text-white mb-6 md:mb-8 tracking-wider px-4" style={{ fontFamily: 'serif' }}>
              THE VAULT
            </h1>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4">
              <button 
                className="bg-white text-black px-6 sm:px-8 py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 shadow-lg min-h-[44px] w-full sm:w-auto"
                onClick={() => window.location.href = '/dashboard'}
              >
                Login
              </button>
              <button 
                className="bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-white hover:text-black active:bg-white/80 transition-colors duration-200 shadow-lg min-h-[44px] w-full sm:w-auto"
                onClick={() => window.open('https://muscadine.box', '_blank')}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
