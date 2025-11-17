import React from 'react';
import {
  FiGithub,
  FiLinkedin,
  FiTwitter, 
  FiFacebook 
} from 'react-icons/fi';
import profile_img from './prof_img.png';

const Team = () => {
  const member = {
    name: "Yohannis Adamu",
    role: "Lead Developer & AI Engineer",
    image: profile_img,
    bio: "Passionate AI engineer and full-stack developer with expertise in machine learning, computer vision, and mobile app development. Leading the development of HealthSphere AI to revolutionize personal healthcare.",
    skills: ["AI/ML", "Computer Vision", "React Native", "Python", "FastAPI", "Mobile Development"],
    social: {
      github: "https://github.com/Johannes613",
      linkedin: "https://www.linkedin.com/in/yohannis-adamu-1837832b9",
      twitter: "https://x.com/john40336738581?s=21",
      facebook: "https://www.facebook.com/share/162Qps5sq2/?mibextid=wwXIfr"
    }
  };

  return (
    <section id="team" className="py-5 section-padding">
      <div className="container">
        <div className="row text-center mb-5">
          <div className="col-lg-8 mx-auto">
            <h3 className="section-title gradient-text mb-3">
              Meet Our Team
            </h3>
            <p className="section-subtitle">
              The brilliant minds behind HealthSphere AI, dedicated to transforming healthcare through technology
            </p>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            <div className="card card-custom border-0 shadow-lg">
              <div className="card-body p-5">
                <div className="row align-items-center">
                  <div className="col-lg-4 text-center mb-4 mb-lg-0">
                    <div className="position-relative">
                      <div className="bg-gradient-radial rounded-circle p-2 mb-3">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="rounded-circle img-fluid"
                          style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src ={profile_img};
                          }}
                        />
                      </div>
                      <div className="position-absolute top-0 end-0">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                             style={{ width: '40px', height: '40px' }}>
                          <span className="fw-bold">AI</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-8">
                    <h4 className="h3 fw-bold text-white mb-2">{member.name}</h4>
                    <p className="text-primary fw-semibold mb-3 fs-5">{member.role}</p>
                    <p className="text-muted mb-4 fs-5 fw-medium">{member.bio}</p>
                    
                    <div className="mb-4">
                      <h6 className="text-white mb-3 fw-bold fs-5">Technical Skills:</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {member.skills.map((skill, index) => (
                          <span key={index} className="badge bg-success bg-opacity-25 text-success border border-success px-3 py-2 fw-semibold">
                            {skill}
                          </span>
                        ))}
        </div>
      </div>

                    <div>
                      <h6 className="text-white mb-3 fw-bold fs-5">Connect with me:</h6>
                      <div className="d-flex gap-3">
          <a
            href={member.social.github}
                          className="social-icon text-decoration-none"
                          target="_blank" 
                          rel="noopener noreferrer"
          >
                          <div className="bg-dark bg-opacity-50 rounded-circle d-flex align-items-center justify-content-center p-3"
                               style={{ width: '50px', height: '50px' }}>
                            <FiGithub className="text-white fs-5" />
                          </div>
          </a>
                        
          <a
            href={member.social.linkedin}
                          className="social-icon text-decoration-none"
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <div className="bg-dark bg-opacity-50 rounded-circle d-flex align-items-center justify-content-center p-3"
                               style={{ width: '50px', height: '50px' }}>
                            <FiLinkedin className="text-white fs-5" />
                          </div>
                        </a>
                        
                        <a 
                          href={member.social.twitter}
                          className="social-icon text-decoration-none"
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <div className="bg-dark bg-opacity-50 rounded-circle d-flex align-items-center justify-content-center p-3"
                               style={{ width: '50px', height: '50px' }}>
                            <FiTwitter className="text-white fs-5" />
                          </div>
                        </a>
                        
                        <a 
                          href={member.social.facebook}
                          className="social-icon text-decoration-none"
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <div className="bg-dark bg-opacity-50 rounded-circle d-flex align-items-center justify-content-center p-3"
                               style={{ width: '50px', height: '50px' }}>
                            <FiFacebook className="text-white fs-5" />
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
      </div>
    </div>
        </div>
          </div>
        </div>

        {/* Vision Statement */}
        <div className="row mt-5 pt-5">
          <div className="col-lg-10 mx-auto">
            <div className="card card-custom border-0 shadow-lg">
              <div className="card-body p-5 text-center">
                <div className="row align-items-center">
                  <div className="col-lg-8 mx-auto">
                    <h4 className="h3 fw-bold text-white mb-4">
                      Our Vision
                    </h4>
                    <p className="text-muted fs-5 mb-4 fw-medium">
                      To democratize healthcare by making AI-powered health insights accessible to everyone. 
                      We believe that technology should enhance human health, not replace it.
                    </p>
                    <div className="d-flex flex-wrap justify-content-center gap-3">
                      <div className="bg-dark bg-opacity-50 rounded-3 p-3 text-center">
                        <div className="h4 text-primary mb-1 fw-bold">Innovation</div>
                        <div className="small text-muted fw-medium">Cutting-edge AI</div>
                      </div>
                      <div className="bg-dark bg-opacity-50 rounded-3 p-3 text-center">
                        <div className="h4 text-primary mb-1 fw-bold">Accessibility</div>
                        <div className="small text-muted fw-medium">For everyone</div>
                      </div>
                      <div className="bg-dark bg-opacity-50 rounded-3 p-3 text-center">
                        <div className="h4 text-primary mb-1 fw-bold">Impact</div>
                        <div className="small text-muted fw-medium">Real results</div>
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

export default Team;
