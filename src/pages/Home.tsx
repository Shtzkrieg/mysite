import { Component } from 'solid-js';
import { resumeService, sectionConfig } from '../services/resumeService';
import TableOfContents from '../components/TableOfContents';
import '../styles/resume.css';

const Home: Component = () => {
  const { resumeData } = resumeService;
  // Safely access data to avoid type errors
  const basics = resumeData().basics;
  const work = resumeData().work || [];
  const education = resumeData().education || [];
  const skills = resumeData().skills || [];
  const projects = resumeData().projects || [];
  const certifications = resumeData().certifications || [];
  const volunteering = resumeData().volunteering || [];
  
  const sections = [
    ...(sectionConfig.about ? [{ id: 'about', title: 'About' }] : []),
    ...(sectionConfig.experience ? [{ id: 'experience', title: 'Experience' }] : []),
    ...(sectionConfig.skills ? [{ id: 'skills', title: 'Skills' }] : []),
    ...(sectionConfig.education ? [{ id: 'education', title: 'Education' }] : []),
    ...(sectionConfig.projects ? [{ id: 'projects', title: 'Projects' }] : []),
    ...(sectionConfig.certifications && certifications.length > 0 ? [{ id: 'certifications', title: 'Certifications' }] : []),
    ...(sectionConfig.volunteering && volunteering.length > 0 ? [{ id: 'volunteering', title: 'Volunteering' }] : []),
  ];
  
  return (
    <div class="resume-container">
      <div class="resume-layout">
        {/* Sidebar */}
        <div class="resume-sidebar">
          <div class="toc-container">
            <TableOfContents sections={sections} />
          </div>
        </div>

        {/* Main Content */}
        <div class="resume-content">
          <div class="resume-wrapper">
            {/* Header/Intro Section */}
            {sectionConfig.about && (
              <header id="about" class="resume-card">
                <h1 class="resume-name">{basics.name}</h1>
                <h2 class="resume-title">{basics.label}</h2>
                
                <div class="contact-info">
                  <div class="contact-item">
                    <span class="contact-label">Email:</span> {basics.email}
                  </div>
                  {basics.phone && (
                    <div class="contact-item">
                      <span class="contact-label">Phone:</span> {basics.phone}
                    </div>
                  )}
                  {basics.location && (
                    <div class="contact-item">
                      <span class="contact-label">Location:</span> {basics.location?.city}
                      {basics.location?.region && `, ${basics.location?.region}`}
                    </div>
                  )}
                </div>
                
                <div class="profile-links">
                  {basics.profiles.map(profile => (
                    <a href={profile.url} target="_blank" rel="noopener noreferrer" 
                       class="profile-link">
                      {profile.network}
                    </a>
                  ))}
                </div>
                
                <p class="summary">{basics.summary}</p>
              </header>
            )}
            
            {/* Experience Section */}
            {sectionConfig.experience && (
              <section id="experience" class="resume-card">
                <h2 class="section-title">Work Experience</h2>
                
                <div class="resume-items">
                  {work.map(job => (
                    <div class="resume-item">
                      <div class="resume-header">
                        <h3 class="item-title">{job.position}</h3>
                        <span class="item-date">{job.startDate} - {job.endDate || 'Present'}</span>
                      </div>
                      <div class="company-name">{job.company}</div>
                      <p class="item-summary">{job.summary}</p>
                      <ul class="item-bullets">
                        {job.highlights.map(highlight => (
                          <li>{highlight}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* Skills Section */}
            {sectionConfig.skills && (
              <section id="skills" class="resume-card">
                <h2 class="section-title">Skills</h2>
                
                <div class="resume-items">
                  {skills.map(skill => (
                    <div class="resume-item">
                      <h3 class="item-title">{skill.name}</h3>
                      <div class="skill-tags">
                        {skill.keywords.map(keyword => (
                          <span class="skill-tag">{keyword}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* Education Section */}
            {sectionConfig.education && (
              <section id="education" class="resume-card">
                <h2 class="section-title">Education</h2>
                
                <div class="resume-items">
                  {education.map(edu => (
                    <div class="resume-item">
                      <div class="resume-header">
                        <h3 class="item-title">{edu.institution}</h3>
                        <span class="item-date">{edu.startDate} - {edu.endDate || 'Present'}</span>
                      </div>
                      <div class="degree-info">{edu.studyType} in {edu.area}</div>
                      {edu.gpa && <div class="gpa">GPA: {edu.gpa}</div>}
                      {edu.courses && (
                        <div class="courses-container">
                          <h4 class="courses-title">Relevant Courses:</h4>
                          <div class="skill-tags">
                            {edu.courses.map(course => (
                              <span class="skill-tag">{course}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects Section */}
            {sectionConfig.projects && (
              <section id="projects" class="resume-card">
                <h2 class="section-title">Projects</h2>
                
                <div class="resume-items">
                  {projects.map(project => (
                    <div class="resume-item">
                      <div class="resume-header">
                        <h3 class="item-title">{project.name}</h3>
                        <div class="project-links">
                          {project.url && (
                            <a href={project.url} target="_blank" rel="noopener noreferrer" 
                               class="project-link">Live Demo</a>
                          )}
                          {project.github && (
                            <a href={project.github} target="_blank" rel="noopener noreferrer" 
                               class="project-link">GitHub</a>
                          )}
                        </div>
                      </div>
                      <p class="item-summary">{project.description}</p>
                      <ul class="item-bullets">
                        {project.highlights.map(highlight => (
                          <li>{highlight}</li>
                        ))}
                      </ul>
                      <div class="skill-tags">
                        {project.keywords.map(keyword => (
                          <span class="skill-tag">{keyword}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* Certifications Section */}
            {sectionConfig.certifications && certifications.length > 0 && (
              <section id="certifications" class="resume-card">
                <h2 class="section-title">Certifications</h2>
                
                <div class="resume-items">
                  {certifications.map(cert => (
                    <div class="resume-item">
                      <h3 class="item-title">{cert.name}</h3>
                      <div class="cert-info">
                        {cert.issuer} • <span class="item-date">{cert.date}</span>
                        {cert.url && (
                          <span> • <a href={cert.url} target="_blank" rel="noopener noreferrer" 
                                     class="project-link">View Certificate</a></span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Volunteering Section */}
            {sectionConfig.volunteering && volunteering.length > 0 && (
              <section id="volunteering" class="resume-card">
                <h2 class="section-title">Volunteering</h2>
                
                <div class="resume-items">
                  {volunteering.map(vol => (
                    <div class="resume-item">
                      <div class="resume-header">
                        <h3 class="item-title">{vol.position}</h3>
                        <span class="item-date">{vol.startDate} - {vol.endDate || 'Present'}</span>
                      </div>
                      <div class="company-name">{vol.organization}</div>
                      <p class="item-summary">{vol.summary}</p>
                      {vol.highlights.length > 0 && (
                        <ul class="item-bullets">
                          {vol.highlights.map(highlight => (
                            <li>{highlight}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 