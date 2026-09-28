import React from 'react';
import Navbar from '../components/navbar';
import { Link } from 'react-router';
import "../styles/home.css"

const Home = () => {
  return (
    <div className='home-body'>

        <Navbar/>

      {/* Hero Section */}
      <main className="home-container">
        {/* Left Side: Cafe Image Container */}
        <div className="hero-image-container">
          <img
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24"
            alt="Cozy Cafe Interior"
            className="hero-image"
          />
        </div>

        {/* Right Side: Branding & Hero Text */}
        <div className="hero-content">
          {/* Logo Badge */}
          <div className='hero-brand-box'>
            <div className="brand-icon-box">
              <div className="brand-icon-letter">
                S
              </div>
            </div>
            <span className="hero-brand-title">
              SeatSpotter
            </span>
          </div>

          {/* Tagline */}
          <h2 className="hero-heading mt-3 mb-5">
            Looking for a place <br /> to chill?
          </h2>

          {/* Action Button */}
          <Link
            to="/cafes"
            className="btn-cta"
          >
            Try us to find a good spot
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home;