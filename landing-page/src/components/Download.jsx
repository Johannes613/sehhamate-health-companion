// src/components/Download.jsx
import React, { useState } from 'react';
import { 
  PiAndroidLogoBold, 
  PiAppleLogoBold, 
  PiQrCodeBold,
  PiDownloadBold,
  PiStarBold,
  PiUsersBold,
  PiShieldCheckBold
} from 'react-icons/pi';
import img_app from "./preview_img.PNG";
import qrCode from "./qrCode.png";

const Download = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleDownload = () => {
    window.open(
      "https://expo.dev/preview/update?message=Initial+HealthSphere+AI+app+release&updateRuntimeVersion=1.0.0&createdAt=2025-08-11T22%3A53%3A42.959Z&slug=exp&projectId=5e59871c-b21f-4ccc-8ade-6bb9f8218cff&group=3165f580-1652-46c8-8a38-120e87370c68",
      "_blank"
    );
  };

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => setIsSubscribed(false), 3000);
      setEmail('');
    }
  };

  const features = [
    {
      icon: <PiStarBold className="text-warning fs-2" />,
      title: "Premium Quality",
      description: "Built with cutting-edge AI technology and industry best practices"
    },
    {
      icon: <PiUsersBold className="text-info fs-2" />,
      title: "User-Friendly",
      description: "Intuitive interface designed for users of all technical levels"
    },
    {
      icon: <PiShieldCheckBold className="text-success fs-2" />,
      title: "Secure & Private",
      description: "Enterprise-grade security with end-to-end encryption"
    }
  ];

  return (
    <section id="download" className="py-5 section-padding">
      <div className="container">
        <div className="row text-center mb-5">
          <div className="col-lg-8 mx-auto">
            <h3 className="section-title gradient-text mb-3">
              Download HealthSphere AI
            </h3>
            <p className="section-subtitle">
              Experience the future of healthcare on your mobile device. Open directly in Expo Go on both Android and iOS platforms.
            </p>
          </div>
        </div>

        <div className="row g-4 mb-5">
          {features.map((feature, index) => (
            <div key={index} className="col-lg-4 col-md-6">
              <div className="card card-custom border-0 shadow-lg h-100 text-center">
                <div className="card-body p-4">
                  <div className="mb-3">
                    {feature.icon}
                  </div>
                  <h5 className="h6 fw-bold text-white mb-3">{feature.title}</h5>
                  <p className="text-muted mb-0 fw-medium">{feature.description}</p>
            </div>
          </div>
            </div>
          ))}
          </div>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card card-custom border-0 shadow-lg">
              <div className="card-body p-5 text-center">
                <h4 className="h3 fw-bold text-white mb-4">
                  Get Started Today
                </h4>
                <p className="text-muted mb-5 fs-5 fw-medium">
                  Join thousands of users who are already transforming their health with AI-powered insights. Open the app directly in Expo Go.
                </p>

                {/* Single Download Button */}
                <div className="mb-5">
                  <button
                    onClick={handleDownload}
                    className="btn btn-custom btn-lg d-inline-flex align-items-center justify-content-center gap-2 px-4 py-3"
                  >
                    <PiDownloadBold />
                    Open in Expo Go
                  </button>
                  <div className="mt-3">
                    <small className="text-muted fw-medium">Available on Android 8.0+ and iOS 14.0+</small>
            </div>
          </div>

                <div className="row align-items-center">
                  <div className="col-lg-6">
                    <div className="text-lg-start">
                      <h5 className="h6 fw-bold text-white mb-3">Quick Access</h5>
                      <p className="text-muted mb-4 fw-medium">Scan the QR code to download directly to your device</p>
                      <div className="bg-white rounded-4 p-3 d-inline-block">
                        <img 
                          src={qrCode} 
                          alt="QR Code for HealthSphere AI Download"
                          className="img-fluid"
                          style={{ width: '100px', height: '100px' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <PiQrCodeBold 
                          className="text-dark" 
                          style={{ fontSize: '100px', display: 'none' }} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="text-lg-start">
                      <h5 className="h6 fw-bold text-white mb-3">Stay Updated</h5>
                      <p className="text-muted mb-4 fw-medium">Get notified about new features, updates, and health tips</p>
                      
                      {!isSubscribed ? (
                        <form onSubmit={handleNewsletter} className="d-flex gap-2">
            <input
              type="email"
                            className="form-control"
              placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
            />
                          <button type="submit" className="btn btn-primary btn-sm">
                            Subscribe
            </button>
                        </form>
                      ) : (
                        <div className="alert alert-success">
                          <i className="bi bi-check-circle me-2"></i>
                          Thank you for subscribing!
                        </div>
                      )}
                      
                      <div className="mt-3">
                        <small className="text-muted fw-medium">
                          We respect your privacy. Unsubscribe at any time.
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* App Preview */}
        <div className="row mt-5 pt-5">
          <div className="col-lg-10 mx-auto">
            <div className="card card-custom border-0 shadow-lg">
              <div className="card-body p-5">
                <div className="row align-items-center">
                  <div className="col-lg-6 text-lg-start">
                    <h4 className="h3 fw-bold text-white mb-3">
                      See HealthSphere AI in Action
                    </h4>
                    <p className="text-muted mb-4 fs-5 fw-medium">
                      Experience the intuitive interface and powerful features that make health management effortless and engaging.
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                      <span className="badge bg-primary fs-6 px-3 py-2 fw-semibold">Real-time Scanning</span>
                      <span className="badge bg-info fs-6 px-3 py-2 fw-semibold">AI Analysis</span>
                      <span className="badge bg-success fs-6 px-3 py-2 fw-semibold">Health Tracking</span>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="position-relative">
                      <img
                        src={img_app} 
                        alt="HealthSphere AI App Interface"
                        className="img-fluid rounded-4 shadow-lg"
                        style={{ maxHeight: '300px', width: 'auto', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300/10b981/ffffff?text=App+Preview';
                        }}
                      />
                      <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient-radial rounded-4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Download;
