"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-data";
import {
  FileText,
  Printer,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Eye,
  Sliders,
  Briefcase,
  GraduationCap,
  Code2,
  FolderGit2,
  Award,
  User,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Upload,
  Bot,
  Target,
  Wand2,
  Loader2,
  Info,
  CheckCircle2,
  AlertCircle,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Zap,
  ArrowUp,
  ArrowDown,
  FileCheck,
  CheckSquare,
  Layout,
  Settings2,
  Compass,
} from "lucide-react";
import confetti from "canvas-confetti";
import { CountryPhoneInput } from "@/components/CountryPhoneInput";
import {
  ROLE_PRESETS,
  ACTION_VERBS,
  smartPolishBullet,
  smartGenerateSummary,
  analyzeAtsKeywordMatch,
  smartSynthesizeFullResume,
  WizardResumeInput,
  RolePreset,
} from "@/lib/ai-resume-helper";

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
  coursework: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  techStack: string;
  link: string;
  github: string;
  bullets: string[];
}

export interface ResumeData {
  personal: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
    summary: string;
  };
  education: EducationItem[];
  skills: {
    languages: string;
    frameworks: string;
    developerTools: string;
    coreConcepts: string;
  };
  experience: ExperienceItem[];
  projects: ProjectItem[];
  achievements: string[];
  certifications: string[];
}

const SAMPLE_PROFILES: Record<string, { label: string; icon: string; data: ResumeData }> = {
  cs_sde: {
    label: "Full Stack / SDE",
    icon: "💻",
    data: {
      personal: {
        fullName: "Alex Chen",
        title: "Software Engineering Student",
        email: "alex.chen@university.edu",
        phone: "+1 (555) 234-5678",
        location: "Boston, MA",
        linkedin: "linkedin.com/in/alexchen-tech",
        github: "github.com/alexchen-dev",
        portfolio: "alexchen.dev",
        summary:
          "Passionate Computer Science undergraduate with hands-on experience in full-stack web development, distributed systems, and cloud architectures. Proven track record of shipping production-grade applications and competing in national collegiate hackathons.",
      },
      education: [
        {
          id: "edu-1",
          institution: "State University of Technology",
          degree: "Bachelor of Science in Computer Science & Engineering",
          location: "Boston, MA",
          startDate: "2022",
          endDate: "2026 (Expected)",
          gpa: "CGPA: 9.24 / 10.00 (First Class with Distinction)",
          coursework: "Data Structures & Algorithms, Operating Systems, Database Systems, Computer Networks, Distributed Computing",
        },
      ],
      skills: {
        languages: "TypeScript, JavaScript, Python, C++, Java, SQL (PostgreSQL, MySQL)",
        frameworks: "React, Next.js, Node.js, Express, Tailwind CSS, FastAPI, Prisma ORM",
        developerTools: "Git, GitHub Actions, Docker, AWS (S3, Lambda), Linux, Redis, Postman",
        coreConcepts: "Object-Oriented Design, RESTful APIs, Microservices, CI/CD, Agile/Scrum",
      },
      experience: [
        {
          id: "exp-1",
          role: "Software Engineering Intern",
          company: "Acme Cloud Technologies",
          location: "Boston, MA",
          startDate: "Jun 2024",
          endDate: "Aug 2024",
          bullets: [
            "Architected and deployed microservices in Node.js & TypeScript, reducing server response times by 32% for 45,000+ daily active users.",
            "Engineered automated REST API integration tests using Jest and Supertest, boosting code test coverage from 64% to 91%.",
            "Collaborated with senior engineers to migrate monolithic backend services to containerized Docker workflows on AWS ECS.",
          ],
        },
      ],
      projects: [
        {
          id: "proj-1",
          title: "DevSprint — Collaborative Real-Time Code & Workspace Editor",
          techStack: "Next.js 14, TypeScript, WebSockets (Socket.io), Redis, Monaco Editor, Tailwind CSS",
          link: "https://devsprint.demo",
          github: "https://github.com/alexchen-dev/devsprint",
          bullets: [
            "Constructed a multi-user collaborative code editor with real-time operational transformation supporting simultaneous editing across 20+ tabs.",
            "Designed low-latency Redis pub/sub messaging queues resulting in sub-20ms message synchronization across regional server clusters.",
          ],
        },
        {
          id: "proj-2",
          title: "SmartCampus — AI Lecture Transcriber & Note Synthesizer",
          techStack: "Python, FastAPI, OpenAI Whisper, LangChain, React",
          link: "https://smartcampus.demo",
          github: "https://github.com/alexchen-dev/smart-campus",
          bullets: [
            "Developed an automated pipeline extracting timestamps, key takeaways, and flashcards from recorded lecture MP4 audio with 98% accuracy.",
            "Integrated vector embeddings search using FAISS, allowing students to query textbook chapters via natural language prompts.",
          ],
        },
      ],
      achievements: [
        "1st Place Winner — University Hackathon 2024 (Won $2,500 grand prize among 60+ collegiate teams)",
        "Dean's Honor List for 5 consecutive semesters for maintaining academic standing above 9.0/10.0",
        "Top 5% Global Rank in LeetCode Weekly Contests (Knight Rating: 1950+ with 450+ solved problems)",
      ],
      certifications: [
        "AWS Certified Cloud Practitioner — Amazon Web Services (2024)",
        "Meta Frontend Developer Professional Certificate — Coursera (2023)",
      ],
    },
  },
  data_science: {
    label: "Data Science & AI/ML",
    icon: "🤖",
    data: {
      personal: {
        fullName: "Priya Sharma",
        title: "Data Science & Machine Learning Student",
        email: "priya.sharma@college.edu",
        phone: "+1 (555) 987-6543",
        location: "San Jose, CA",
        linkedin: "linkedin.com/in/priyasharma-data",
        github: "github.com/priyasharma-ml",
        portfolio: "priyasharma.ai",
        summary:
          "Detail-oriented undergraduate data science student with extensive experience in predictive modeling, deep learning, NLP, and large-scale data visualization. Proven ability to turn complex datasets into actionable mathematical insights.",
      },
      education: [
        {
          id: "edu-1",
          institution: "University Institute of Science & Technology",
          degree: "Bachelor of Technology in Artificial Intelligence & Data Science",
          location: "San Jose, CA",
          startDate: "2022",
          endDate: "2026",
          gpa: "CGPA: 9.45 / 10.00",
          coursework: "Probability & Statistics, Linear Algebra, Machine Learning, Deep Learning, Big Data Analytics, NLP",
        },
      ],
      skills: {
        languages: "Python (Pandas, NumPy, Scipy, Polars), SQL, R, Julia, C++",
        frameworks: "PyTorch, TensorFlow, Scikit-Learn, HuggingFace Transformers, OpenCV, XGBoost, Streamlit",
        developerTools: "Git, MLflow, Weights & Biases, Docker, Jupyter, Apache Spark, Tableau, Google BigQuery",
        coreConcepts: "Computer Vision, Transfer Learning, Statistical Hypothesis Testing, Feature Engineering",
      },
      experience: [
        {
          id: "exp-1",
          role: "Data Science & ML Research Intern",
          company: "Cognitive AI Labs",
          location: "San Jose, CA",
          startDate: "May 2024",
          endDate: "Aug 2024",
          bullets: [
            "Fine-tuned transformer models on domain-specific medical research abstracts, achieving a 23% BLEU score improvement.",
            "Constructed end-to-end data cleaning pipelines processing 2M+ tabular records with Python and DuckDB, reducing preprocessing time by 60%.",
            "Authored research paper on lightweight model compression accepted for presentation at student conference workshop.",
          ],
        },
      ],
      projects: [
        {
          id: "proj-1",
          title: "VisionCare — Automated Diabetic Retinopathy Detection",
          techStack: "PyTorch, ResNet-50, EfficientNet, FastAI, Streamlit",
          link: "https://visioncare.ai",
          github: "https://github.com/priyasharma-ml/visioncare",
          bullets: [
            "Trained an ensemble convolutional neural network on 35,000+ retinal fundus images, achieving 94.8% test accuracy and 0.96 ROC-AUC score.",
            "Implemented Grad-CAM saliency heatmaps allowing clinicians to interpret diagnostic decisions made by deep neural networks.",
          ],
        },
        {
          id: "proj-2",
          title: "FinPulse — Real-Time Financial Sentiment & Trend Forecaster",
          techStack: "Python, HuggingFace FinBERT, Kafka, Streamlit, Plotly",
          link: "https://finpulse.demo",
          github: "https://github.com/priyasharma-ml/finpulse",
          bullets: [
            "Built streaming pipeline analyzing 10,000+ daily financial news articles and earnings call transcripts for market sentiment classification.",
            "Created interactive dashboard displaying live moving averages and sentiment correlations with stock price fluctuations.",
          ],
        },
      ],
      achievements: [
        "Kaggle Competitions Master / Top 2% Global Contributor with 2 Silver Medals",
        "National Science Foundation Collegiate Research Scholar Fellow (2024)",
      ],
      certifications: [
        "DeepLearning.AI Deep Learning Specialization — Andrew Ng",
        "Google Cloud Certified Professional Data Engineer",
      ],
    },
  },
  cloud_devops: {
    label: "Cloud & DevOps",
    icon: "☁️",
    data: {
      personal: {
        fullName: "Marcus Vance",
        title: "Cloud Infrastructure & DevOps Engineer",
        email: "marcus.vance@tech.edu",
        phone: "+1 (555) 345-6789",
        location: "Seattle, WA",
        linkedin: "linkedin.com/in/marcus-vance-cloud",
        github: "github.com/marcusvance",
        portfolio: "marcuscloud.dev",
        summary:
          "DevOps and Cloud infrastructure undergraduate passionate about site reliability, zero-downtime deployments, and infrastructure-as-code. Experienced in provisioning resilient containerized clusters across AWS and GCP.",
      },
      education: [
        {
          id: "edu-1",
          institution: "Pacific Northwest University",
          degree: "Bachelor of Science in Information Technology & Cloud Systems",
          location: "Seattle, WA",
          startDate: "2022",
          endDate: "2026",
          gpa: "GPA: 3.88 / 4.00",
          coursework: "Cloud Architecture, Network Security, Linux System Administration, Distributed Databases, CI/CD Pipelines",
        },
      ],
      skills: {
        languages: "Python, Bash/Shell Scripting, Go, YAML, HCL (Terraform), SQL",
        frameworks: "Docker, Kubernetes, Helm, Terraform, Ansible, Prometheus, Grafana",
        developerTools: "AWS (EKS, S3, RDS, IAM), GCP, GitHub Actions, GitLab CI, Linux, Nginx",
        coreConcepts: "Infrastructure as Code (IaC), GitOps, Zero Trust Security, Chaos Engineering",
      },
      experience: [
        {
          id: "exp-1",
          role: "Cloud Engineering Intern",
          company: "Nexus Infrastructure Inc.",
          location: "Seattle, WA",
          startDate: "Jun 2024",
          endDate: "Aug 2024",
          bullets: [
            "Automated multi-stage Kubernetes cluster provisioning using Terraform and Helm, cutting environment setup time from 4 hours to 12 minutes.",
            "Deployed Prometheus & Grafana alerting dashboards monitoring 50+ microservices, reducing Mean Time to Detection (MTTD) by 45%.",
            "Implemented security scanning in GitHub Actions with Trivy and SonarQube, remediating 28 container vulnerabilities before production.",
          ],
        },
      ],
      projects: [
        {
          id: "proj-1",
          title: "KubeGuard — Automated Kubernetes Health & Cost Optimizer",
          techStack: "Go, Kubernetes Client-go, Prometheus, Docker, AWS EKS",
          link: "https://kubeguard.io",
          github: "https://github.com/marcusvance/kubeguard",
          bullets: [
            "Engineered a lightweight Kubernetes controller in Go that detects over-provisioned pod CPU/memory and triggers automated rightsizing.",
            "Demonstrated an average 38% AWS cloud compute cost reduction in mock staging cluster benchmarks.",
          ],
        },
      ],
      achievements: [
        "Certified Kubernetes Administrator (CKA) — Linux Foundation (2024)",
        "1st Place in Regional Collegiate Cyber Defense & Infra Competition (2024)",
      ],
      certifications: [
        "AWS Certified Solutions Architect – Associate (2024)",
        "HashiCorp Certified: Terraform Associate (003)",
      ],
    },
  },
  product_business: {
    label: "Product & Business",
    icon: "📊",
    data: {
      personal: {
        fullName: "Sarah Jenkins",
        title: "Product Management & Business Analyst",
        email: "sarah.jenkins@business.edu",
        phone: "+1 (555) 456-7890",
        location: "New York, NY",
        linkedin: "linkedin.com/in/sarah-jenkins-pm",
        github: "github.com/sarahjenkins",
        portfolio: "sarahjenkins.co",
        summary:
          "Strategic Product Management student with strong cross-functional communication, customer empathy, and data-driven product roadmap planning skills. Experienced in agile sprint rituals, UX wireframing, and SQL cohort analysis.",
      },
      education: [
        {
          id: "edu-1",
          institution: "New York Business Institute",
          degree: "Bachelor of Business Administration & Management Information Systems",
          location: "New York, NY",
          startDate: "2022",
          endDate: "2026",
          gpa: "GPA: 3.92 / 4.00 (Summa Cum Laude)",
          coursework: "Product Strategy, Data Analytics in Business, Financial Modeling, Human-Computer Interaction, Agile Project Management",
        },
      ],
      skills: {
        languages: "SQL, Python for Analytics, HTML/CSS, R",
        frameworks: "Figma, Jira, Confluence, Linear, Notion, Mixpanel, Google Analytics 4",
        developerTools: "Tableau, PowerBI, Excel (Advanced Modeling), Postman, Miro, Trello",
        coreConcepts: "A/B Testing, User Research, PRD Authoring, Sprint Planning, Funnel Optimization",
      },
      experience: [
        {
          id: "exp-1",
          role: "Associate Product Manager Intern",
          company: "VentureScale HealthTech",
          location: "New York, NY",
          startDate: "Jun 2024",
          endDate: "Aug 2024",
          bullets: [
            "Authored 6 comprehensive Product Requirement Documents (PRDs) for a new patient onboarding workflow, driving a 28% increase in activation.",
            "Conducted 35+ qualitative user interviews and synthesized actionable feedback into sprint backlog priorities in Jira.",
            "Partnered with engineering and design to run A/B landing page experiments that improved sign-up conversion by 18.5%.",
          ],
        },
      ],
      projects: [
        {
          id: "proj-1",
          title: "CampuSphere — Student Peer Mentorship Marketplace",
          techStack: "Figma, React, Supabase, Mixpanel, Tailwind CSS",
          link: "https://campusphere.app",
          github: "https://github.com/sarahjenkins/campusphere",
          bullets: [
            "Conducted discovery interviews with 250+ university students to identify core pain points in academic tutoring accessibility.",
            "Prototyped complete interactive design system in Figma and validated product-market fit with a 4.8/5 user satisfaction score.",
          ],
        },
      ],
      achievements: [
        "Winner — National Collegiate Case Competition 2024 (Ranked 1st of 48 teams)",
        "President of Undergraduate Product Management & Tech Club (300+ active members)",
      ],
      certifications: [
        "Professional Scrum Product Owner (PSPO I) — Scrum.org",
        "Google Data Analytics Professional Certificate",
      ],
    },
  },
};

type SectionKey = "personal" | "education" | "skills" | "experience" | "projects" | "achievements";

export default function ResumeBuilderPage() {
  const tool = TOOLS.find((t) => t.id === "resume-builder")!;

  // Resume State
  const [resume, setResume] = useState<ResumeData>(SAMPLE_PROFILES.cs_sde.data);

  // Settings & Visual Controls
  const [fontFamily, setFontFamily] = useState<"sans" | "serif" | "mono">("sans");
  const [accentColor, setAccentColor] = useState<string>("indigo");
  const [layoutStyle, setLayoutStyle] = useState<"classic" | "modern" | "compact">("classic");
  const [showSummary, setShowSummary] = useState<boolean>(true);
  const [showCoursework, setShowCoursework] = useState<boolean>(true);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Editor Navigation: Step-by-Step vs Accordion
  const [editorMode, setEditorMode] = useState<"tabs" | "accordion">("tabs");
  const [currentStep, setCurrentStep] = useState<SectionKey>("personal");

  // Accordion Expand/Collapse Map
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    personal: true,
    education: true,
    skills: true,
    experience: true,
    projects: true,
    achievements: true,
  });

  // AI Assistant Hub State
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [aiActiveTab, setAiActiveTab] = useState<"wizard" | "smart_roles" | "bullet_builder" | "jd_scanner">("wizard");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiStatusMsg, setAiStatusMsg] = useState<string>("");
  const [jobDescriptionText, setJobDescriptionText] = useState<string>("");
  const [rawBulletInput, setRawBulletInput] = useState<string>("");
  const [generatedBulletResult, setGeneratedBulletResult] = useState<string>("");
  const [atsAnalysis, setAtsAnalysis] = useState<{
    score: number;
    foundKeywords: string[];
    missingKeywords: string[];
  } | null>(null);

  // AI Step-by-Step Wizard State & Validation
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [wizardAttemptedNext, setWizardAttemptedNext] = useState<boolean>(false);
  const [wizardData, setWizardData] = useState<WizardResumeInput>({
    fullName: "",
    targetRole: "Software Engineering & Full Stack",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    university: "",
    degree: "",
    graduationYear: "",
    gpa: "",
    coursework: "",
    languages: "",
    frameworks: "",
    tools: "",
    hasExperience: false,
    company: "",
    experienceRole: "",
    experienceDates: "",
    experienceNotes: "",
    project1Title: "",
    project1Tech: "",
    project1Notes: "",
    project2Title: "",
    project2Tech: "",
    project2Notes: "",
    achievements: "",
  });

  const printRef = useRef<HTMLDivElement>(null);

  // Real-time Field Validation Helpers
  const isValidEmail = (email: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
  const isValidPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15 && /^[0-9+() -]+$/.test(phone.trim());
  };
  const isValidLocation = (location: string) => location.trim().length >= 2;

  // Wizard Validation Per Step
  const isStep1Valid = Boolean(
    wizardData.fullName.trim().length >= 2 &&
    wizardData.targetRole.trim().length >= 2 &&
    isValidEmail(wizardData.email) &&
    isValidPhone(wizardData.phone) &&
    isValidLocation(wizardData.location)
  );

  const isStep2Valid = Boolean(
    wizardData.university.trim() &&
    wizardData.degree.trim() &&
    wizardData.graduationYear.trim() &&
    wizardData.gpa?.trim()
  );

  const isStep3Valid = Boolean(
    wizardData.languages.trim() &&
    wizardData.frameworks.trim() &&
    wizardData.tools.trim()
  );

  const isStep4Valid =
    !wizardData.hasExperience ||
    Boolean(
      wizardData.company?.trim() &&
      wizardData.experienceRole?.trim() &&
      wizardData.experienceNotes?.trim()
    );

  const isStep5Valid = Boolean(
    wizardData.project1Title?.trim() &&
    wizardData.project1Tech?.trim() &&
    wizardData.project1Notes?.trim()
  );

  const isStep6Valid = Boolean(wizardData.achievements?.trim());

  const isCurrentWizardStepValid =
    wizardStep === 1
      ? isStep1Valid
      : wizardStep === 2
      ? isStep2Valid
      : wizardStep === 3
      ? isStep3Valid
      : wizardStep === 4
      ? isStep4Valid
      : wizardStep === 5
      ? isStep5Valid
      : isStep6Valid;

  // Wizard Step Completion Stats & Missing Fields tracking
  const wizardStepStats = useMemo(() => {
    switch (wizardStep) {
      case 1: {
        const missing: string[] = [];
        if (!wizardData.fullName.trim() || wizardData.fullName.trim().length < 2) missing.push("Full Name");
        if (!wizardData.targetRole.trim() || wizardData.targetRole.trim().length < 2) missing.push("Target Role Title");
        if (!wizardData.email.trim() || !isValidEmail(wizardData.email)) {
          missing.push(wizardData.email.trim() ? "Valid Email (e.g. name@domain.com)" : "Email Address");
        }
        if (!wizardData.phone.trim() || !isValidPhone(wizardData.phone)) {
          missing.push(wizardData.phone.trim() ? "Valid Phone (digits only, min 7 digits)" : "Phone Number");
        }
        if (!wizardData.location.trim() || !isValidLocation(wizardData.location)) missing.push("Location");
        const total = 5;
        const filled = total - missing.length;
        return { filled, total, isValid: isStep1Valid, missing };
      }
      case 2: {
        const missing: string[] = [];
        if (!wizardData.university.trim()) missing.push("College / University");
        if (!wizardData.degree.trim()) missing.push("Degree & Major");
        if (!wizardData.graduationYear.trim()) missing.push("Graduation Year");
        if (!wizardData.gpa?.trim()) missing.push("GPA / CGPA");
        const total = 4;
        const filled = total - missing.length;
        return { filled, total, isValid: isStep2Valid, missing };
      }
      case 3: {
        const missing: string[] = [];
        if (!wizardData.languages.trim()) missing.push("Programming Languages");
        if (!wizardData.frameworks.trim()) missing.push("Frameworks & Libraries");
        if (!wizardData.tools.trim()) missing.push("Developer Tools & Cloud");
        const total = 3;
        const filled = total - missing.length;
        return { filled, total, isValid: isStep3Valid, missing };
      }
      case 4: {
        if (!wizardData.hasExperience) {
          return { filled: 1, total: 1, isValid: true, missing: [] };
        }
        const missing: string[] = [];
        if (!wizardData.company?.trim()) missing.push("Company Name");
        if (!wizardData.experienceRole?.trim()) missing.push("Job Role Title");
        if (!wizardData.experienceNotes?.trim()) missing.push("Key Deliverables / Notes");
        const total = 3;
        const filled = total - missing.length;
        return { filled, total, isValid: isStep4Valid, missing };
      }
      case 5: {
        const missing: string[] = [];
        if (!wizardData.project1Title?.trim()) missing.push("Project #1 Title");
        if (!wizardData.project1Tech?.trim()) missing.push("Project #1 Tech Stack");
        if (!wizardData.project1Notes?.trim()) missing.push("Project #1 Outcome / Notes");
        const total = 3;
        const filled = total - missing.length;
        return { filled, total, isValid: isStep5Valid, missing };
      }
      case 6: {
        const missing: string[] = [];
        if (!wizardData.achievements?.trim()) missing.push("Honors / Achievements");
        const total = 1;
        const filled = total - missing.length;
        return { filled, total, isValid: isStep6Valid, missing };
      }
      default:
        return { filled: 0, total: 1, isValid: false, missing: [] };
    }
  }, [wizardStep, wizardData, isStep1Valid, isStep2Valid, isStep3Valid, isStep4Valid, isStep5Valid, isStep6Valid]);

  // Steps definition for step-by-step mode
  const STEPS: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { key: "personal", label: "Personal Info", icon: User },
    { key: "education", label: "Education", icon: GraduationCap, count: resume.education.length },
    { key: "skills", label: "Skills", icon: Code2 },
    { key: "experience", label: "Experience", icon: Briefcase, count: resume.experience.length },
    { key: "projects", label: "Projects", icon: FolderGit2, count: resume.projects.length },
    { key: "achievements", label: "Honors & Certs", icon: Award, count: resume.achievements.length },
  ];

  // ATS Optimizer & Preview Highlighting State
  const [showAtsOptimizer, setShowAtsOptimizer] = useState<boolean>(false);
  const [highlightedAtsSection, setHighlightedAtsSection] = useState<string | null>(null);

  // Calculate ATS Quality Score & Checklist dynamically
  const atsHealth = useMemo(() => {
    let score = 0;
    const checks: {
      id: string;
      section: SectionKey | "metrics" | "verbs";
      title: string;
      description: string;
      pass: boolean;
      points: number;
      actionLabel?: string;
    }[] = [];

    // 1. Contact Info check (20 pts)
    const hasName = Boolean(resume.personal.fullName.trim());
    const hasEmail = Boolean(resume.personal.email.trim());
    const hasPhone = Boolean(resume.personal.phone.trim());
    const contactPass = hasName && hasEmail && hasPhone;
    checks.push({
      id: "contact",
      section: "personal",
      title: "Contact Information",
      description: "Verified Full Name, Email, and Phone number present.",
      pass: contactPass,
      points: 20,
      actionLabel: "Edit Contact",
    });
    if (contactPass) score += 20;

    // 2. Professional Title & Links (10 pts)
    const titlePass = Boolean(resume.personal.title.trim());
    const hasSocialLink = Boolean(
      resume.personal.linkedin.trim() ||
      resume.personal.github.trim() ||
      resume.personal.portfolio.trim()
    );
    const headerPass = titlePass && hasSocialLink;
    checks.push({
      id: "header",
      section: "personal",
      title: "Role Title & Profile Links",
      description: "Target job discipline and at least one LinkedIn or GitHub link.",
      pass: headerPass,
      points: 10,
      actionLabel: "Add Links",
    });
    if (headerPass) score += 10;

    // 3. Education item added (15 pts)
    const eduPass =
      resume.education.length > 0 &&
      Boolean(resume.education[0].institution.trim() && resume.education[0].degree.trim());
    checks.push({
      id: "education",
      section: "education",
      title: "University, Major & GPA",
      description: "College name, degree title, graduation year, and GPA/CGPA.",
      pass: eduPass,
      points: 15,
      actionLabel: "Edit Education",
    });
    if (eduPass) score += 15;

    // 4. Skills populated (20 pts)
    const skillsPass = Boolean(
      resume.skills.languages.trim() &&
        (resume.skills.frameworks.trim() || resume.skills.developerTools.trim())
    );
    checks.push({
      id: "skills",
      section: "skills",
      title: "Categorized Technical Skills",
      description: "Programming languages, frameworks, and developer tools/cloud.",
      pass: skillsPass,
      points: 20,
      actionLabel: "Add Skills",
    });
    if (skillsPass) score += 20;

    // 5. Quantifiable metrics in bullets (15 pts)
    const allBullets = [
      ...resume.experience.flatMap((e) => e.bullets),
      ...resume.projects.flatMap((p) => p.bullets),
    ];
    const hasMetrics = allBullets.some((b) => /\d+%|\$\d+|\d+\+|\b\d+\b/.test(b));
    checks.push({
      id: "metrics",
      section: "projects",
      title: "Measurable Impact & Metrics",
      description: "Bullets containing % gains, speedups, or user scales (e.g. 'reduced latency by 32%').",
      pass: hasMetrics,
      points: 15,
      actionLabel: "Add Metrics",
    });
    if (hasMetrics) score += 15;

    // 6. Action verbs used in bullets (10 pts)
    const allVerbsList = Object.values(ACTION_VERBS).flat().map((v) => v.toLowerCase());
    const hasActionVerbs = allBullets.some((b) =>
      allVerbsList.some((v) => b.toLowerCase().startsWith(v))
    );
    checks.push({
      id: "verbs",
      section: "experience",
      title: "Strong Action Verbs",
      description: "Bullets starting with verbs (Architected, Engineered, Optimized, Spearheaded).",
      pass: hasActionVerbs,
      points: 10,
      actionLabel: "Add Verbs",
    });
    if (hasActionVerbs) score += 10;

    // 7. Projects or Experience present (10 pts)
    const expProjPass = resume.experience.length > 0 || resume.projects.length > 0;
    checks.push({
      id: "projects",
      section: "projects",
      title: "Technical Projects & Experience",
      description: "At least one production-grade technical project or internship.",
      pass: expProjPass,
      points: 10,
      actionLabel: "Add Projects",
    });
    if (expProjPass) score += 10;

    return { score: Math.min(score, 100), checks };
  }, [resume]);

  // 1-Click Auto-Boost ATS Score to 100
  const handleAutoBoostScore = () => {
    setResume((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as ResumeData;
      if (!next.personal.fullName.trim()) next.personal.fullName = "Alex Chen";
      if (!next.personal.title.trim()) next.personal.title = "Software Engineering & Full Stack Student";
      if (!next.personal.email.trim()) next.personal.email = "alex.chen@university.edu";
      if (!next.personal.phone.trim()) next.personal.phone = "+1 (555) 234-5678";
      if (!next.personal.location.trim()) next.personal.location = "Boston, MA";
      if (!next.personal.linkedin.trim()) next.personal.linkedin = "linkedin.com/in/alexchen-tech";
      if (!next.personal.github.trim()) next.personal.github = "github.com/alexchen-dev";
      if (!next.personal.portfolio.trim()) next.personal.portfolio = "alexchen.dev";

      if (!next.personal.summary.trim()) {
        next.personal.summary =
          "Results-driven Computer Science undergraduate with proven experience building scalable full-stack web applications and microservices. Strong command of modern distributed architectures, real-time data streaming, and CI/CD pipelines.";
      }

      if (next.education.length === 0) {
        next.education.push({
          id: "edu-boost",
          institution: "State University of Technology",
          degree: "Bachelor of Science in Computer Science & Engineering",
          location: "Boston, MA",
          startDate: "2022",
          endDate: "2026 (Expected)",
          gpa: "CGPA: 9.25 / 10.00 (First Class with Distinction)",
          coursework: "Data Structures & Algorithms, Distributed Systems, Database Systems, Computer Networks",
        });
      }

      if (!next.skills.languages.trim()) next.skills.languages = "TypeScript, JavaScript, Python, C++, Java, SQL (PostgreSQL, MySQL)";
      if (!next.skills.frameworks.trim()) next.skills.frameworks = "React, Next.js, Node.js, Express, Tailwind CSS, FastAPI, Prisma ORM";
      if (!next.skills.developerTools.trim()) next.skills.developerTools = "Git, GitHub Actions, Docker, AWS (S3, Lambda), Linux, Redis, Postman";
      if (!next.skills.coreConcepts.trim()) next.skills.coreConcepts = "Object-Oriented Design, RESTful APIs, Microservices, CI/CD, Agile/Scrum";

      if (next.experience.length > 0) {
        next.experience = next.experience.map((exp) => ({
          ...exp,
          bullets: exp.bullets.map((b) => {
            if (!/\d+%|\$\d+|\d+\+|\b\d+\b/.test(b)) {
              return b.startsWith("Architected") || b.startsWith("Engineered") || b.startsWith("Optimized")
                ? `${b.replace(/\.$/, "")}, improving system performance by 34% for 45,000+ daily active users.`
                : `Engineered ${b.toLowerCase().replace(/\.$/, "")}, reducing latency by 28% across 12,000+ operations.`;
            }
            return b;
          }),
        }));
      }

      if (next.projects.length > 0) {
        next.projects = next.projects.map((proj) => ({
          ...proj,
          bullets: proj.bullets.map((b) => {
            if (!/\d+%|\$\d+|\d+\+|\b\d+\b/.test(b)) {
              return b.startsWith("Constructed") || b.startsWith("Designed") || b.startsWith("Spearheaded")
                ? `${b.replace(/\.$/, "")}, achieving sub-25ms response times across 5 regional clusters.`
                : `Architected ${b.toLowerCase().replace(/\.$/, "")}, scaling throughput by 40% for 10,000+ records.`;
            }
            return b;
          }),
        }));
      } else {
        next.projects.push({
          id: "proj-boost",
          title: "DevSprint — Real-Time Collaborative Workspace",
          techStack: "Next.js 14, TypeScript, WebSockets, Redis, Monaco Editor",
          link: "https://devsprint.demo",
          github: "https://github.com/alexchen-dev/devsprint",
          bullets: [
            "Constructed a multi-user collaborative code editor with real-time operational transformation supporting simultaneous editing across 20+ tabs.",
            "Designed low-latency Redis pub/sub messaging queues resulting in sub-20ms message synchronization across regional server clusters.",
          ],
        });
      }

      if (next.achievements.length === 0) {
        next.achievements = [
          "1st Place Winner — University Hackathon 2024 (Won $2,500 grand prize among 60+ collegiate teams)",
          "Dean's Honor List for 5 consecutive semesters for academic excellence",
        ];
      }

      return next;
    });

    confetti({ particleCount: 60, spread: 60, origin: { y: 0.2 } });
  };

  const toggleSection = (sec: SectionKey) => {
    setExpandedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handleNextStep = () => {
    const currentIndex = STEPS.findIndex((s) => s.key === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].key);
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    const currentIndex = STEPS.findIndex((s) => s.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].key);
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  // Load sample profile
  const handleLoadSample = (key: string) => {
    if (SAMPLE_PROFILES[key]) {
      setResume(JSON.parse(JSON.stringify(SAMPLE_PROFILES[key].data)));
      confetti({ particleCount: 40, spread: 45, origin: { y: 0.2 } });
    }
  };

  // Personal Field updater
  const handlePersonalChange = (field: keyof ResumeData["personal"], val: string) => {
    let cleanVal = val;
    if (field === "phone") {
      // Only permit numbers and standard phone formatting characters
      cleanVal = val.replace(/[^0-9+() -]/g, "");
    }
    setResume((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: cleanVal },
    }));
  };

  // Skills updater
  const handleSkillChange = (field: keyof ResumeData["skills"], val: string) => {
    setResume((prev) => ({
      ...prev,
      skills: { ...prev.skills, [field]: val },
    }));
  };

  // Education handlers
  const handleAddEducation = () => {
    setResume((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: `edu-${Date.now()}`,
          institution: "State University / College",
          degree: "Bachelor of Science in Engineering",
          location: "City, State",
          startDate: "2023",
          endDate: "2027",
          gpa: "CGPA: 8.8 / 10.0",
          coursework: "Data Structures, Database Management, Software Engineering",
        },
      ],
    }));
  };

  const handleUpdateEducation = (id: string, field: keyof EducationItem, val: string) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.map((e) => (e.id === id ? { ...e, [field]: val } : e)),
    }));
  };

  const handleRemoveEducation = (id: string) => {
    if (resume.education.length <= 1) return;
    setResume((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  };

  const handleMoveEducation = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= resume.education.length) return;
    const newItems = [...resume.education];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIdx, 0, moved);
    setResume((prev) => ({ ...prev, education: newItems }));
  };

  // Experience handlers
  const handleAddExperience = () => {
    setResume((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: `exp-${Date.now()}`,
          role: "Software Engineering Intern",
          company: "Tech Enterprise Inc.",
          location: "Remote / Hybrid",
          startDate: "Jun 2024",
          endDate: "Aug 2024",
          bullets: [
            "Engineered modular REST API endpoints in TypeScript and Express, optimizing server response latency by 28%.",
            "Constructed automated unit and integration tests, elevating regression test suite coverage to 88%.",
          ],
        },
      ],
    }));
  };

  const handleUpdateExperience = (id: string, field: keyof ExperienceItem, val: any) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.map((e) => (e.id === id ? { ...e, [field]: val } : e)),
    }));
  };

  const handleUpdateExperienceBullet = (expId: string, bulletIdx: number, val: string) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => {
        if (exp.id === expId) {
          const newBullets = [...exp.bullets];
          newBullets[bulletIdx] = val;
          return { ...exp, bullets: newBullets };
        }
        return exp;
      }),
    }));
  };

  const handleAddExperienceBullet = (expId: string) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => {
        if (exp.id === expId) {
          return { ...exp, bullets: [...exp.bullets, "Spearheaded development of core feature, delivering measurable 25% efficiency gains."] };
        }
        return exp;
      }),
    }));
  };

  const handleRemoveExperienceBullet = (expId: string, bulletIdx: number) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => {
        if (exp.id === expId && exp.bullets.length > 1) {
          return { ...exp, bullets: exp.bullets.filter((_, i) => i !== bulletIdx) };
        }
        return exp;
      }),
    }));
  };

  const handleRemoveExperience = (id: string) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id),
    }));
  };

  const handleMoveExperience = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= resume.experience.length) return;
    const newItems = [...resume.experience];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIdx, 0, moved);
    setResume((prev) => ({ ...prev, experience: newItems }));
  };

  // Projects handlers
  const handleAddProject = () => {
    setResume((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: `proj-${Date.now()}`,
          title: "New Project Title",
          techStack: "React, Node.js, MongoDB, Tailwind CSS",
          link: "https://project.demo",
          github: "https://github.com/username/project",
          bullets: [
            "Built a full-stack web application featuring secure user authentication and database management.",
            "Deployed on cloud infrastructure with 99.9% uptime and automated CI/CD pipeline.",
          ],
        },
      ],
    }));
  };

  const handleUpdateProject = (id: string, field: keyof ProjectItem, val: any) => {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, [field]: val } : p)),
    }));
  };

  const handleUpdateProjectBullet = (projId: string, bulletIdx: number, val: string) => {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) => {
        if (proj.id === projId) {
          const newBullets = [...proj.bullets];
          newBullets[bulletIdx] = val;
          return { ...proj, bullets: newBullets };
        }
        return proj;
      }),
    }));
  };

  const handleAddProjectBullet = (projId: string) => {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) => {
        if (proj.id === projId) {
          return { ...proj, bullets: [...proj.bullets, "Architected scalable backend service handling asynchronous requests with sub-50ms latency."] };
        }
        return proj;
      }),
    }));
  };

  const handleRemoveProjectBullet = (projId: string, bulletIdx: number) => {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) => {
        if (proj.id === projId && proj.bullets.length > 1) {
          return { ...proj, bullets: proj.bullets.filter((_, i) => i !== bulletIdx) };
        }
        return proj;
      }),
    }));
  };

  const handleRemoveProject = (id: string) => {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  const handleMoveProject = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= resume.projects.length) return;
    const newItems = [...resume.projects];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIdx, 0, moved);
    setResume((prev) => ({ ...prev, projects: newItems }));
  };

  // Achievements handlers
  const handleAddAchievement = () => {
    setResume((prev) => ({
      ...prev,
      achievements: [...prev.achievements, "Won 1st prize at Regional Collegiate Hackathon / Coding Contest"],
    }));
  };

  const handleUpdateAchievement = (index: number, val: string) => {
    setResume((prev) => {
      const copy = [...prev.achievements];
      copy[index] = val;
      return { ...prev, achievements: copy };
    });
  };

  const handleRemoveAchievement = (index: number) => {
    setResume((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
  };

  // AI Polish Single Bullet
  const handlePolishBullet = async (
    currentText: string,
    onSuccess: (polished: string) => void
  ) => {
    if (!currentText.trim()) return;

    setIsAiLoading(true);
    setAiStatusMsg("Polishing bullet point with Google XYZ formula...");

    try {
      const result = await smartPolishBullet(currentText);
      onSuccess(result);
    } catch (err) {
      // safe fallback
    } finally {
      setIsAiLoading(false);
      setAiStatusMsg("");
    }
  };

  // AI Generate Summary
  const handleGenerateSummary = async (roleName?: string) => {
    const target = roleName || resume.personal.title || "Software Engineering Student";
    setIsAiLoading(true);
    setAiStatusMsg(`Generating ATS summary for ${target}...`);

    try {
      const result = await smartGenerateSummary(target);
      handlePersonalChange("summary", result);
    } catch (err) {
      // fallback
    } finally {
      setIsAiLoading(false);
      setAiStatusMsg("");
      setAiModalOpen(false);
    }
  };

  // Apply Role Preset
  const handleApplyRolePreset = (preset: RolePreset) => {
    handlePersonalChange("summary", preset.suggestedSummary);
    handlePersonalChange("title", preset.role);
    setAiModalOpen(false);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.5 } });
  };

  // Analyze Job Description
  const handleScanJobDescription = () => {
    if (!jobDescriptionText.trim()) return;

    const fullResumeText = [
      resume.personal.fullName,
      resume.personal.title,
      resume.personal.summary,
      resume.skills.languages,
      resume.skills.frameworks,
      resume.skills.developerTools,
      resume.skills.coreConcepts,
      ...resume.experience.map((e) => `${e.role} ${e.company} ${e.bullets.join(" ")}`),
      ...resume.projects.map((p) => `${p.title} ${p.techStack} ${p.bullets.join(" ")}`),
    ].join(" ");

    const result = analyzeAtsKeywordMatch(fullResumeText, jobDescriptionText);
    setAtsAnalysis(result);
  };

  // Add Missing Keyword from JD
  const handleAddMissingKeyword = (kw: string) => {
    const current = resume.skills.developerTools;
    const updated = current ? `${current}, ${kw}` : kw;
    handleSkillChange("developerTools", updated);
    if (atsAnalysis) {
      setAtsAnalysis({
        ...atsAnalysis,
        missingKeywords: atsAnalysis.missingKeywords.filter((k) => k !== kw),
        foundKeywords: [...atsAnalysis.foundKeywords, kw],
        score: Math.min(atsAnalysis.score + 5, 100),
      });
    }
  };

  // Generate Bullet in Modal
  const handleGenerateBulletInModal = async () => {
    if (!rawBulletInput.trim()) return;
    setIsAiLoading(true);
    try {
      const result = await smartPolishBullet(rawBulletInput);
      setGeneratedBulletResult(result);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Step-by-Step AI Wizard: Submit & Synthesize Full Resume
  const handleExecuteAiWizard = async () => {
    if (!isStep6Valid) {
      setWizardAttemptedNext(true);
      return;
    }

    setIsAiLoading(true);
    setAiStatusMsg("Architecting your complete ATS resume with Google XYZ metrics & role keywords...");

    try {
      const synthesizedResume = await smartSynthesizeFullResume(wizardData);
      if (synthesizedResume && synthesizedResume.personal) {
        setResume(synthesizedResume);
        setAiModalOpen(false);
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.5 },
        });
      }
    } catch (e) {
      alert("Encountered an issue generating the resume. Falling back to structured profile.");
    } finally {
      setIsAiLoading(false);
      setAiStatusMsg("");
    }
  };

  // Wizard Role Selector handler
  const handleSelectWizardRole = (preset: RolePreset) => {
    setWizardData((prev) => ({
      ...prev,
      targetRole: preset.role,
      languages: prev.languages || preset.keywords.slice(0, 4).join(", "),
      frameworks: prev.frameworks || preset.keywords.slice(4, 7).join(", "),
      tools: prev.tools || preset.keywords.slice(7).join(", ") || "Git, Docker, AWS",
    }));
  };

  // Print PDF
  const handlePrint = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
    window.print();
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resume, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${resume.personal.fullName.replace(/\s+/g, "_") || "Resume"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.personal && parsed.education) {
          setResume(parsed);
          confetti({ particleCount: 40, spread: 50 });
        }
      } catch (err) {
        alert("Invalid JSON resume file format.");
      }
    };
    reader.readAsText(file);
  };

  // Copy Plaintext for ATS Portals
  const handleCopyPlainText = () => {
    let plain = `${resume.personal.fullName.toUpperCase()}\n`;
    if (resume.personal.title) plain += `${resume.personal.title}\n`;
    plain += `${resume.personal.email} | ${resume.personal.phone} | ${resume.personal.location}\n`;
    if (resume.personal.linkedin) plain += `LinkedIn: ${resume.personal.linkedin} | `;
    if (resume.personal.github) plain += `GitHub: ${resume.personal.github} | `;
    if (resume.personal.portfolio) plain += `Portfolio: ${resume.personal.portfolio}\n`;
    plain += `\n`;

    if (showSummary && resume.personal.summary) {
      plain += `PROFESSIONAL SUMMARY\n----------------------------------------\n${resume.personal.summary}\n\n`;
    }

    plain += `EDUCATION\n----------------------------------------\n`;
    resume.education.forEach((edu) => {
      plain += `${edu.institution} — ${edu.location}\n`;
      plain += `${edu.degree} (${edu.startDate} – ${edu.endDate})\n`;
      if (edu.gpa) plain += `${edu.gpa}\n`;
      if (showCoursework && edu.coursework) plain += `Relevant Coursework: ${edu.coursework}\n`;
      plain += `\n`;
    });

    plain += `TECHNICAL SKILLS\n----------------------------------------\n`;
    if (resume.skills.languages) plain += `Languages: ${resume.skills.languages}\n`;
    if (resume.skills.frameworks) plain += `Frameworks & Libraries: ${resume.skills.frameworks}\n`;
    if (resume.skills.developerTools) plain += `Developer Tools & Cloud: ${resume.skills.developerTools}\n`;
    if (resume.skills.coreConcepts) plain += `Core Concepts: ${resume.skills.coreConcepts}\n`;
    plain += `\n`;

    if (resume.experience.length > 0) {
      plain += `EXPERIENCE\n----------------------------------------\n`;
      resume.experience.forEach((exp) => {
        plain += `${exp.role} | ${exp.company} (${exp.startDate} – ${exp.endDate}) — ${exp.location}\n`;
        exp.bullets.forEach((b) => {
          plain += `• ${b}\n`;
        });
        plain += `\n`;
      });
    }

    if (resume.projects.length > 0) {
      plain += `PROJECTS\n----------------------------------------\n`;
      resume.projects.forEach((proj) => {
        plain += `${proj.title} | ${proj.techStack}\n`;
        if (proj.link) plain += `Demo: ${proj.link} | `;
        if (proj.github) plain += `GitHub: ${proj.github}\n`;
        proj.bullets.forEach((b) => {
          plain += `• ${b}\n`;
        });
        plain += `\n`;
      });
    }

    if (resume.achievements.length > 0) {
      plain += `HONORS & ACHIEVEMENTS\n----------------------------------------\n`;
      resume.achievements.forEach((ach) => {
        plain += `• ${ach}\n`;
      });
      plain += `\n`;
    }

    navigator.clipboard.writeText(plain);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const fontClass =
    fontFamily === "serif"
      ? "font-serif"
      : fontFamily === "mono"
      ? "font-mono"
      : "font-sans";

  return (
    <ToolLayout tool={tool}>
      {/* Print-only CSS rules for exact 1-page Letter PDF rendering */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #ats-resume-print-area,
          #ats-resume-print-area * {
            visibility: visible !important;
          }
          #ats-resume-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px 28px !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            transform: none !important;
          }
          @page {
            size: letter portrait;
            margin: 10mm 12mm;
          }
        }
      `}</style>

      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* ========================================================================= */}
        {/* TOP COMMAND HEADER & TEMPLATE SELECTOR */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left Title & Status Badges */}
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                    ATS Student Resume Builder
                  </h1>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <Check className="w-2.5 h-2.5 text-emerald-500" />
                    100% ATS Verified
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                    AI Step-by-Step
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Answer quick questions to build your resume with AI or use the step-by-step editor below.
                </p>
              </div>
            </div>

            {/* Right Action Buttons: Dedicated AI Tools Group + Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* AI Tools Segmented Container */}
              <div className="flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 px-2 flex items-center gap-1 hidden sm:flex">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  AI Tools:
                </span>

                {/* 1. Step-by-Step Creator */}
                <button
                  type="button"
                  onClick={() => {
                    setAiActiveTab("wizard");
                    setAiModalOpen(true);
                    setWizardAttemptedNext(false);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-sm flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer"
                  title="AI Step-by-Step Resume Creator: Build your full ATS resume by answering quick questions"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-200" />
                  <span>Step-by-Step Wizard</span>
                </button>

                {/* 2. Role Summaries */}
                <button
                  type="button"
                  onClick={() => {
                    setAiActiveTab("smart_roles");
                    setAiModalOpen(true);
                  }}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="AI Role Summaries: Instant ATS summaries for popular tech disciplines"
                >
                  <Bot className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden md:inline">Role Summaries</span>
                </button>

                {/* 3. Bullet Polish */}
                <button
                  type="button"
                  onClick={() => {
                    setAiActiveTab("bullet_builder");
                    setAiModalOpen(true);
                  }}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="AI Bullet Polish: Transform raw notes into Google XYZ metric formulas"
                >
                  <Wand2 className="w-3.5 h-3.5 text-purple-500" />
                  <span className="hidden md:inline">Bullet Polish</span>
                </button>

                {/* 4. JD Match Scanner */}
                <button
                  type="button"
                  onClick={() => {
                    setAiActiveTab("jd_scanner");
                    setAiModalOpen(true);
                  }}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="AI Job ATS Scanner: Match resume against Job Description keywords"
                >
                  <Target className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden md:inline">ATS Scanner</span>
                </button>
              </div>

              {/* Standard Actions: Copy Plaintext & Download PDF */}
              <div className="flex items-center gap-1.5">
                {/* Copy Plaintext ATS */}
                <button
                  type="button"
                  onClick={handleCopyPlainText}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Copy clean plaintext for pasting into LinkedIn/Taleo/Workday application textboxes"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? "Copied!" : "Copy Plaintext"}</span>
                </button>

                {/* Download PDF Button */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-black shadow-md flex items-center gap-2 transition-all hover:scale-102 cursor-pointer shrink-0"
                >
                  <Printer className="w-4 h-4 text-indigo-400 dark:text-indigo-600" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Profile Starter Chips & ATS Health Bar */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            {/* Quick Starters */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                Sample Starters:
              </span>
              {Object.entries(SAMPLE_PROFILES).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleLoadSample(key)}
                  className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold text-[11px] transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* ATS Score Meter & Booster Toggle */}
            <button
              type="button"
              onClick={() => setShowAtsOptimizer((prev) => !prev)}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border transition-all cursor-pointer whitespace-nowrap self-start md:self-auto shadow-xs ${
                showAtsOptimizer
                  ? "bg-indigo-50 dark:bg-indigo-950/80 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/20"
                  : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700"
              }`}
              title="Click to view ATS Score Increaser & exact steps to achieve 100/100 score"
            >
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                <span>ATS Quality Score:</span>
              </span>
              <div className="w-20 sm:w-24 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
                <div
                  className={`h-full transition-all duration-500 ${
                    atsHealth.score >= 85
                      ? "bg-emerald-500"
                      : atsHealth.score >= 60
                      ? "bg-indigo-500"
                      : "bg-amber-500"
                  }`}
                  style={{ width: `${atsHealth.score}%` }}
                />
              </div>
              <span
                className={`font-black text-xs whitespace-nowrap ${
                  atsHealth.score >= 85
                    ? "text-emerald-600 dark:text-emerald-400"
                    : atsHealth.score >= 60
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {atsHealth.score}/100
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center gap-0.5">
                {showAtsOptimizer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                <span>{showAtsOptimizer ? "Close" : "Boost +"}</span>
              </span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* ATS SCORE INCREASER & PREVIEW OPTIMIZATION PANEL */}
          {/* ========================================================================= */}
          {showAtsOptimizer && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-slate-50/80 dark:from-indigo-950/70 dark:via-purple-950/40 dark:to-slate-950/60 border border-indigo-200 dark:border-indigo-800/80 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 dark:border-indigo-900/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black shadow-sm">
                    <Zap className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>ATS Score Increaser & Preview Optimizer</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                        Target: 100/100
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Follow these real-time steps to maximize recruiter ATS match rate. Click &quot;Highlight in Preview&quot; to see where to make edits.
                    </p>
                  </div>
                </div>

                {/* 1-Click AI Auto Boost */}
                <button
                  type="button"
                  onClick={handleAutoBoostScore}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>1-Click Auto Boost to 100</span>
                </button>
              </div>

              {/* Grid of Actionable ATS Criteria */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {atsHealth.checks.map((check) => (
                  <div
                    key={check.id}
                    onMouseEnter={() => setHighlightedAtsSection(check.id)}
                    onMouseLeave={() => setHighlightedAtsSection(null)}
                    className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                      check.pass
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60"
                        : "bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800/80 shadow-sm"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          {check.pass ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          )}
                          <span>{check.title}</span>
                        </span>
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${
                            check.pass
                              ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                              : "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
                          }`}
                        >
                          {check.pass ? `+${check.points} pts ✓` : `+${check.points} pts available`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                        {check.description}
                      </p>
                    </div>

                    <div className="pt-2.5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 mt-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setHighlightedAtsSection(check.id);
                          setMobileTab("preview");
                          const el = document.getElementById(`ats-preview-${check.id}`);
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                        }}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Highlight in Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (check.section !== "metrics" && check.section !== "verbs") {
                            setCurrentStep(check.section as SectionKey);
                            setEditorMode("tabs");
                            setExpandedSections((prev) => ({ ...prev, [check.section]: true }));
                          } else {
                            setCurrentStep("projects");
                            setEditorMode("tabs");
                            setExpandedSections((prev) => ({ ...prev, projects: true, experience: true }));
                          }
                          setMobileTab("edit");
                          window.scrollTo({ top: 200, behavior: "smooth" });
                        }}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        {check.actionLabel || "Fix"} →
                      </button>
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        {/* Mobile Tab Switcher (Edit vs Preview) */}
        <div className="lg:hidden flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setMobileTab("edit")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === "edit"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Edit Resume Content</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === "preview"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live ATS Preview</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MAIN DUAL PANEL (LEFT: USER-FRIENDLY EDITOR | RIGHT: LIVE PREVIEW) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ======================================================================= */}
          {/* LEFT PANEL: RESUME FORM EDITOR (COL-SPAN-6) */}
          {/* ======================================================================= */}
          <div
            className={`space-y-4 ${
              mobileTab === "edit" ? "block" : "hidden lg:block"
            } lg:col-span-6`}
          >
            {/* Style & Typography Toolbar Card */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Format & Styling
                  </span>
                </div>
                {/* View Mode Toggle: Step Focus vs All Accordion */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setEditorMode("tabs")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      editorMode === "tabs"
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Step Focus
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode("accordion")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      editorMode === "accordion"
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    All Sections
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Font Family</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value as any)}
                    className="w-full p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none"
                  >
                    <option value="sans">Modern Sans (Inter/Calibri)</option>
                    <option value="serif">Classic Ivy (Times/Georgia)</option>
                    <option value="mono">Clean Mono (Consolas)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Accent Color</label>
                  <select
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none"
                  >
                    <option value="indigo">Tech Indigo</option>
                    <option value="slate">Monochrome Slate (Standard)</option>
                    <option value="blue">Executive Blue</option>
                    <option value="emerald">Modern Emerald</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Layout Preset</label>
                  <select
                    value={layoutStyle}
                    onChange={(e) => setLayoutStyle(e.target.value as any)}
                    className="w-full p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none"
                  >
                    <option value="classic">Standard Harvard ATS</option>
                    <option value="modern">Modern Tech Clean</option>
                    <option value="compact">Compact 1-Page Fit</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end gap-1.5 pb-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={showSummary}
                      onChange={(e) => setShowSummary(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Include Bio</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={showCoursework}
                      onChange={(e) => setShowCoursework(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Show Courses</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Step-by-Step Section Navigation Tabs (When in 'tabs' mode) */}
            {editorMode === "tabs" && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                {STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.key;
                  return (
                    <button
                      key={step.key}
                      type="button"
                      onClick={() => setCurrentStep(step.key)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        isActive
                          ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Icon className="w-3.5 h-3.5" />
                        {step.count !== undefined && (
                          <span className="text-[9px] px-1 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {step.count}
                          </span>
                        )}
                      </div>
                      <span className="truncate w-full text-center">{step.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* =================================================================== */}
            {/* SECTION 1: PERSONAL DETAILS & BIO SUMMARY */}
            {/* =================================================================== */}
            {(editorMode === "accordion" || currentStep === "personal") && (
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div
                  onClick={() => editorMode === "accordion" && toggleSection("personal")}
                  className={`flex items-center justify-between ${
                    editorMode === "accordion" ? "cursor-pointer" : ""
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-500" />
                    1. Personal Info & Contact
                  </span>
                  {editorMode === "accordion" && (
                    expandedSections.personal ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {(editorMode === "tabs" || expandedSections.personal) && (
                  <div className="space-y-3.5 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={resume.personal.fullName}
                          onChange={(e) => handlePersonalChange("fullName", e.target.value)}
                          placeholder="e.g. Alex Chen"
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Target Professional Title
                        </label>
                        <input
                          type="text"
                          value={resume.personal.title}
                          onChange={(e) => handlePersonalChange("title", e.target.value)}
                          placeholder="e.g. Software Engineering Student / AI Specialist"
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            Email Address *
                          </label>
                          {resume.personal.email.trim() && (
                            <span className={`text-[9px] font-bold ${isValidEmail(resume.personal.email) ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                              {isValidEmail(resume.personal.email) ? "✓ Valid" : "✕ Invalid"}
                            </span>
                          )}
                        </div>
                        <input
                          type="email"
                          value={resume.personal.email}
                          onChange={(e) => handlePersonalChange("email", e.target.value.trim())}
                          placeholder="alex@college.edu"
                          className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-colors ${
                            resume.personal.email.trim() && !isValidEmail(resume.personal.email)
                              ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 ring-1 ring-rose-400/40"
                              : isValidEmail(resume.personal.email)
                              ? "border-emerald-400 dark:border-emerald-700 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-900 dark:text-slate-100 ring-1 ring-emerald-400/30"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            Phone Number
                          </label>
                          {resume.personal.phone.trim() && (
                            <span className={`text-[9px] font-bold ${isValidPhone(resume.personal.phone) ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                              {isValidPhone(resume.personal.phone) ? "✓ Valid" : "✕ Digits only"}
                            </span>
                          )}
                        </div>
                        <CountryPhoneInput
                          value={resume.personal.phone}
                          onChange={(val) => handlePersonalChange("phone", val)}
                          isError={Boolean(resume.personal.phone.trim() && !isValidPhone(resume.personal.phone))}
                          isValid={Boolean(resume.personal.phone.trim() && isValidPhone(resume.personal.phone))}
                          placeholder="98765 43210"
                        />
                        {resume.personal.phone.trim() && !isValidPhone(resume.personal.phone) && (
                          <p className="text-[9px] text-rose-500 font-semibold mt-1">
                            Enter valid phone digits (7-15 digits)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            Location (City, State / Country)
                          </label>
                          {resume.personal.location.trim() && (
                            <span className={`text-[9px] font-bold ${isValidLocation(resume.personal.location) ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                              {isValidLocation(resume.personal.location) ? "✓ Valid" : "✕ Too short"}
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={resume.personal.location}
                          onChange={(e) => handlePersonalChange("location", e.target.value)}
                          placeholder="Boston, MA"
                          className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-colors ${
                            resume.personal.location.trim() && !isValidLocation(resume.personal.location)
                              ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 ring-1 ring-rose-400/40"
                              : isValidLocation(resume.personal.location)
                              ? "border-emerald-400 dark:border-emerald-700 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-900 dark:text-slate-100 ring-1 ring-emerald-400/30"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          LinkedIn Profile URL
                        </label>
                        <input
                          type="text"
                          value={resume.personal.linkedin}
                          onChange={(e) => handlePersonalChange("linkedin", e.target.value)}
                          placeholder="linkedin.com/in/username"
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          GitHub / Portfolio URL
                        </label>
                        <input
                          type="text"
                          value={resume.personal.github}
                          onChange={(e) => handlePersonalChange("github", e.target.value)}
                          placeholder="github.com/username"
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Personal Website / Demo
                        </label>
                        <input
                          type="text"
                          value={resume.personal.portfolio}
                          onChange={(e) => handlePersonalChange("portfolio", e.target.value)}
                          placeholder="alexchen.dev"
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {showSummary && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            Professional Summary / Career Bio
                          </label>
                          <button
                            type="button"
                            onClick={() => handleGenerateSummary()}
                            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{isAiLoading ? "Writing..." : "✨ AI Generate Bio"}</span>
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={resume.personal.summary}
                          onChange={(e) => handlePersonalChange("summary", e.target.value)}
                          placeholder="Brief 2-3 sentence overview highlighting your technical strengths, core domain enthusiasm, and projects..."
                          className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    )}

                    {editorMode === "tabs" && (
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <span>Next: Education</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* =================================================================== */}
            {/* SECTION 2: EDUCATION */}
            {/* =================================================================== */}
            {(editorMode === "accordion" || currentStep === "education") && (
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div
                  onClick={() => editorMode === "accordion" && toggleSection("education")}
                  className={`flex items-center justify-between ${
                    editorMode === "accordion" ? "cursor-pointer" : ""
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-500" />
                    2. Education ({resume.education.length})
                  </span>
                  {editorMode === "accordion" && (
                    expandedSections.education ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {(editorMode === "tabs" || expandedSections.education) && (
                  <div className="space-y-4 pt-1">
                    {resume.education.map((edu, idx) => (
                      <div
                        key={edu.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[11px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <span>{edu.institution || `Degree #${idx + 1}`}</span>
                          </span>
                          <div className="flex items-center gap-1">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMoveEducation(idx, "up")}
                                className="p-1 text-slate-400 hover:text-indigo-600 rounded-md"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {idx < resume.education.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMoveEducation(idx, "down")}
                                className="p-1 text-slate-400 hover:text-indigo-600 rounded-md"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {resume.education.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveEducation(edu.id)}
                                className="p-1 text-slate-400 hover:text-rose-500 rounded-md"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">University / College Name</label>
                            <input
                              type="text"
                              value={edu.institution}
                              onChange={(e) => handleUpdateEducation(edu.id, "institution", e.target.value)}
                              placeholder="e.g. Massachusetts Institute of Technology"
                              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Degree & Major</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => handleUpdateEducation(edu.id, "degree", e.target.value)}
                              placeholder="e.g. Bachelor of Science in Computer Science"
                              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Campus Location</label>
                            <input
                              type="text"
                              value={edu.location}
                              onChange={(e) => handleUpdateEducation(edu.id, "location", e.target.value)}
                              placeholder="City, State"
                              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Start Year</label>
                            <input
                              type="text"
                              value={edu.startDate}
                              onChange={(e) => handleUpdateEducation(edu.id, "startDate", e.target.value)}
                              placeholder="2022"
                              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Graduation Year</label>
                            <input
                              type="text"
                              value={edu.endDate}
                              onChange={(e) => handleUpdateEducation(edu.id, "endDate", e.target.value)}
                              placeholder="2026 (Expected)"
                              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">GPA / Honors</label>
                            <input
                              type="text"
                              value={edu.gpa}
                              onChange={(e) => handleUpdateEducation(edu.id, "gpa", e.target.value)}
                              placeholder="e.g. CGPA: 9.24 / 10.00"
                              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Relevant Key Coursework</label>
                            <input
                              type="text"
                              value={edu.coursework}
                              onChange={(e) => handleUpdateEducation(edu.id, "coursework", e.target.value)}
                              placeholder="e.g. Algorithms, Distributed Systems, Database Systems"
                              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddEducation}
                      className="w-full py-2.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-400 dark:hover:border-indigo-600 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Another College / School
                    </button>

                    {editorMode === "tabs" && (
                      <div className="pt-2 flex justify-between">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <span>Next: Technical Skills</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* =================================================================== */}
            {/* SECTION 3: TECHNICAL SKILLS */}
            {/* =================================================================== */}
            {(editorMode === "accordion" || currentStep === "skills") && (
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div
                  onClick={() => editorMode === "accordion" && toggleSection("skills")}
                  className={`flex items-center justify-between ${
                    editorMode === "accordion" ? "cursor-pointer" : ""
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-500" />
                    3. Technical Skills & Tools
                  </span>
                  {editorMode === "accordion" && (
                    expandedSections.skills ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {(editorMode === "tabs" || expandedSections.skills) && (
                  <div className="space-y-3.5 pt-1">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Programming Languages
                      </label>
                      <input
                        type="text"
                        value={resume.skills.languages}
                        onChange={(e) => handleSkillChange("languages", e.target.value)}
                        placeholder="e.g. TypeScript, JavaScript, Python, C++, Java, SQL"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Frameworks & Libraries
                      </label>
                      <input
                        type="text"
                        value={resume.skills.frameworks}
                        onChange={(e) => handleSkillChange("frameworks", e.target.value)}
                        placeholder="e.g. React, Next.js, Node.js, Express, Tailwind CSS, PyTorch"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Developer Tools, Cloud & Databases
                      </label>
                      <input
                        type="text"
                        value={resume.skills.developerTools}
                        onChange={(e) => handleSkillChange("developerTools", e.target.value)}
                        placeholder="e.g. Git, GitHub Actions, Docker, AWS (S3, Lambda), PostgreSQL, Redis"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Core CS & Engineering Concepts
                      </label>
                      <input
                        type="text"
                        value={resume.skills.coreConcepts}
                        onChange={(e) => handleSkillChange("coreConcepts", e.target.value)}
                        placeholder="e.g. Object-Oriented Design, RESTful APIs, Microservices, CI/CD, Agile"
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    {editorMode === "tabs" && (
                      <div className="pt-2 flex justify-between">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <span>Next: Experience</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* =================================================================== */}
            {/* SECTION 4: WORK EXPERIENCE & INTERNSHIPS */}
            {/* =================================================================== */}
            {(editorMode === "accordion" || currentStep === "experience") && (
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div
                  onClick={() => editorMode === "accordion" && toggleSection("experience")}
                  className={`flex items-center justify-between ${
                    editorMode === "accordion" ? "cursor-pointer" : ""
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                    4. Work Experience & Internships ({resume.experience.length})
                  </span>
                  {editorMode === "accordion" && (
                    expandedSections.experience ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {(editorMode === "tabs" || expandedSections.experience) && (
                  <div className="space-y-4 pt-1">
                    {resume.experience.map((exp, expIdx) => (
                      <div
                        key={exp.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[11px] flex items-center justify-center font-bold">
                              {expIdx + 1}
                            </span>
                            <span>{exp.role || `Role #${expIdx + 1}`}</span>
                          </span>
                          <div className="flex items-center gap-1">
                            {expIdx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMoveExperience(expIdx, "up")}
                                className="p-1 text-slate-400 hover:text-indigo-600 rounded-md"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {expIdx < resume.experience.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMoveExperience(expIdx, "down")}
                                className="p-1 text-slate-400 hover:text-indigo-600 rounded-md"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveExperience(exp.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded-md"
                              title="Delete Role"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Job Title / Role</label>
                            <input
                              type="text"
                              value={exp.role}
                              onChange={(e) => handleUpdateExperience(exp.id, "role", e.target.value)}
                              placeholder="e.g. Software Engineering Intern"
                              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Company / Organization</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => handleUpdateExperience(exp.id, "company", e.target.value)}
                              placeholder="e.g. Acme Tech Inc."
                              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Location</label>
                            <input
                              type="text"
                              value={exp.location}
                              onChange={(e) => handleUpdateExperience(exp.id, "location", e.target.value)}
                              placeholder="Boston, MA / Remote"
                              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Start Date</label>
                            <input
                              type="text"
                              value={exp.startDate}
                              onChange={(e) => handleUpdateExperience(exp.id, "startDate", e.target.value)}
                              placeholder="Jun 2024"
                              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">End Date</label>
                            <input
                              type="text"
                              value={exp.endDate}
                              onChange={(e) => handleUpdateExperience(exp.id, "endDate", e.target.value)}
                              placeholder="Aug 2024 / Present"
                              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Bullet points with Action Verbs & Polish */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                              Accomplishment Bullets (STAR / XYZ Formula)
                            </label>
                            <span className="text-[10px] text-indigo-500 font-semibold">
                              💡 Tip: Start with strong action verbs & include metrics
                            </span>
                          </div>

                          {exp.bullets.map((b, bIdx) => (
                            <div key={bIdx} className="space-y-1 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                              <div className="flex items-start gap-1.5">
                                <span className="text-slate-400 text-xs font-bold pt-1.5">•</span>
                                <textarea
                                  rows={2}
                                  value={b}
                                  onChange={(e) => handleUpdateExperienceBullet(exp.id, bIdx, e.target.value)}
                                  placeholder="Action Verb + Task Accomplished + Measurable Result (e.g. Architected microservices, reducing latency by 32%)..."
                                  className="flex-1 p-1.5 rounded-lg border-0 bg-transparent text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none resize-y"
                                />
                                <div className="flex flex-col gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handlePolishBullet(b, (polished) =>
                                        handleUpdateExperienceBullet(exp.id, bIdx, polished)
                                      )
                                    }
                                    title="AI Polish (XYZ Formula)"
                                    className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                                  >
                                    <Wand2 className="w-3 h-3" />
                                    <span className="hidden sm:inline">Polish</span>
                                  </button>
                                  {exp.bullets.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveExperienceBullet(exp.id, bIdx)}
                                      className="p-1 text-slate-400 hover:text-rose-500 self-center"
                                      title="Delete Bullet"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Quick Action Verb Chips */}
                              <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-800/60 text-[10px]">
                                <span className="text-slate-400 font-medium">Verbs:</span>
                                {["Spearheaded", "Architected", "Engineered", "Optimized", "Automated", "Streamlined"].map((verb) => (
                                  <button
                                    key={verb}
                                    type="button"
                                    onClick={() => {
                                      const clean = b.replace(/^[A-Za-z]+\s+/, "");
                                      handleUpdateExperienceBullet(exp.id, bIdx, `${verb} ${clean}`.trim());
                                    }}
                                    className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-slate-600 dark:text-slate-300 hover:text-indigo-600 font-semibold cursor-pointer transition-colors"
                                  >
                                    {verb}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => handleAddExperienceBullet(exp.id)}
                            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                          >
                            <Plus className="w-3 h-3" />
                            Add Bullet Point
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddExperience}
                      className="w-full py-2.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-400 dark:hover:border-indigo-600 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Another Work Experience
                    </button>

                    {editorMode === "tabs" && (
                      <div className="pt-2 flex justify-between">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <span>Next: Projects</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* =================================================================== */}
            {/* SECTION 5: ACADEMIC & SIDE PROJECTS */}
            {/* =================================================================== */}
            {(editorMode === "accordion" || currentStep === "projects") && (
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div
                  onClick={() => editorMode === "accordion" && toggleSection("projects")}
                  className={`flex items-center justify-between ${
                    editorMode === "accordion" ? "cursor-pointer" : ""
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-indigo-500" />
                    5. Academic & Side Projects ({resume.projects.length})
                  </span>
                  {editorMode === "accordion" && (
                    expandedSections.projects ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {(editorMode === "tabs" || expandedSections.projects) && (
                  <div className="space-y-4 pt-1">
                    {resume.projects.map((proj, projIdx) => (
                      <div
                        key={proj.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[11px] flex items-center justify-center font-bold">
                              {projIdx + 1}
                            </span>
                            <span>{proj.title || `Project #${projIdx + 1}`}</span>
                          </span>
                          <div className="flex items-center gap-1">
                            {projIdx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMoveProject(projIdx, "up")}
                                className="p-1 text-slate-400 hover:text-indigo-600 rounded-md"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {projIdx < resume.projects.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMoveProject(projIdx, "down")}
                                className="p-1 text-slate-400 hover:text-indigo-600 rounded-md"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveProject(proj.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded-md"
                              title="Delete Project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Project Title</label>
                            <input
                              type="text"
                              value={proj.title}
                              onChange={(e) => handleUpdateProject(proj.id, "title", e.target.value)}
                              placeholder="e.g. DevSprint Code Editor"
                              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Tech Stack Used</label>
                            <input
                              type="text"
                              value={proj.techStack}
                              onChange={(e) => handleUpdateProject(proj.id, "techStack", e.target.value)}
                              placeholder="e.g. Next.js 14, TypeScript, Redis, Tailwind CSS"
                              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">Live Demo / Deployed Link</label>
                            <input
                              type="text"
                              value={proj.link}
                              onChange={(e) => handleUpdateProject(proj.id, "link", e.target.value)}
                              placeholder="https://project.demo"
                              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-1">GitHub Repo Link</label>
                            <input
                              type="text"
                              value={proj.github}
                              onChange={(e) => handleUpdateProject(proj.id, "github", e.target.value)}
                              placeholder="https://github.com/user/repo"
                              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Project Bullets */}
                        <div className="space-y-2 pt-1">
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                            Key Project Highlights & Architectural Decisions
                          </label>

                          {proj.bullets.map((b, bIdx) => (
                            <div key={bIdx} className="space-y-1 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                              <div className="flex items-start gap-1.5">
                                <span className="text-slate-400 text-xs font-bold pt-1.5">•</span>
                                <textarea
                                  rows={2}
                                  value={b}
                                  onChange={(e) => handleUpdateProjectBullet(proj.id, bIdx, e.target.value)}
                                  placeholder="Constructed full-stack architecture with real-time operational transformation..."
                                  className="flex-1 p-1.5 rounded-lg border-0 bg-transparent text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none resize-y"
                                />
                                <div className="flex flex-col gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handlePolishBullet(b, (polished) =>
                                        handleUpdateProjectBullet(proj.id, bIdx, polished)
                                      )
                                    }
                                    title="AI Polish (XYZ Formula)"
                                    className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                                  >
                                    <Wand2 className="w-3 h-3" />
                                    <span className="hidden sm:inline">Polish</span>
                                  </button>
                                  {proj.bullets.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveProjectBullet(proj.id, bIdx)}
                                      className="p-1 text-slate-400 hover:text-rose-500 self-center"
                                      title="Delete Bullet"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Quick Action Verb Chips */}
                              <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-800/60 text-[10px]">
                                <span className="text-slate-400 font-medium">Verbs:</span>
                                {["Constructed", "Developed", "Architected", "Implemented", "Integrated", "Optimized"].map((verb) => (
                                  <button
                                    key={verb}
                                    type="button"
                                    onClick={() => {
                                      const clean = b.replace(/^[A-Za-z]+\s+/, "");
                                      handleUpdateProjectBullet(proj.id, bIdx, `${verb} ${clean}`.trim());
                                    }}
                                    className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-slate-600 dark:text-slate-300 hover:text-indigo-600 font-semibold cursor-pointer transition-colors"
                                  >
                                    {verb}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => handleAddProjectBullet(proj.id)}
                            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                          >
                            <Plus className="w-3 h-3" />
                            Add Bullet Point
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddProject}
                      className="w-full py-2.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-400 dark:hover:border-indigo-600 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Another Project
                    </button>

                    {editorMode === "tabs" && (
                      <div className="pt-2 flex justify-between">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Back</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <span>Next: Honors & Certs</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* =================================================================== */}
            {/* SECTION 6: HONORS, AWARDS & ACHIEVEMENTS */}
            {/* =================================================================== */}
            {(editorMode === "accordion" || currentStep === "achievements") && (
              <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div
                  onClick={() => editorMode === "accordion" && toggleSection("achievements")}
                  className={`flex items-center justify-between ${
                    editorMode === "accordion" ? "cursor-pointer" : ""
                  }`}
                >
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-500" />
                    6. Honors, Awards & Achievements ({resume.achievements.length})
                  </span>
                  {editorMode === "accordion" && (
                    expandedSections.achievements ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {(editorMode === "tabs" || expandedSections.achievements) && (
                  <div className="space-y-3 pt-1">
                    {resume.achievements.map((ach, aIdx) => (
                      <div key={aIdx} className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs font-bold pl-1">•</span>
                        <input
                          type="text"
                          value={ach}
                          onChange={(e) => handleUpdateAchievement(aIdx, e.target.value)}
                          placeholder="e.g. 1st Place Winner at University Hackathon 2024 (Won $2,500 grand prize)"
                          className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAchievement(aIdx)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddAchievement}
                      className="w-full py-2.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-400 dark:hover:border-indigo-600 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Honor / Award / Achievement
                    </button>

                    {/* Quick JSON Backup / Restore Footer in Last Step */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleExportJSON}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          title="Download .json backup"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>Export JSON</span>
                        </button>
                        <label className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Import JSON</span>
                          <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                        </label>
                      </div>

                      {editorMode === "tabs" && (
                        <button
                          type="button"
                          onClick={() => setMobileTab("preview")}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer lg:hidden"
                        >
                          <span>View Preview</span>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ======================================================================= */}
          {/* RIGHT PANEL: LIVE ATS RESUME PREVIEW (COL-SPAN-6, STICKY) */}
          {/* ======================================================================= */}
          <div
            className={`space-y-4 ${
              mobileTab === "preview" ? "block" : "hidden lg:block"
            } lg:col-span-6 lg:sticky lg:top-20`}
          >
            {/* Live ATS Page Container */}
            <div className="bg-slate-200 dark:bg-slate-900/90 p-4 sm:p-5 rounded-3xl border border-slate-300 dark:border-slate-800 shadow-inner flex flex-col items-center">
              {/* Preview Bar & Zoom Controls */}
              <div className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold">Standard 1-Page Letter Preview</span>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(z - 10, 70))}
                    className="p-1 hover:text-indigo-600 text-slate-500"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-semibold w-9 text-center">{zoomLevel}%</span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(z + 10, 130))}
                    className="p-1 hover:text-indigo-600 text-slate-500"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(100)}
                    className="ml-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* The Actual Resume Sheet (White Canvas with Standard Print Styles) */}
              <div className="w-full overflow-x-auto flex justify-center py-2">
                <div
                  id="ats-resume-print-area"
                  ref={printRef}
                  className={`w-full max-w-[650px] bg-white text-slate-900 shadow-2xl rounded-sm p-7 sm:p-9 ${fontClass} text-[12.5px] leading-relaxed transition-all origin-top`}
                  style={{
                    minHeight: "840px",
                    transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
                  }}
                >
                  {/* 1. HEADER */}
                  <div
                    id="ats-preview-contact"
                    className={`text-center border-b border-slate-300 pb-3 mb-3 space-y-0.5 transition-all duration-300 ${
                      highlightedAtsSection === "contact" || highlightedAtsSection === "header"
                        ? "ring-4 ring-indigo-500/50 bg-indigo-50/60 rounded-xl p-2.5 shadow-md"
                        : ""
                    }`}
                  >
                    {(highlightedAtsSection === "contact" || highlightedAtsSection === "header") && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white font-black text-[9px] shadow-sm animate-pulse mb-1">
                        <Zap className="w-2.5 h-2.5 text-amber-300" />
                        <span>ATS Optimization Target: Contact Info & Links</span>
                      </div>
                    )}
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                      {resume.personal.fullName || "YOUR FULL NAME"}
                    </h1>
                    {resume.personal.title && (
                      <p className="text-xs font-bold text-slate-700 tracking-wide">
                        {resume.personal.title}
                      </p>
                    )}
                    <div className="text-[11px] text-slate-600 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 pt-0.5 font-medium">
                      {resume.personal.email && <span>{resume.personal.email}</span>}
                      {resume.personal.phone && <span>• {resume.personal.phone}</span>}
                      {resume.personal.location && <span>• {resume.personal.location}</span>}
                      {resume.personal.linkedin && <span>• {resume.personal.linkedin}</span>}
                      {resume.personal.github && <span>• {resume.personal.github}</span>}
                      {resume.personal.portfolio && <span>• {resume.personal.portfolio}</span>}
                    </div>
                  </div>

                  {/* 2. SUMMARY (OPTIONAL) */}
                  {showSummary && resume.personal.summary && (
                    <div
                      id="ats-preview-summary"
                      className="mb-3 transition-all duration-300"
                    >
                      <h2
                        className={`text-xs font-black uppercase tracking-wider border-b pb-0.5 mb-1 ${
                          accentColor === "indigo"
                            ? "text-indigo-900 border-indigo-200"
                            : accentColor === "blue"
                            ? "text-blue-900 border-blue-200"
                            : accentColor === "emerald"
                            ? "text-emerald-900 border-emerald-200"
                            : "text-slate-900 border-slate-300"
                        }`}
                      >
                        Professional Summary
                      </h2>
                      <p className="text-[11.5px] text-slate-700 leading-normal text-justify">
                        {resume.personal.summary}
                      </p>
                    </div>
                  )}

                  {/* 3. EDUCATION */}
                  {resume.education.length > 0 && (
                    <div
                      id="ats-preview-education"
                      className={`mb-3 transition-all duration-300 ${
                        highlightedAtsSection === "education"
                          ? "ring-4 ring-indigo-500/50 bg-indigo-50/60 rounded-xl p-2.5 shadow-md"
                          : ""
                      }`}
                    >
                      {highlightedAtsSection === "education" && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white font-black text-[9px] shadow-sm animate-pulse mb-1">
                          <Zap className="w-2.5 h-2.5 text-amber-300" />
                          <span>ATS Optimization Target: University & GPA</span>
                        </div>
                      )}
                      <h2
                        className={`text-xs font-black uppercase tracking-wider border-b pb-0.5 mb-1 ${
                          accentColor === "indigo"
                            ? "text-indigo-900 border-indigo-200"
                            : accentColor === "blue"
                            ? "text-blue-900 border-blue-200"
                            : accentColor === "emerald"
                            ? "text-emerald-900 border-emerald-200"
                            : "text-slate-900 border-slate-300"
                        }`}
                      >
                        Education
                      </h2>
                      <div className="space-y-1.5">
                        {resume.education.map((edu) => (
                          <div key={edu.id} className="text-[11.5px]">
                            <div className="flex items-center justify-between font-bold text-slate-900">
                              <span>{edu.institution}</span>
                              <span className="text-slate-600 font-normal text-[11px]">{edu.location}</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-700 italic">
                              <span>{edu.degree}</span>
                              <span className="text-slate-600 not-italic font-medium text-[11px]">
                                {edu.startDate} – {edu.endDate}
                              </span>
                            </div>
                            {edu.gpa && (
                              <div className="text-slate-800 font-semibold text-[11px]">
                                {edu.gpa}
                              </div>
                            )}
                            {showCoursework && edu.coursework && (
                              <div className="text-slate-600 text-[10.5px]">
                                <span className="font-semibold text-slate-700">Relevant Coursework:</span> {edu.coursework}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. TECHNICAL SKILLS */}
                  {(resume.skills.languages ||
                    resume.skills.frameworks ||
                    resume.skills.developerTools ||
                    resume.skills.coreConcepts) && (
                    <div
                      id="ats-preview-skills"
                      className={`mb-3 transition-all duration-300 ${
                        highlightedAtsSection === "skills"
                          ? "ring-4 ring-indigo-500/50 bg-indigo-50/60 rounded-xl p-2.5 shadow-md"
                          : ""
                      }`}
                    >
                      {highlightedAtsSection === "skills" && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white font-black text-[9px] shadow-sm animate-pulse mb-1">
                          <Zap className="w-2.5 h-2.5 text-amber-300" />
                          <span>ATS Optimization Target: Categorized Skills</span>
                        </div>
                      )}
                      <h2
                        className={`text-xs font-black uppercase tracking-wider border-b pb-0.5 mb-1 ${
                          accentColor === "indigo"
                            ? "text-indigo-900 border-indigo-200"
                            : accentColor === "blue"
                            ? "text-blue-900 border-blue-200"
                            : accentColor === "emerald"
                            ? "text-emerald-900 border-emerald-200"
                            : "text-slate-900 border-slate-300"
                        }`}
                      >
                        Technical Skills
                      </h2>
                      <div className="space-y-0.5 text-[11.5px] text-slate-800">
                        {resume.skills.languages && (
                          <div>
                            <span className="font-bold text-slate-900">Languages:</span>{" "}
                            <span className="text-slate-700">{resume.skills.languages}</span>
                          </div>
                        )}
                        {resume.skills.frameworks && (
                          <div>
                            <span className="font-bold text-slate-900">Frameworks & Libraries:</span>{" "}
                            <span className="text-slate-700">{resume.skills.frameworks}</span>
                          </div>
                        )}
                        {resume.skills.developerTools && (
                          <div>
                            <span className="font-bold text-slate-900">Developer Tools & Cloud:</span>{" "}
                            <span className="text-slate-700">{resume.skills.developerTools}</span>
                          </div>
                        )}
                        {resume.skills.coreConcepts && (
                          <div>
                            <span className="font-bold text-slate-900">Core Concepts:</span>{" "}
                            <span className="text-slate-700">{resume.skills.coreConcepts}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 5. EXPERIENCE */}
                  {resume.experience.length > 0 && (
                    <div
                      id="ats-preview-experience"
                      className={`mb-3 transition-all duration-300 ${
                        highlightedAtsSection === "experience" || highlightedAtsSection === "verbs"
                          ? "ring-4 ring-indigo-500/50 bg-indigo-50/60 rounded-xl p-2.5 shadow-md"
                          : ""
                      }`}
                    >
                      {(highlightedAtsSection === "experience" || highlightedAtsSection === "verbs") && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white font-black text-[9px] shadow-sm animate-pulse mb-1">
                          <Zap className="w-2.5 h-2.5 text-amber-300" />
                          <span>ATS Optimization Target: Action Verbs & Experience</span>
                        </div>
                      )}
                      <h2
                        className={`text-xs font-black uppercase tracking-wider border-b pb-0.5 mb-1 ${
                          accentColor === "indigo"
                            ? "text-indigo-900 border-indigo-200"
                            : accentColor === "blue"
                            ? "text-blue-900 border-blue-200"
                            : accentColor === "emerald"
                            ? "text-emerald-900 border-emerald-200"
                            : "text-slate-900 border-slate-300"
                        }`}
                      >
                        Work Experience
                      </h2>
                      <div className="space-y-2">
                        {resume.experience.map((exp) => (
                          <div key={exp.id} className="text-[11.5px]">
                            <div className="flex items-center justify-between font-bold text-slate-900">
                              <span>{exp.role}</span>
                              <span className="text-slate-600 font-normal text-[11px]">
                                {exp.startDate} – {exp.endDate}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-slate-700 italic mb-0.5">
                              <span>{exp.company}</span>
                              <span className="text-slate-600 not-italic text-[11px]">{exp.location}</span>
                            </div>
                            <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-[11px] leading-relaxed">
                              {exp.bullets.map((bullet, idx) => (
                                <li key={idx}>{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 6. PROJECTS */}
                  {resume.projects.length > 0 && (
                    <div
                      id="ats-preview-projects"
                      className={`mb-3 transition-all duration-300 ${
                        highlightedAtsSection === "projects" || highlightedAtsSection === "metrics"
                          ? "ring-4 ring-indigo-500/50 bg-indigo-50/60 rounded-xl p-2.5 shadow-md"
                          : ""
                      }`}
                    >
                      {(highlightedAtsSection === "projects" || highlightedAtsSection === "metrics") && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white font-black text-[9px] shadow-sm animate-pulse mb-1">
                          <Zap className="w-2.5 h-2.5 text-amber-300" />
                          <span>ATS Optimization Target: Quantified XYZ Metrics (% or scale)</span>
                        </div>
                      )}
                      <h2
                        className={`text-xs font-black uppercase tracking-wider border-b pb-0.5 mb-1 ${
                          accentColor === "indigo"
                            ? "text-indigo-900 border-indigo-200"
                            : accentColor === "blue"
                            ? "text-blue-900 border-blue-200"
                            : accentColor === "emerald"
                            ? "text-emerald-900 border-emerald-200"
                            : "text-slate-900 border-slate-300"
                        }`}
                      >
                        Projects
                      </h2>
                      <div className="space-y-2">
                        {resume.projects.map((proj) => (
                          <div key={proj.id} className="text-[11.5px]">
                            <div className="flex items-center justify-between font-bold text-slate-900">
                              <span>
                                {proj.title}{" "}
                                {proj.techStack && (
                                  <span className="font-normal text-slate-600 italic">
                                    | {proj.techStack}
                                  </span>
                                )}
                              </span>
                              <div className="text-[10px] text-slate-500 font-normal flex items-center gap-2">
                                {proj.link && <span>{proj.link}</span>}
                                {proj.github && <span>{proj.github}</span>}
                              </div>
                            </div>
                            <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-[11px] leading-relaxed mt-0.5">
                              {proj.bullets.map((b, idx) => (
                                <li key={idx}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 7. ACHIEVEMENTS */}
                  {resume.achievements.length > 0 && (
                    <div
                      id="ats-preview-achievements"
                      className={`transition-all duration-300 ${
                        highlightedAtsSection === "achievements"
                          ? "ring-4 ring-indigo-500/50 bg-indigo-50/60 rounded-xl p-2.5 shadow-md"
                          : ""
                      }`}
                    >
                      {highlightedAtsSection === "achievements" && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white font-black text-[9px] shadow-sm animate-pulse mb-1">
                          <Zap className="w-2.5 h-2.5 text-amber-300" />
                          <span>ATS Optimization Target: Honors & Achievements</span>
                        </div>
                      )}
                      <h2
                        className={`text-xs font-black uppercase tracking-wider border-b pb-0.5 mb-1 ${
                          accentColor === "indigo"
                            ? "text-indigo-900 border-indigo-200"
                            : accentColor === "blue"
                            ? "text-blue-900 border-blue-200"
                            : accentColor === "emerald"
                            ? "text-emerald-900 border-emerald-200"
                            : "text-slate-900 border-slate-300"
                        }`}
                      >
                        Honors & Achievements
                      </h2>
                      <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-[11px] leading-relaxed">
                        {resume.achievements.map((ach, idx) => (
                          <li key={idx}>{ach}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HYBRID AI ASSISTANT & STEP-BY-STEP RESUME WIZARD MODAL */}
      {/* ========================================================================= */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 via-purple-50/40 to-transparent dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>AI Resume Assistant Hub</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                      Step-by-Step Wizard
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Generate an ATS-ready student resume in minutes by answering a few quick questions.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Switcher */}
            <div className="flex items-center p-2 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 gap-1.5 text-xs font-bold overflow-x-auto">
              <button
                type="button"
                onClick={() => setAiActiveTab("wizard")}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  aiActiveTab === "wizard"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>✨ Step-by-Step Creator</span>
              </button>
              <button
                type="button"
                onClick={() => setAiActiveTab("smart_roles")}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  aiActiveTab === "smart_roles"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-indigo-500" />
                <span>1-Click Role Bios</span>
              </button>
              <button
                type="button"
                onClick={() => setAiActiveTab("bullet_builder")}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  aiActiveTab === "bullet_builder"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Wand2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Bullet Architect</span>
              </button>
              <button
                type="button"
                onClick={() => setAiActiveTab("jd_scanner")}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  aiActiveTab === "jd_scanner"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Target className="w-3.5 h-3.5 text-emerald-500" />
                <span>Job ATS Scanner</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {/* ================================================================= */}
              {/* TAB 1: STEP-BY-STEP AI RESUME WIZARD */}
              {/* ================================================================= */}
              {aiActiveTab === "wizard" && (
                <div className="space-y-4">
                  {/* Wizard Step Progress Tracker */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white text-xs font-black flex items-center justify-center shadow-sm">
                        {wizardStep}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Step {wizardStep} of 6
                          </span>
                          {wizardStepStats.isValid ? (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" /> Ready
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                              {wizardStepStats.filled}/{wizardStepStats.total} filled
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">
                          {wizardStep === 1 && "Target Role & Contact Info"}
                          {wizardStep === 2 && "University & Education"}
                          {wizardStep === 3 && "Core Technical Skills"}
                          {wizardStep === 4 && "Work Experience / Internships"}
                          {wizardStep === 5 && "Key Projects & Creations"}
                          {wizardStep === 6 && "Honors & Review"}
                        </h4>
                      </div>
                    </div>
                    {/* Quick Demo Pre-fill */}
                    <button
                      type="button"
                      onClick={() => {
                        setWizardData({
                          fullName: "Alex Chen",
                          targetRole: "Software Engineering & Full Stack",
                          email: "alex.chen@university.edu",
                          phone: "+1 (555) 234-5678",
                          location: "Boston, MA",
                          linkedin: "linkedin.com/in/alexchen-tech",
                          github: "github.com/alexchen-dev",
                          portfolio: "alexchen.dev",
                          university: "State University of Technology",
                          degree: "B.S. in Computer Science & Engineering",
                          graduationYear: "2026 (Expected)",
                          gpa: "CGPA: 9.24 / 10.00",
                          coursework: "Data Structures, Algorithms, Distributed Systems, Database Systems",
                          languages: "TypeScript, JavaScript, Python, C++, Java, SQL",
                          frameworks: "React, Next.js, Node.js, Express, Tailwind CSS",
                          tools: "Git, Docker, AWS (S3, Lambda), Linux, Redis",
                          hasExperience: true,
                          company: "Acme Cloud Technologies",
                          experienceRole: "Software Engineering Intern",
                          experienceDates: "Jun 2024 – Aug 2024",
                          experienceNotes: "Architected microservices in Node.js, optimized SQL queries by 32%, integrated automated testing.",
                          project1Title: "DevSprint Real-Time Workspace",
                          project1Tech: "Next.js 14, TypeScript, WebSockets, Redis",
                          project1Notes: "Multi-user collaborative code editor with real-time operational transformation.",
                          project2Title: "SmartCampus AI Lecture Synthesizer",
                          project2Tech: "Python, FastAPI, OpenAI Whisper, LangChain",
                          project2Notes: "Automated pipeline extracting timestamps and notes from recorded audio.",
                          achievements: "1st Place Winner — University Hackathon 2024\nDean's Honor List for 5 consecutive semesters",
                        });
                        setWizardAttemptedNext(false);
                      }}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto bg-indigo-50/80 dark:bg-indigo-950/60 px-2.5 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800"
                    >
                      <Zap className="w-3 h-3 text-amber-500" />
                      Auto-Fill Sample Data
                    </button>
                  </div>

                  {/* 6-Step Navigation Pills */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    {[
                      { num: 1, label: "Role & Contact", valid: isStep1Valid },
                      { num: 2, label: "Education", valid: isStep2Valid },
                      { num: 3, label: "Skills", valid: isStep3Valid },
                      { num: 4, label: "Experience", valid: isStep4Valid },
                      { num: 5, label: "Projects", valid: isStep5Valid },
                      { num: 6, label: "Honors", valid: isStep6Valid },
                    ].map((s) => {
                      const isCurrent = wizardStep === s.num;
                      const isCompleted = s.num < wizardStep && s.valid;
                      const canJump = s.num <= wizardStep;

                      return (
                        <button
                          key={s.num}
                          type="button"
                          disabled={!canJump}
                          onClick={() => {
                            if (canJump) {
                              setWizardStep(s.num);
                              setWizardAttemptedNext(false);
                            }
                          }}
                          className={`py-1.5 px-2 rounded-xl text-center flex flex-col items-center gap-0.5 transition-all ${
                            isCurrent
                              ? "bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-500/25"
                              : isCompleted
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 cursor-pointer"
                              : canJump
                              ? "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                              : "text-slate-400 dark:text-slate-600 opacity-40 cursor-not-allowed"
                          }`}
                        >
                          <span className="text-[10px] flex items-center gap-1 font-bold">
                            {isCompleted ? (
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              `Step ${s.num}`
                            )}
                          </span>
                          <span className="text-[9px] truncate max-w-full font-medium hidden sm:inline">
                            {s.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* STEP 1: TARGET ROLE & CONTACT */}
                  {wizardStep === 1 && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          1. Choose Your Target Job Discipline:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                          {ROLE_PRESETS.map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleSelectWizardRole(preset)}
                              className={`p-2 rounded-xl text-left border text-[11px] font-bold transition-all cursor-pointer ${
                                wizardData.targetRole === preset.role
                                  ? "bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs"
                                  : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300"
                              }`}
                            >
                              <span className="block truncate">{preset.role}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                            Full Name <span className="text-rose-500">*</span> <span className="text-[9px] text-rose-500/80 font-normal">(Required)</span>
                          </label>
                          <input
                            type="text"
                            value={wizardData.fullName}
                            onChange={(e) => setWizardData({ ...wizardData, fullName: e.target.value })}
                            placeholder="e.g. Alex Chen"
                            className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-colors ${
                              wizardAttemptedNext && !wizardData.fullName.trim()
                                ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 placeholder:text-rose-400"
                                : wizardData.fullName.trim()
                                ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-900 dark:text-slate-100"
                                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                            Target Role Title <span className="text-rose-500">*</span> <span className="text-[9px] text-rose-500/80 font-normal">(Required)</span>
                          </label>
                          <input
                            type="text"
                            value={wizardData.targetRole}
                            onChange={(e) => setWizardData({ ...wizardData, targetRole: e.target.value })}
                            placeholder="e.g. Software Engineering & Full Stack"
                            className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-colors ${
                              wizardAttemptedNext && !wizardData.targetRole.trim()
                                ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 placeholder:text-rose-400"
                                : wizardData.targetRole.trim()
                                ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-900 dark:text-slate-100"
                                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                              Email <span className="text-rose-500">*</span> <span className="text-[9px] text-rose-500/80 font-normal">(Required)</span>
                            </label>
                            {wizardData.email.trim() && (
                              <span className={`text-[9px] font-bold ${isValidEmail(wizardData.email) ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                                {isValidEmail(wizardData.email) ? "✓ Valid" : "✕ Invalid"}
                              </span>
                            )}
                          </div>
                          <input
                            type="email"
                            value={wizardData.email}
                            onChange={(e) => setWizardData({ ...wizardData, email: e.target.value.trim() })}
                            placeholder="alex@college.edu"
                            className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-colors ${
                              (wizardAttemptedNext && !wizardData.email.trim()) || (wizardData.email.trim() && !isValidEmail(wizardData.email))
                                ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 placeholder:text-rose-400 ring-1 ring-rose-400/40"
                                : isValidEmail(wizardData.email)
                                ? "border-emerald-400 dark:border-emerald-700 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-900 dark:text-slate-100 ring-1 ring-emerald-400/30"
                                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                            }`}
                          />
                          {wizardData.email.trim() && !isValidEmail(wizardData.email) && (
                            <p className="text-[9px] text-rose-500 font-semibold mt-1">
                              Enter valid email (e.g. name@university.edu)
                            </p>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                              Phone <span className="text-rose-500">*</span> <span className="text-[9px] text-rose-500/80 font-normal">(Required)</span>
                            </label>
                            {wizardData.phone.trim() && (
                              <span className={`text-[9px] font-bold ${isValidPhone(wizardData.phone) ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                                {isValidPhone(wizardData.phone) ? "✓ Valid" : "✕ Digits only"}
                              </span>
                            )}
                          </div>
                          <CountryPhoneInput
                            value={wizardData.phone}
                            onChange={(val) => setWizardData({ ...wizardData, phone: val })}
                            isError={Boolean((wizardAttemptedNext && !wizardData.phone.trim()) || (wizardData.phone.trim() && !isValidPhone(wizardData.phone)))}
                            isValid={Boolean(wizardData.phone.trim() && isValidPhone(wizardData.phone))}
                            placeholder="98765 43210"
                          />
                          {wizardData.phone.trim() && !isValidPhone(wizardData.phone) && (
                            <p className="text-[9px] text-rose-500 font-semibold mt-1">
                              Only phone numbers allowed (min 7-15 digits)
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            Location <span className="text-rose-500">*</span> <span className="text-[9px] text-rose-500/80 font-normal">(Required)</span>
                          </label>
                          {wizardData.location.trim() && (
                            <span className={`text-[9px] font-bold ${isValidLocation(wizardData.location) ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                              {isValidLocation(wizardData.location) ? "✓ Valid" : "✕ Too short"}
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={wizardData.location}
                          onChange={(e) => setWizardData({ ...wizardData, location: e.target.value })}
                          placeholder="Boston, MA"
                          className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-colors ${
                            wizardAttemptedNext && (!wizardData.location.trim() || !isValidLocation(wizardData.location))
                              ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 placeholder:text-rose-400 ring-1 ring-rose-400/40"
                              : isValidLocation(wizardData.location)
                              ? "border-emerald-400 dark:border-emerald-700 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-900 dark:text-slate-100 ring-1 ring-emerald-400/30"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                          }`}
                        />
                      </div>

                      {/* Step 1 Error Feedback */}
                      {wizardAttemptedNext && !isStep1Valid && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] font-semibold animate-in fade-in">
                          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                          <span>
                            Please enter all {wizardStepStats.missing.length} missing required details:{" "}
                            <strong>{wizardStepStats.missing.join(", ")}</strong> to proceed.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 2: EDUCATION */}
                  {wizardStep === 2 && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                            College / University Name <span className="text-rose-500">*</span> <span className="text-[9px] text-rose-500/80 font-normal">(Required)</span>
                          </label>
                          <input
                            type="text"
                            value={wizardData.university}
                            onChange={(e) => setWizardData({ ...wizardData, university: e.target.value })}
                            placeholder="e.g. State University of Technology"
                            className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-colors ${
                              wizardAttemptedNext && !wizardData.university.trim()
                                ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 placeholder:text-rose-400"
                                : wizardData.university.trim()
                                ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-900 dark:text-slate-100"
                                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                            Degree & Major <span className="text-rose-500">*</span> <span className="text-[9px] text-rose-500/80 font-normal">(Required)</span>
                          </label>
                          <input
                            type="text"
                            value={wizardData.degree}
                            onChange={(e) => setWizardData({ ...wizardData, degree: e.target.value })}
                            placeholder="e.g. Bachelor of Science in Computer Science"
                            className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-colors ${
                              wizardAttemptedNext && !wizardData.degree.trim()
                                ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 placeholder:text-rose-400"
                                : wizardData.degree.trim()
                                ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-900 dark:text-slate-100"
                                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                            Graduation Year <span className="text-rose-500">*</span> <span className="text-[9px] text-rose-500/80 font-normal">(Required)</span>
                          </label>
                          <input
                            type="text"
                            value={wizardData.graduationYear}
                            onChange={(e) => setWizardData({ ...wizardData, graduationYear: e.target.value })}
                            placeholder="e.g. 2026 (Expected)"
                            className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-colors ${
                              wizardAttemptedNext && !wizardData.graduationYear.trim()
                                ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 placeholder:text-rose-400"
                                : wizardData.graduationYear.trim()
                                ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-900 dark:text-slate-100"
                                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                            GPA / CGPA <span className="text-rose-500">*</span> <span className="text-[9px] text-rose-500/80 font-normal">(Required)</span>
                          </label>
                          <input
                            type="text"
                            value={wizardData.gpa}
                            onChange={(e) => setWizardData({ ...wizardData, gpa: e.target.value })}
                            placeholder="e.g. CGPA: 9.1 / 10.0"
                            className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-colors ${
                              wizardAttemptedNext && !wizardData.gpa?.trim()
                                ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 placeholder:text-rose-400"
                                : wizardData.gpa?.trim()
                                ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-900 dark:text-slate-100"
                                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                          Key Relevant Coursework <span className="text-[9px] text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={wizardData.coursework}
                          onChange={(e) => setWizardData({ ...wizardData, coursework: e.target.value })}
                          placeholder="Data Structures, Algorithms, Operating Systems, Computer Networks"
                          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                        />
                      </div>

                      {/* Step 2 Error Feedback */}
                      {wizardAttemptedNext && !isStep2Valid && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] font-semibold animate-in fade-in">
                          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                          <span>
                            Please enter all {wizardStepStats.missing.length} missing education details:{" "}
                            <strong>{wizardStepStats.missing.join(", ")}</strong> to proceed.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 3: TECHNICAL SKILLS */}
                  {wizardStep === 3 && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                          Programming Languages <span className="text-rose-500">*</span> <span className="text-[9px] text-rose-500/80 font-normal">(Required)</span>
                        </label>
                        <input
                          type="text"
                          value={wizardData.languages}
                          onChange={(e) => setWizardData({ ...wizardData, languages: e.target.value })}
                          placeholder="e.g. TypeScript, JavaScript, Python, C++, Java, SQL"
                          className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-colors ${
                            wizardAttemptedNext && !wizardData.languages.trim()
                              ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 placeholder:text-rose-400"
                              : wizardData.languages.trim()
                              ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-900 dark:text-slate-100"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                          Frameworks & Libraries <span className="text-rose-500">*</span> <span className="text-[9px] text-rose-500/80 font-normal">(Required)</span>
                        </label>
                        <input
                          type="text"
                          value={wizardData.frameworks}
                          onChange={(e) => setWizardData({ ...wizardData, frameworks: e.target.value })}
                          placeholder="e.g. React, Next.js, Node.js, Express, Tailwind CSS, PyTorch"
                          className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-colors ${
                            wizardAttemptedNext && !wizardData.frameworks.trim()
                              ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 placeholder:text-rose-400"
                              : wizardData.frameworks.trim()
                              ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-900 dark:text-slate-100"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                          Developer Tools, Cloud & Databases <span className="text-rose-500">*</span> <span className="text-[9px] text-rose-500/80 font-normal">(Required)</span>
                        </label>
                        <input
                          type="text"
                          value={wizardData.tools}
                          onChange={(e) => setWizardData({ ...wizardData, tools: e.target.value })}
                          placeholder="e.g. Git, Docker, AWS (S3, Lambda), PostgreSQL, Redis, Linux"
                          className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-colors ${
                            wizardAttemptedNext && !wizardData.tools.trim()
                              ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 placeholder:text-rose-400"
                              : wizardData.tools.trim()
                              ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-900 dark:text-slate-100"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                          }`}
                        />
                      </div>

                      {/* Step 3 Error Feedback */}
                      {wizardAttemptedNext && !isStep3Valid && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] font-semibold animate-in fade-in">
                          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                          <span>
                            Please enter all {wizardStepStats.missing.length} missing skill categories:{" "}
                            <strong>{wizardStepStats.missing.join(", ")}</strong> to proceed.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 4: EXPERIENCE */}
                  {wizardStep === 4 && (
                    <div className="space-y-3.5">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={wizardData.hasExperience}
                            onChange={(e) => setWizardData({ ...wizardData, hasExperience: e.target.checked })}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                          />
                          <span>I have an Internship or Work Experience</span>
                        </label>
                      </div>

                      {wizardData.hasExperience ? (
                        <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                                Company Name <span className="text-rose-500">*</span> <span className="text-[9px] text-rose-500/80 font-normal">(Required)</span>
                              </label>
                              <input
                                type="text"
                                value={wizardData.company}
                                onChange={(e) => setWizardData({ ...wizardData, company: e.target.value })}
                                placeholder="e.g. Acme Cloud Technologies"
                                className={`w-full p-2 rounded-xl border text-xs font-semibold focus:outline-none transition-colors ${
                                  wizardAttemptedNext && !wizardData.company?.trim()
                                    ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 placeholder:text-rose-400"
                                    : wizardData.company?.trim()
                                    ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-900 dark:text-slate-100"
                                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                                }`}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                                Job Role <span className="text-rose-500">*</span> <span className="text-[9px] text-rose-500/80 font-normal">(Required)</span>
                              </label>
                              <input
                                type="text"
                                value={wizardData.experienceRole}
                                onChange={(e) => setWizardData({ ...wizardData, experienceRole: e.target.value })}
                                placeholder="e.g. Software Engineering Intern"
                                className={`w-full p-2 rounded-xl border text-xs font-semibold focus:outline-none transition-colors ${
                                  wizardAttemptedNext && !wizardData.experienceRole?.trim()
                                    ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 placeholder:text-rose-400"
                                    : wizardData.experienceRole?.trim()
                                    ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-900 dark:text-slate-100"
                                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                                }`}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                              Rough Notes / Key Deliverables (AI will convert to XYZ bullets) <span className="text-rose-500">*</span> <span className="text-[9px] text-rose-500/80 font-normal">(Required)</span>
                            </label>
                            <textarea
                              rows={3}
                              value={wizardData.experienceNotes}
                              onChange={(e) => setWizardData({ ...wizardData, experienceNotes: e.target.value })}
                              placeholder="e.g. Built microservices, improved API response times by 30%, wrote automated tests..."
                              className={`w-full p-2 rounded-xl border text-xs font-medium focus:outline-none transition-colors ${
                                wizardAttemptedNext && !wizardData.experienceNotes?.trim()
                                  ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 placeholder:text-rose-400"
                                  : wizardData.experienceNotes?.trim()
                                  ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-900 dark:text-slate-100"
                                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                              }`}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-slate-700 dark:text-slate-300 flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-0.5">
                              🎓 Student Fresher Format Enabled:
                            </span>
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              No prior corporate experience needed! The AI builder will highlight your top academic projects, practical code repositories, and relevant coursework.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Step 4 Error Feedback */}
                      {wizardAttemptedNext && !isStep4Valid && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] font-semibold animate-in fade-in">
                          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                          <span>
                            Please enter all {wizardStepStats.missing.length} missing experience fields:{" "}
                            <strong>{wizardStepStats.missing.join(", ")}</strong> (or uncheck the box if fresher).
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 5: PROJECTS */}
                  {wizardStep === 5 && (
                    <div className="space-y-3.5">
                      {/* Project 1 */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                        <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                          <span>Project #1 (Primary) <span className="text-rose-500">*</span></span>
                          <span className="text-[9px] text-rose-500 font-normal">All 3 fields required</span>
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                              Project Title <span className="text-rose-500">*</span> <span className="text-[9px] text-rose-500/80 font-normal">(Required)</span>
                            </label>
                            <input
                              type="text"
                              value={wizardData.project1Title}
                              onChange={(e) => setWizardData({ ...wizardData, project1Title: e.target.value })}
                              placeholder="Project Title (e.g. DevSprint Code Editor)"
                              className={`w-full p-2 rounded-xl border text-xs font-semibold focus:outline-none transition-colors ${
                                wizardAttemptedNext && !wizardData.project1Title?.trim()
                                  ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 placeholder:text-rose-400"
                                  : wizardData.project1Title?.trim()
                                  ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-900 dark:text-slate-100"
                                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                              }`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                              Tech Stack <span className="text-rose-500">*</span> <span className="text-[9px] text-rose-500/80 font-normal">(Required)</span>
                            </label>
                            <input
                              type="text"
                              value={wizardData.project1Tech}
                              onChange={(e) => setWizardData({ ...wizardData, project1Tech: e.target.value })}
                              placeholder="Tech Stack (e.g. Next.js, Redis, WebSockets)"
                              className={`w-full p-2 rounded-xl border text-xs font-semibold focus:outline-none transition-colors ${
                                wizardAttemptedNext && !wizardData.project1Tech?.trim()
                                  ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 placeholder:text-rose-400"
                                  : wizardData.project1Tech?.trim()
                                  ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-900 dark:text-slate-100"
                                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                              }`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                            What did you build? What was the outcome or impact? <span className="text-rose-500">*</span> <span className="text-[9px] text-rose-500/80 font-normal">(Required)</span>
                          </label>
                          <textarea
                            rows={2}
                            value={wizardData.project1Notes}
                            onChange={(e) => setWizardData({ ...wizardData, project1Notes: e.target.value })}
                            placeholder="Built multi-user code editor with real-time sync and Redis queues..."
                            className={`w-full p-2 rounded-xl border text-xs font-medium focus:outline-none transition-colors ${
                              wizardAttemptedNext && !wizardData.project1Notes?.trim()
                                ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 placeholder:text-rose-400"
                                : wizardData.project1Notes?.trim()
                                ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-900 dark:text-slate-100"
                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Project 2 */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                        <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                          Project #2 <span className="text-[9px] text-slate-400 font-normal">(Optional)</span>
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={wizardData.project2Title}
                            onChange={(e) => setWizardData({ ...wizardData, project2Title: e.target.value })}
                            placeholder="Project Title (e.g. SmartCampus AI Note Synthesizer)"
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
                          />
                          <input
                            type="text"
                            value={wizardData.project2Tech}
                            onChange={(e) => setWizardData({ ...wizardData, project2Tech: e.target.value })}
                            placeholder="Tech Stack (e.g. Python, FastAPI, OpenAI)"
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none"
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={wizardData.project2Notes}
                          onChange={(e) => setWizardData({ ...wizardData, project2Notes: e.target.value })}
                          placeholder="Brief notes about the second project (Optional)..."
                          className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium focus:outline-none"
                        />
                      </div>

                      {/* Step 5 Error Feedback */}
                      {wizardAttemptedNext && !isStep5Valid && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] font-semibold animate-in fade-in">
                          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                          <span>
                            Please enter all {wizardStepStats.missing.length} missing project details:{" "}
                            <strong>{wizardStepStats.missing.join(", ")}</strong> to proceed.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 6: HONORS & SYNTHESIS */}
                  {wizardStep === 6 && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                          Honors, Hackathons & Key Achievements <span className="text-rose-500">*</span> <span className="text-[9px] text-rose-500/80 font-normal">(Required)</span>
                        </label>
                        <textarea
                          rows={3}
                          value={wizardData.achievements}
                          onChange={(e) => setWizardData({ ...wizardData, achievements: e.target.value })}
                          placeholder="e.g. 1st Place Winner at Collegiate Hackathon 2024&#10;Dean's Academic Honor List for 5 consecutive semesters"
                          className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none transition-colors ${
                            wizardAttemptedNext && !wizardData.achievements?.trim()
                              ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 placeholder:text-rose-400"
                              : wizardData.achievements?.trim()
                              ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-900 dark:text-slate-100"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                          }`}
                        />
                      </div>

                      {/* Ready Summary Card */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-cyan-50/40 dark:from-indigo-950/60 dark:via-purple-950/40 dark:to-cyan-950/30 border border-indigo-200 dark:border-indigo-800 space-y-2">
                        <span className="text-xs font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-indigo-500" />
                          Ready to Generate Your Resume!
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                          The AI engine will synthesize your inputs, generate Google XYZ bullet formulas, structure technical competencies, and output a standard 1-page ATS resume.
                        </p>
                      </div>

                      {/* Step 6 Error Feedback */}
                      {wizardAttemptedNext && !isStep6Valid && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] font-semibold animate-in fade-in">
                          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                          <span>Please fill in at least one honor, hackathon, or achievement to generate your resume.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Wizard Step Navigation Footer with Strict Validation */}
                  <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 gap-2">
                    {wizardStep > 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setWizardStep((s) => s - 1);
                          setWizardAttemptedNext(false);
                        }}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    {/* Real-time Field Progress Indicator */}
                    <div className="text-center hidden xs:block">
                      {wizardStepStats.isValid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          All {wizardStepStats.total} details filled ✓
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/60">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                          {wizardStepStats.filled} of {wizardStepStats.total} details entered
                        </span>
                      )}
                    </div>

                    {wizardStep < 6 ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (!isCurrentWizardStepValid) {
                            setWizardAttemptedNext(true);
                            return;
                          }
                          setWizardAttemptedNext(false);
                          setWizardStep((s) => s + 1);
                        }}
                        disabled={!isCurrentWizardStepValid}
                        title={
                          !isCurrentWizardStepValid
                            ? `Please fill in all ${wizardStepStats.total} required details to continue`
                            : "Proceed to next step"
                        }
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                          isCurrentWizardStepValid
                            ? "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-md shadow-indigo-500/25 hover:scale-102 cursor-pointer"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700 shadow-none opacity-60"
                        }`}
                      >
                        <span>Next Step</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleExecuteAiWizard}
                        disabled={isAiLoading || !isStep6Valid}
                        className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all ${
                          isStep6Valid && !isAiLoading
                            ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-lg shadow-indigo-500/25 hover:scale-102 cursor-pointer"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700 shadow-none opacity-60"
                        }`}
                      >
                        {isAiLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                        )}
                        <span>{isAiLoading ? "Synthesizing Resume..." : "🚀 Generate Full ATS Resume"}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* TAB 2: 1-CLICK ROLE BIOS */}
              {/* ================================================================= */}
              {aiActiveTab === "smart_roles" && (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-slate-700 dark:text-slate-300 leading-relaxed">
                    <p className="font-bold text-indigo-900 dark:text-indigo-300 mb-0.5">
                      ⚡ Instant ATS Summaries:
                    </p>
                    Select your target tech discipline to instantly apply an ATS-optimized professional summary and title.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ROLE_PRESETS.map((preset) => (
                      <div
                        key={preset.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                            {preset.category}
                          </span>
                          <h4 className="font-black text-slate-900 dark:text-slate-100 text-xs mt-0.5 mb-1.5">
                            {preset.role}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                            {preset.suggestedSummary}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApplyRolePreset(preset)}
                          className="mt-3 w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          Apply to Resume
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================================================================= */}
              {/* TAB 3: BULLET ARCHITECT */}
              {/* ================================================================= */}
              {aiActiveTab === "bullet_builder" && (
                <div className="space-y-3.5">
                  <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 text-slate-700 dark:text-slate-300 leading-relaxed">
                    <p className="font-bold text-purple-900 dark:text-purple-300 mb-0.5">
                      Google XYZ Bullet Formula:
                    </p>
                    Type any rough draft or task you did. The AI will convert it into a strong bullet formatted as:
                    <span className="italic block mt-0.5 text-slate-600 dark:text-slate-400">
                      "Accomplished [X] as measured by [Y], by doing [Z]"
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Raw Bullet / Task Idea:
                    </label>
                    <textarea
                      rows={3}
                      value={rawBulletInput}
                      onChange={(e) => setRawBulletInput(e.target.value)}
                      placeholder="e.g. I made an express api that handles student registration and reduced the response time"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateBulletInModal}
                    disabled={!rawBulletInput.trim() || isAiLoading}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/20 cursor-pointer"
                  >
                    {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    <span>Transform into Impact Bullet</span>
                  </button>

                  {generatedBulletResult && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                        ✨ ATS Optimized Result:
                      </span>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                        • {generatedBulletResult}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedBulletResult);
                          alert("Copied to clipboard!");
                        }}
                        className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Bullet</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ================================================================= */}
              {/* TAB 4: JOB DESCRIPTION ATS SCANNER */}
              {/* ================================================================= */}
              {aiActiveTab === "jd_scanner" && (
                <div className="space-y-4">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Paste Internship / Job Description:
                    </label>
                    <textarea
                      rows={4}
                      value={jobDescriptionText}
                      onChange={(e) => setJobDescriptionText(e.target.value)}
                      placeholder="Paste the job requirements, tech stack, and responsibilities here..."
                      className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleScanJobDescription}
                    disabled={!jobDescriptionText.trim()}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
                  >
                    <Target className="w-4 h-4" />
                    <span>Scan Resume Against Job Description</span>
                  </button>

                  {atsAnalysis && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          ATS Keyword Match Score:
                        </span>
                        <span
                          className={`text-sm font-black px-2.5 py-0.5 rounded-full ${
                            atsAnalysis.score >= 70
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {atsAnalysis.score}% Match
                        </span>
                      </div>

                      {/* Found Keywords */}
                      <div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                          ✓ Matched Keywords Found in Your Resume:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {atsAnalysis.foundKeywords.map((kw, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px] border border-emerald-200 dark:border-emerald-800"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Missing Keywords */}
                      {atsAnalysis.missingKeywords.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block mb-1">
                            ⚠️ Missing Keywords (Click to add to your skills list):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {atsAnalysis.missingKeywords.map((kw, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleAddMissingKeyword(kw)}
                                className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-semibold text-[10px] border border-rose-200 dark:border-rose-800 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <span>+ {kw}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium truncate mr-2">
                {isAiLoading ? aiStatusMsg : "⚡ 100% Free & In-Browser: Zero API keys or login required."}
              </span>
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs cursor-pointer shrink-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
