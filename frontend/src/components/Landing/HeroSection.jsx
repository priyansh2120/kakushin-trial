import React from 'react';

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-10 m-5 rounded-md">
      <div className="max-w-7xl mx-auto flex flex-col items-start">
        <h1 className="text-5xl font-bold mb-6">Building financial security easy as playing a game!</h1>
        <div>
          <button className="bg-green-500 px-6 py-3 rounded-full text-xl font-semibold mr-4">See video</button>
          <button className="bg-blue-500 px-6 py-3 rounded-full text-xl font-semibold">Try now</button>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
