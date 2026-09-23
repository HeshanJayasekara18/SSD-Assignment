import React, { useState, useEffect } from 'react';
import sigiriyaLanding from '../../../images/sigiriya-landing.jpg';
import deerLanding from '../../../images/deer-landing.jpg';
import weblogo from '../../../images/logo.png';
import templeofthtoothLanding from '../../../images/templeofthtooth-landing.jpeg';

import { useNavigate } from 'react-router-dom';

import './LandingAfterLogin.css';
import Section2 from '../../landing/section-2/Section2';
import Section4 from '../../landing/section-4/Section4';
import Footer from '../../landing/Footer/Footer';

const slides = [
  {
    image: sigiriyaLanding,
    title: 'Sigiriya',
    description: 'Ancient "Lion Rock" fortress, famed for frescoes and views.'
  },
  {
    image: deerLanding,
    title: 'Yala National Park',
    description: 'Leopard filled wildlife safaris.'
  },
  {
    image: templeofthtoothLanding,
    title: 'Temple of The Tooth',
    description: "Sacred Buddhist shrine with Buddha's tooth relic."
  }
];

const LandingAfterLogin = () => {

  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleCardClick = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="home-landingLandingPage">
      <div className="home-landingHeroSection">
        <div className="home-landingSliderContainer">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`home-landingSlide ${index === currentSlide ? 'home-landingActiveSlide' : ''}`}
            >
              <img src={slide.image} alt={slide.title} className="home-landingSlideImage" />
              <div className="home-landingOverlay"></div>
            </div>
          ))}
        </div>

        <div className="home-landingHeroContent">
          <h1 className="home-landingHeroTitle">Your Dream Vacation Awaits</h1>
          <p className="home-landingHeroSubtitle">Explore Sri Lanka with us.</p>
          <button className="home-landingExploreButton">Explore Now →</button>
        </div>

        <div className="home-landingSlideIndicator">0{currentSlide + 1}</div>

        <div className="home-landingDestinationCards">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`home-landingDestinationCard ${index === currentSlide ? 'home-landingActiveCard' : ''}`}
              onClick={() => handleCardClick(index)}
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <h3>{slide.title}</h3>
              <p>{slide.description}</p>
            </div>
          ))}
        </div>

        {/* WAVE SVG - Positioned at the bottom */}
        <div className="home-landingWaveContainer">
          <svg
            className="home-landingWave"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,96L0,128C160,10,320,224,49,218.7C640,213,800,139,960,117.3C0,96,1280,128,1910,144L1440,160L1440,320L1360,320C120,320,110,320,96,320C800,320,640,320,480,320C320,320,160,320,80,322L0,320Z"
            ></path>
          </svg>
        </div>
      </div>
        <Section2/>
        <Section4/>
        <Footer/>
    </div>
  );
};

export default LandingAfterLogin;