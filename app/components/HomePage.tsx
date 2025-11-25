'use client';

import React, { useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

import Prism from './Prism';

const HomePage: React.FC = () => {
  useEffect(() => {
    // Ensure ready() is called when this component mounts
    // This is a backup in case the RootProvider call didn't work
    try {
      sdk.actions.ready();
    } catch {
      // Silently fail if SDK not available
    }
  }, []);

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
              scale={3.6}
              hueShift={0}
              colorFrequency={1}
              noise={0}
              glow={1}
          />
        </div>
        
        {/* Overlay content */}
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-30 z-10">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl text-white mb-8 tracking-wider" style={{ fontFamily: 'serif' }}>
              THE VAULT
            </h1>
            <div className="flex gap-4 justify-center">
              <button 
                className="bg-white text-black px-8 py-3 rounded-lg text-md font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg min-h-[44px]"
                onClick={() => window.location.href = '/dashboard'}
              >
                Login
              </button>
              <button 
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg text-md font-semibold hover:bg-white hover:text-black transition-colors duration-200 shadow-lg min-h-[44px]"
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
