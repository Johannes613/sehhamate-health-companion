import React, { useEffect, useRef } from 'react';
import { 
  PiBrainBold, 
  PiCameraBold, 
  PiPillBold, 
  PiChartLineBold,
  PiShieldCheckBold,
  PiUserBold
} from 'react-icons/pi';

const Features = () => {
  const featuresRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const featureCards = featuresRef.current?.querySelectorAll('.feature-card');
    featureCards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <PiCameraBold className="display-5 text-primary" />,
      title: "AI Food Scanner",
      description: "Advanced computer vision technology that instantly identifies food items and provides detailed nutritional information. Just point your camera and get instant results.",
      highlights: ["Real-time detection", "Nutritional analysis", "Calorie counting", "Allergen alerts"]
    },
    {
      icon: <PiPillBold className="display-5 text-primary" />,
      title: "Medication Analysis",
      description: "Comprehensive medication information including drug interactions, side effects, dosage guidelines, and safety warnings powered by advanced AI algorithms.",
      highlights: ["Drug interactions", "Side effects", "Dosage guidelines", "Safety warnings"]
    },
    {
      icon: <PiBrainBold className="display-5 text-primary" />,
      title: "AI Health Assistant",
      description: "Personalized health recommendations and insights based on your health data, lifestyle, and preferences. Your 24/7 health companion.",
      highlights: ["Personalized insights", "Health tracking", "Smart recommendations", "24/7 support"]
    },
    {
      icon: <PiChartLineBold className="display-5 text-primary" />,
      title: "Health Analytics",
      description: "Comprehensive health metrics and trends visualization. Track your progress, set goals, and monitor your health journey with detailed analytics.",
      highlights: ["Progress tracking", "Goal setting", "Trend analysis", "Health reports"]
    }
  ];

  return (
    <section id="features" className="py-5 section-padding">
      <div className="container">
        <div className="row text-center mb-5">
          <div className="col-lg-8 mx-auto">
            <h3 className="section-title gradient-text mb-3">
              Revolutionary Features
            </h3>
            <p className="section-subtitle">
              Experience the future of healthcare with AI-powered features designed to enhance your wellness journey
            </p>
          </div>
        </div>

        <div className="row g-3" ref={featuresRef}>
          {features.map((feature, index) => (
            <div key={index} className="col-lg-4 col-md-6">
              <div className="card card-custom h-100 border-0 shadow-lg feature-card animate-fade-in-up" 
                   style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="card-body text-center p-2">
                  <div className="mb-2">
                    {feature.icon}
                  </div>
                  <h4 className="h6 fw-bold mb-2 text-white">{feature.title}</h4>
                  <p className="text-muted mb-2 fw-medium small">{feature.description}</p>
                  
                  <div className="text-start">
                    <h6 className="text-primary mb-1 fw-bold fs-6">Key Features:</h6>
                    <ul className="list-unstyled">
                      {feature.highlights.map((highlight, idx) => (
                        <li key={idx} className="mb-1 d-flex align-items-center">
                          <span className="text-primary me-1 fw-bold">✓</span>
                          <span className="text-light fw-medium small">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Innovation Section */}
        <div className="row mt-5 pt-5">
          <div className="col-lg-10 mx-auto">
            <div className="card card-custom border-0 shadow-lg">
              <div className="card-body p-5 text-center">
                <div className="row align-items-center">
                  <div className="col-lg-6 text-lg-start">
                    <h4 className="h3 fw-bold text-white mb-3">
                      Powered by Advanced AI
                    </h4>
                    <p className="text-muted mb-4 fs-5 fw-medium">
                      Our cutting-edge artificial intelligence algorithms provide accurate, 
                      real-time health insights that adapt to your unique needs.
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                      <span className="badge bg-primary fs-6 px-3 py-2 fw-semibold">Machine Learning</span>
                      <span className="badge bg-info fs-6 px-3 py-2 fw-semibold">Computer Vision</span>
                      <span className="badge bg-success fs-6 px-3 py-2 fw-semibold">Natural Language Processing</span>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="position-relative">
                      <div className="bg-gradient-radial rounded-4 p-4">
                        <div className="row g-3">
                          <div className="col-6">
                            <div className="bg-dark bg-opacity-50 rounded-3 p-3 text-center">
                              <div className="h4 text-primary mb-1 fw-bold">99.8%</div>
                              <div className="small text-muted fw-medium">Accuracy Rate</div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="bg-dark bg-opacity-50 rounded-3 p-3 text-center">
                              <div className="h4 text-primary mb-1 fw-bold">&lt;2s</div>
                              <div className="small text-muted fw-medium">Response Time</div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="bg-dark bg-opacity-50 rounded-3 p-3 text-center">
                              <div className="h4 text-primary mb-1 fw-bold">24/7</div>
                              <div className="small text-muted fw-medium">Availability</div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="bg-dark bg-opacity-50 rounded-3 p-3 text-center">
                              <div className="h4 text-primary mb-1 fw-bold">1000+</div>
                              <div className="small text-muted fw-medium">Food Items</div>
                            </div>
                          </div>
                        </div>
          </div>
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

export default Features;
