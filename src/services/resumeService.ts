import { createSignal } from 'solid-js';
import type { ResumeData } from '../types/resume';
import { getEducationItems } from '../api/education';

// Configuration for enabled/disabled sections
export const sectionConfig = {
  about: true,
  experience: true,
  skills: true,
  education: true,
  projects: false,
  certifications: true,
  volunteering: true
};

// Resume data
const sampleResumeData: ResumeData = {
  basics: {
    name: "Caleb Hopkins",
    label: "Senior Software Engineer",
    email: "chhhopkins@gmail.com",
    phone: "+16082078940",
    summary: "Results-driven Data Engineering professional with extensive experience in ETL pipeline implementation and data warehouse architecture. Demonstrated expertise in abstracting and aggregating source data for analytics and reporting purposes. Known for delivering maintainable software solutions while prioritizing development efficiency. Track record of successfully leading cross-functional teams in implementing enterprise-scale data solutions using modern technologies including dbt, Snowflake, BigQuery, and AWS.",
    location: {
      city: "Chicago",
      region: "IL",
      countryCode: "US"
    },
    profiles: [
      {
        network: "LinkedIn",
        username: "c-hopkins3",
        url: "https://www.linkedin.com/in/c-hopkins3",
        icon: "linkedin"
      }
    ]
  },
  work: [
    {
      company: "Method, a Hitachi Subsidiary",
      position: "Senior Software Engineer",
      website: "",
      startDate: "2022-12",
      endDate: "Present",
      summary: "",
      highlights: [
        "Pitched, Created, Designed, and Implemented Resource Augmented Generation (RAG) AI application to correct and reconcile disparate revisions of resource planning documents for Method's sales and project management teams reducing incidence of double-booked resources by >95%",
        "Designed and implemented Method's comprehensive data warehousing and ecosystem, ensuring robust data management and accessibility",
        "Created a clinical trial outreach data warehousing solution by unifying legacy and current data into a cohesive, extensible model",
        "Led the design and development of a modular, omni-channel digital marketing warehouse utilizing dbt, Fivetran, and Snowflake technologies",
        "Conducted technical screenings for new applicants across various software engineering disciplines, enhancing recruitment effectiveness",
        "Trained interns on technical systems, processes, and company culture, successfully converting multiple interns to full-time positions"
      ]
    },
    {
      company: "American Family Insurance",
      position: "Senior Data Engineer",
      website: "",
      startDate: "2022-01",
      endDate: "2022-12",
      summary: "",
      highlights: [
        "Spearheaded implementation of commercial umbrella claims data warehouse, streamlining data management and reporting capabilities",
        "Optimized high-fault data pipelines from acquired startup through strategic refactoring using dbt and BigQuery technologies",
        "Architected and executed migration to AWS native orchestration solution, reducing maintenance overhead and improving system efficiency",
        "Engineered real-time analytics framework utilizing Python, Spark, and Kafka, achieving a 50% increase in processing speed for insurance claims data"
      ]
    },
    {
      company: "Cognizant",
      position: "Data Engineer",
      website: "",
      startDate: "2021-01",
      endDate: "2021-12",
      summary: "",
      highlights: [
        "Engineered data pipelines to process and analyze over 500 TB of data monthly, enhancing data accessibility and reducing retrieval times by 30% through the use of Hadoop, Spark, and Python scripting",
        "Developed data pipeline test strategy for streaming data, reducing the frequency of data related breaking errors in downstream systems by 90%",
        "Coordinated onboarding of 5 data engineering resources across multiple global geographies to deliver client's new system"
      ]
    },
    {
      company: "Mu Sigma Data Solutions",
      position: "Data Engineer",
      website: "",
      startDate: "2019-06",
      endDate: "2020-11",
      summary: "",
      highlights: [
        "Developed end-to-end data pipelines that decreased data processing time by 50% using tools such as Apache Spark and Hadoop, supporting enhanced business insights for analysis and decision-making",
        "Engineered real-time data ingestion frameworks utilizing Apache Kafka, resulting in a 30% increase in data throughput and facilitating swift analytics capabilities for diverse data sources"
      ]
    }
  ],
  education: [],
  skills: [
    {
      name: "Programming Languages",
      level: "Advanced",
      keywords: ["Python", "Java", "Scala", "Rust", "C", "SQL", "TypeScript", "JavaScript", "UML", "HTML", "MD"]
    },
    {
      name: "Data Engineering",
      level: "Advanced",
      keywords: ["dbt", "Airflow", "Prefect", "BigQuery", "Snowflake", "Databricks", "Azure Data Factory"]
    },
    {
      name: "Software Engineering",
      level: "Advanced",
      keywords: ["Object Oriented Design (OOD)", "Distributed Systems", "Domain Modeling", "Software System Design", "Database Design", "Data Structures", "Algorithms"]
    },
    {
      name: "DevOps & Infrastructure",
      level: "Advanced",
      keywords: ["Docker", "Kubernetes", "Terraform", "Cloud-Specific Infrastructure as Code", "Git", "CI/CD", "Test Design"]
    },
    {
      name: "Soft Skills",
      level: "Advanced",
      keywords: ["Sales Support", "Cross-Functional Work", "Requirements Gathering", "Development Planning", "Agile Development"]
    }
  ],
  certifications: [
    {
      name: "AWS Data Engineer",
      date: "2024",
      issuer: "Amazon Web Services",
      url: ""
    },
    {
      name: "AWS Solutions Architect Professional",
      date: "2024",
      issuer: "Amazon Web Services",
      url: ""
    },
    {
      name: "GCP Data Engineer",
      date: "2023",
      issuer: "Google Cloud",
      url: ""
    },
    {
      name: "AWS DevOps Professional",
      date: "2023",
      issuer: "Amazon Web Services",
      url: ""
    }
  ],
  projects: [],
  volunteering: [
    {
      organization: "Greater Chicago Food Depository",
      position: "Distribution Volunteer",
      startDate: "2022",
      endDate: "Present",
      summary: "I volunteer sporadically with the GCFD, packaging and distributing food donations to eligible recipients.",
      highlights: []
    },
    {
      organization: "AIESEC",
      position: "VP of Outgoing Global Volunteers",
      startDate: "2018",
      endDate: "2019",
      summary: "Coordinated UW-Madison's chapter of AIESEC USA, an organization that creates international volunteering and internship opportunities for young people - aligning each goal with one or more of the UN's Sustainable Development Goals",
      highlights: []
    }
  ]
};

// Create a service to manage resume data
export const createResumeService = () => {
  const [resumeData, setResumeData] = createSignal<ResumeData>({
    ...sampleResumeData,
    education: [] // Start with empty education array
  });

  // Load education data immediately
  getEducationItems()
    .then(educationItems => {
      console.log('Loaded education items:', educationItems);
      setResumeData(prev => ({ ...prev, education: educationItems }));
    })
    .catch(error => {
      console.error('Failed to load education data:', error);
    });

  return {
    resumeData
  };
};

// Export a singleton instance of the service
export const resumeService = createResumeService(); 