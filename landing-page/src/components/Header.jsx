import React, { useState, useEffect } from 'react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed-top bg-dark transition-all duration-300">
      <nav className="navbar navbar-expand-lg navbar-dark py-3">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="#home">
            <img 
              src="/assets/images/healthsphere-logo.svg" 
              alt="HealthSphere AI" 
              className="img-fluid"
              style={{ height: '40px' }}
            />
          </a>

          <button
            className="navbar-toggler border-0"
            type="button"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 text-center text-lg-start">
              <li className="nav-item">
                <a className="nav-link px-3 py-2" href="#home" onClick={() => setIsMobileMenuOpen(false)}>
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link px-3 py-2" href="#features" onClick={() => setIsMobileMenuOpen(false)}>
                  Features
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link px-3 py-2" href="#team" onClick={() => setIsMobileMenuOpen(false)}>
                  Team
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link px-3 py-2" href="#download" onClick={() => setIsMobileMenuOpen(false)}>
                  Download
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
