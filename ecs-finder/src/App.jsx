import { useState } from 'react'
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import MainContent from './components/MainContent';

function App() {
  return (
    <div>
    <Navbar/>
      <div className="bg-gradient-to-t from-[#1c92d2] to-[#f2fcfe] min-h-screen">
        <HeroSection/>
        <MainContent/>
      </div>
    </div>
  )
}

export default App;
