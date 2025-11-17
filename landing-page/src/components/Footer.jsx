import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark bg-opacity-75 border-top border-light border-opacity-10">
      <div className="container py-5">
        <div className="row g-4">
          {/* Company Info */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center mb-3">
              <img
                src="/assets/images/healthsphere-logo.svg"
                alt="HealthSphere AI Logo"
                height="40"
                className="me-3"
              />
            </div>
            <p className="text-muted mb-4">
              Revolutionizing healthcare through AI-powered technology. Your health companion for a better tomorrow.
            </p>
            <div className="d-flex gap-3">
              <div className="bg-primary bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center"
                   style={{ width: '40px', height: '40px' }}>
                <span className="text-primary fw-bold">AI</span>
              </div>
              <div className="bg-info bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center"
                   style={{ width: '40px', height: '40px' }}>
                <span className="text-info fw-bold">ML</span>
              </div>
              <div className="bg-success bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center"
                   style={{ width: '40px', height: '40px' }}>
                <span className="text-success fw-bold">CV</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6">
            <h6 className="text-white fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#home" className="text-muted text-decoration-none hover:text-white">Home</a>
              </li>
              <li className="mb-2">
                <a href="#features" className="text-muted text-decoration-none hover:text-white">Features</a>
              </li>
              <li className="mb-2">
                <a href="#team" className="text-muted text-decoration-none hover:text-white">Team</a>
              </li>
              <li className="mb-2">
                <a href="#download" className="text-muted text-decoration-none hover:text-white">Download</a>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3">Features</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <span className="text-muted">AI Food Scanner</span>
              </li>
              <li className="mb-2">
                <span className="text-muted">Medication Analysis</span>
              </li>
              <li className="mb-2">
                <span className="text-muted">Health Analytics</span>
              </li>
              <li className="mb-2">
                <span className="text-muted">Personalized Insights</span>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3">Connect</h6>
            <p className="text-muted mb-3">
              Follow us for updates and health tips
            </p>
            <div className="d-flex gap-3 mb-3">
              <a 
                href="https://github.com/Johannes613" 
                className="text-muted text-decoration-none social-icon"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <div className="bg-dark bg-opacity-50 rounded-circle d-flex align-items-center justify-content-center p-2"
                     style={{ width: '40px', height: '40px' }}>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                  </svg>
                </div>
              </a>
              
              <a 
                href="https://www.linkedin.com/in/yohannis-adamu-1837832b9" 
                className="text-muted text-decoration-none social-icon"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <div className="bg-dark bg-opacity-50 rounded-circle d-flex align-items-center justify-content-center p-2"
                     style={{ width: '40px', height: '40px' }}>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                  </svg>
                </div>
              </a>
              
              <a 
                href="https://x.com/john40336738581?s=21" 
                className="text-muted text-decoration-none social-icon"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <div className="bg-dark bg-opacity-50 rounded-circle d-flex align-items-center justify-content-center p-2"
                     style={{ width: '40px', height: '40px' }}>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
              </a>
              
              <a 
                href="https://www.facebook.com/share/162Qps5sq2/?mibextid=wwXIfr" 
                className="text-muted text-decoration-none social-icon"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <div className="bg-dark bg-opacity-50 rounded-circle d-flex align-items-center justify-content-center p-2"
                     style={{ width: '40px', height: '40px' }}>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-top border-light border-opacity-10 mt-4 pt-4">
          <div className="row align-items-center">
            <div className="col-md-6 mb-3 mb-md-0 mx-auto">
              <p className="text-muted small mb-0">
                &copy; 2025 HealthSphere AI. All rights reserved. Developed by Yohannis Adamu.
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
