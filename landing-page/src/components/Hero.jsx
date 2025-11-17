import React, { useState, useEffect } from "react";
import { PiDownloadBold } from "react-icons/pi";
import heroImg from './hero.PNG';

const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleDownload = () => {
    window.open(
      "https://expo.dev/preview/update?message=Initial+HealthSphere+AI+app+release&updateRuntimeVersion=1.0.0&createdAt=2025-08-11T22%3A53%3A42.959Z&slug=exp&projectId=5e59871c-b21f-4ccc-8ade-6bb9f8218cff&group=3165f580-1652-46c8-8a38-120e87370c68",
      "_blank"
    );
  };

  return (
    <section id="home" className="min-vh-100 d-flex align-items-center position-relative overflow-hidden">
      {/* Background gradient */}
      <div className="bg-gradient-radial position-fixed top-0 start-0 w-100 h-100"></div>
      
      {/* Animated background elements */}
      <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden">
        <div className="position-absolute" style={{ top: '10%', left: '10%', width: '200px', height: '200px', opacity: 0.1 }}>
          <div className="bg-primary rounded-circle animate-float" style={{ width: '100%', height: '100%' }}></div>
        </div>
        <div className="position-absolute" style={{ top: '60%', right: '15%', width: '150px', height: '150px', opacity: 0.1 }}>
          <div className="bg-info rounded-circle animate-float" style={{ width: '100%', height: '100%', animationDelay: '2s' }}></div>
        </div>
      </div>

      <div className="container position-relative" style={{ zIndex: 10, marginTop: '80px' }}>
        <div className="row align-items-center">
          <div className={`col-lg-6 text-center text-lg-start ${isLoaded ? 'animate-slide-left' : ''}`}>
            <h1 className="display-3 fw-black mb-4 gradient-text">
              AI-Powered Health & Wellness Platform
            </h1>
            <p className="lead text-light mb-5 fs-5" style={{ maxWidth: '600px', lineHeight: '1.8',opacity:0.8 }}>
              Revolutionary AI-powered health app with food scanning, medication analysis, 
              nutrition tracking, and personalized health insights. Your health companion powered by artificial intelligence.
            </p>

            <div className="d-flex justify-content-center justify-content-lg-start">
              <button
                onClick={handleDownload}
                className="btn btn-custom d-inline-flex align-items-center gap-3 px-5 py-3"
              >
                <PiDownloadBold className="fs-4" />
                <span>Open in Expo Go</span>
              </button>
            </div>

            <div className="mt-4 text-light">
              <small className="text-muted">Available on Expo Go</small>
            </div>
          </div>

          <div className={`col-lg-6 d-flex justify-content-center ${isLoaded ? 'animate-slide-right' : ''}`}>
            <div 
              className="position-relative"
              style={{ 
                width: '320px', 
                height: '600px',
                animation: isLoaded ? 'float 6s ease-in-out infinite' : 'none'
              }}
            >
              <div 
                className="bg-dark rounded-4 border border-secondary shadow-lg"
                style={{
                  width: '100%',
                  height: '100%',
                  transform: 'rotate(-8deg)',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'rotate(0deg) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'rotate(-8deg) scale(1)';
                }}
              >
                <img
                  className="w-100 h-100 rounded-3"
                  src={heroImg}
                  alt="HealthSphere AI App Preview"
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = '/hero.PNG';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
