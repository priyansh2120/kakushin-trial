import React from "react";
import HeroSection from './HeroSection';
import CustomerReview from './CustomerReview';
import FeaturesSection from './Features';
import Chatbot from "./Chatbot";

const Landing = () => {
  return (
    <>
    <div className="flex bg-gradient-to-r from-gray-600 to-gray-800 h-lvh">
      <div className="flex-1">

      <HeroSection />
      <div className="flex w-full justify-around">

      <CustomerReview />
      <FeaturesSection />
      </div>
      </div>
      <div className="flex-1 text-8xl">Chatbot
        <div>
          {/* <Chatbot /> */}
        </div>
      </div>
    </div>
    </>
  );
};

export default Landing;
