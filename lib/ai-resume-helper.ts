/**
 * lib/ai-resume-helper.ts
 * Seamless AI engine for StudentToolkit Resume Builder.
 * Automatically tries the server-side Gemini Flash LLM proxy first;
 * if no server key is set or offline, falls back seamlessly to the In-Browser Smart Engine.
 */

export interface RolePreset {
  id: string;
  role: string;
  category: string;
  suggestedSummary: string;
  keywords: string[];
  sampleBullets: string[];
}

export const ROLE_PRESETS: RolePreset[] = [
  {
    id: "sde",
    role: "Software Engineering & Full Stack",
    category: "Computer Science",
    suggestedSummary:
      "Results-driven Computer Science student with strong foundations in full-stack architecture, data structures, and cloud-native systems. Experienced in developing high-throughput web applications with modern TypeScript, React, and Node.js frameworks.",
    keywords: ["TypeScript", "React", "Node.js", "REST APIs", "PostgreSQL", "Docker", "CI/CD", "Git", "Microservices"],
    sampleBullets: [
      "Architected responsive full-stack platform serving 3,500+ active users with 99.8% uptime.",
      "Optimized database indexing and SQL query pipelines, reducing server response latency by 42%.",
      "Integrated automated CI/CD workflows using GitHub Actions, streamlining deployment cycles by 60%.",
    ],
  },
  {
    id: "frontend",
    role: "Frontend & UI/UX Developer",
    category: "Web Development",
    suggestedSummary:
      "Passionate Frontend Developer focused on building accessible, high-performance web applications with Next.js, React, and Tailwind CSS. Proven ability to translate complex design specs into responsive, mobile-first interfaces.",
    keywords: ["React", "Next.js", "Tailwind CSS", "TypeScript", "Redux", "Web Performance", "Figma", "Accessibility (a11y)"],
    sampleBullets: [
      "Engineered dynamic UI design system with 25+ reusable components, reducing dev turnaround by 35%.",
      "Achieved 98+ Google Lighthouse performance scores by implementing lazy loading and asset bundling.",
      "Collaborated with cross-functional teams in Figma to prototype and deliver student-centric portal.",
    ],
  },
  {
    id: "ai_ds",
    role: "Data Science & AI / ML Specialist",
    category: "Data & AI",
    suggestedSummary:
      "Analytical Data Science undergraduate proficient in predictive modeling, NLP pipelines, and data visualization using Python, PyTorch, and SQL. Skilled at transforming raw datasets into actionable mathematical insights.",
    keywords: ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "Pandas", "SQL", "Tableau", "NLP", "Data Wrangling"],
    sampleBullets: [
      "Trained ensemble machine learning classifier on 100K+ data records, achieving 94.2% prediction accuracy.",
      "Automated end-to-end ETL data pipeline in Python & Pandas, cutting data preparation time by 5 hours weekly.",
      "Designed interactive analytics dashboards in Streamlit to visualize multi-dimensional academic metrics.",
    ],
  },
  {
    id: "backend_cloud",
    role: "Backend & Cloud Systems",
    category: "Cloud & DevOps",
    suggestedSummary:
      "Backend engineer specializing in distributed systems, RESTful microservices, and serverless architectures in Go, Python, and AWS. Dedicated to writing scalable, secure, and clean testable code.",
    keywords: ["Go", "Python", "AWS (S3, Lambda)", "PostgreSQL", "Redis", "Docker", "Kubernetes", "gRPC", "Kafka"],
    sampleBullets: [
      "Developed robust REST API backend in Go handling 10,000+ daily requests with sub-50ms latency.",
      "Implemented Redis caching layer, decreasing database load by 55% during peak campus registration hours.",
      "Containerized monolithic legacy apps with Docker and deployed scalable workloads on AWS.",
    ],
  },
  {
    id: "cyber",
    role: "Cybersecurity & Network Analyst",
    category: "Security",
    suggestedSummary:
      "Cybersecurity student with hands-on experience in vulnerability assessment, network defense, penetration testing, and security compliance. Active CTF participant with deep interest in zero-trust architecture.",
    keywords: ["Network Security", "Wireshark", "Linux", "Penetration Testing", "OWASP Top 10", "Python", "Cryptography", "Burp Suite"],
    sampleBullets: [
      "Conducted comprehensive vulnerability assessments across 15+ mock web apps identifying 8 critical OWASP risks.",
      "Engineered automated network traffic monitoring script in Python utilizing Scapy and Wireshark logs.",
      "Ranked top 10% in national collegiate Capture The Flag (CTF) security competitions.",
    ],
  },
  {
    id: "business_pm",
    role: "Business & Product Analyst",
    category: "Management & Tech",
    suggestedSummary:
      "Detail-oriented Business & Product Analyst student with strong analytical, requirement gathering, and stakeholder management skills. Adept at creating wireframes, user journeys, and data-driven product roadmaps.",
    keywords: ["Agile/Scrum", "User Stories", "Jira", "SQL", "Tableau", "Market Research", "Product Roadmapping", "A/B Testing"],
    sampleBullets: [
      "Synthesized user feedback from 400+ campus survey respondents to prioritize core product feature roadmap.",
      "Created detailed user flow diagrams and PRDs in Jira, accelerating development sprint velocity by 25%.",
      "Formulated metric tracking framework measuring daily active users (DAU) and retention cohorts.",
    ],
  },
];

// High-impact action verbs categorized for instant insertion
export const ACTION_VERBS: Record<string, string[]> = {
  "Leadership & Management": ["Spearheaded", "Architected", "Directed", "Orchestrated", "Supervised", "Organized", "Pioneered"],
  "Engineering & Development": ["Engineered", "Developed", "Constructed", "Programmed", "Implemented", "Refactored", "Automated"],
  "Optimization & Results": ["Accelerated", "Streamlined", "Optimized", "Maximized", "Minimized", "Transformed", "Enhanced"],
  "Research & Analysis": ["Analyzed", "Formulated", "Investigated", "Synthesized", "Quantified", "Benchmarked", "Evaluated"],
};

/**
 * In-Browser Smart Engine:
 * Rewrites a basic raw sentence into the Google XYZ format
 * "Accomplished [X] as measured by [Y], by doing [Z]"
 */
export function enhanceBulletInBrowser(rawText: string): string {
  const trimmed = rawText.trim().replace(/^[•\-\*]\s*/, "");
  if (!trimmed) return "";

  const startsWithActionVerb = Object.values(ACTION_VERBS)
    .flat()
    .some((verb) => trimmed.toLowerCase().startsWith(verb.toLowerCase()));

  if (startsWithActionVerb && (trimmed.includes("%") || /\d+/.test(trimmed))) {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).replace(/\.?$/, ".");
  }

  const lower = trimmed.toLowerCase();

  if (lower.includes("made") || lower.includes("built") || lower.includes("created")) {
    const topic = trimmed.replace(/^(i\s+)?(made|built|created|did)\s+/i, "");
    return `Architected and deployed ${topic}, enhancing system reliability and user engagement by 35%.`;
  }

  if (lower.includes("fixed") || lower.includes("improved") || lower.includes("faster")) {
    const topic = trimmed.replace(/^(i\s+)?(fixed|improved|made\s+faster)\s+/i, "");
    return `Optimized ${topic}, reducing processing latency by 40% and streamlining workflow execution.`;
  }

  if (lower.includes("tested") || lower.includes("testing")) {
    const topic = trimmed.replace(/^(i\s+)?(tested|did\s+testing\s+on)\s+/i, "");
    return `Formulated automated test suites for ${topic}, elevating overall test coverage to 92%.`;
  }

  if (lower.includes("worked on") || lower.includes("helped")) {
    const topic = trimmed.replace(/^(i\s+)?(worked\s+on|helped\s+with|contributed\s+to)\s+/i, "");
    return `Engineered critical components for ${topic}, collaborating within an agile team to ship deliverables ahead of schedule.`;
  }

  const clean = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).replace(/\.?$/, ".");
  return `Spearheaded ${clean.toLowerCase().replace(/^(spearheaded|developed|built)\s+/i, "")}, driving measurable performance improvements.`;
}

/**
 * Smart Polish Bullet (Seamlessly calls Server Gemini LLM if configured, otherwise instant in-browser)
 */
export async function smartPolishBullet(text: string): Promise<string> {
  try {
    const res = await fetch("/api/ai/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Rewrite this student resume bullet point into a single punchy, professional ATS bullet point using the Google XYZ formula ("Accomplished [X] as measured by [Y], by doing [Z]") and strong action verbs. Return ONLY the single bullet point text without bullet symbol or quotes:\n\n"${text}"`,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.text) {
        return data.text.replace(/^[•\-\*]\s*/, "");
      }
    }
  } catch (e) {
    // network failure -> seamless in-browser fallback
  }

  return enhanceBulletInBrowser(text);
}

/**
 * Smart Generate Summary (Seamlessly calls Server Gemini LLM if configured, otherwise instant in-browser)
 */
export async function smartGenerateSummary(targetRole: string): Promise<string> {
  try {
    const res = await fetch("/api/ai/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Write a compelling 2-3 sentence ATS-friendly student resume professional summary for a student pursuing roles in "${targetRole}". Include technical enthusiasm, core strengths, and collaboration without buzzwords. Return ONLY the summary paragraph text:`,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.text) {
        return data.text.trim();
      }
    }
  } catch (e) {
    // fallback
  }

  const match = ROLE_PRESETS.find(
    (r) =>
      r.role.toLowerCase().includes(targetRole.toLowerCase()) ||
      targetRole.toLowerCase().includes(r.id)
  );

  return (
    match?.suggestedSummary ||
    `Results-driven undergraduate with strong foundations in ${targetRole}. Demonstrated ability to build scalable software solutions, solve complex algorithmic challenges, and collaborate effectively in high-velocity agile environments.`
  );
}

export interface WizardResumeInput {
  fullName: string;
  targetRole: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  university: string;
  degree: string;
  graduationYear: string;
  gpa?: string;
  coursework?: string;
  languages: string;
  frameworks: string;
  tools: string;
  hasExperience: boolean;
  company?: string;
  experienceRole?: string;
  experienceDates?: string;
  experienceNotes?: string;
  project1Title?: string;
  project1Tech?: string;
  project1Notes?: string;
  project2Title?: string;
  project2Tech?: string;
  project2Notes?: string;
  achievements?: string;
}

/**
 * Synthesize a complete ATS resume from step-by-step user input.
 * Tries server Gemini LLM first, seamlessly falls back to In-Browser Smart Synthesis.
 */
export async function smartSynthesizeFullResume(input: WizardResumeInput): Promise<any> {
  try {
    const prompt = `You are an expert ATS Resume Architect. Based on the student's details below, construct a high-impact, professional ATS-friendly resume matching standard Harvard/Stanford format.
Use strong action verbs (Spearheaded, Architected, Engineered, Formulated, Accelerated) and Google XYZ bullet format ("Accomplished [X] as measured by [Y], by doing [Z]").

STUDENT DETAILS:
- Full Name: ${input.fullName}
- Target Role: ${input.targetRole}
- Email: ${input.email}
- Phone: ${input.phone}
- Location: ${input.location}
- LinkedIn: ${input.linkedin || ""}
- GitHub: ${input.github || ""}
- Portfolio: ${input.portfolio || ""}
- University: ${input.university}
- Degree: ${input.degree}
- Grad Year: ${input.graduationYear}
- GPA: ${input.gpa || ""}
- Coursework: ${input.coursework || ""}
- Programming Languages: ${input.languages}
- Frameworks: ${input.frameworks}
- Tools & Cloud: ${input.tools}
${input.hasExperience && input.company ? `- Experience: ${input.experienceRole || input.targetRole} at ${input.company} (${input.experienceDates || "Summer 2024"}). Notes: ${input.experienceNotes || ""}` : ""}
${input.project1Title ? `- Project 1: ${input.project1Title} (Tech: ${input.project1Tech || ""}). Notes: ${input.project1Notes || ""}` : ""}
${input.project2Title ? `- Project 2: ${input.project2Title} (Tech: ${input.project2Tech || ""}). Notes: ${input.project2Notes || ""}` : ""}
${input.achievements ? `- Achievements/Honors: ${input.achievements}` : ""}

Return ONLY valid raw JSON with NO markdown code fences and NO conversational text. Schema:
{
  "personal": {
    "fullName": "...",
    "title": "...",
    "email": "...",
    "phone": "...",
    "location": "...",
    "linkedin": "...",
    "github": "...",
    "portfolio": "...",
    "summary": "..."
  },
  "education": [
    {
      "id": "edu-1",
      "institution": "...",
      "degree": "...",
      "location": "...",
      "startDate": "...",
      "endDate": "...",
      "gpa": "...",
      "coursework": "..."
    }
  ],
  "skills": {
    "languages": "...",
    "frameworks": "...",
    "developerTools": "...",
    "coreConcepts": "..."
  },
  "experience": [
    {
      "id": "exp-1",
      "role": "...",
      "company": "...",
      "location": "...",
      "startDate": "...",
      "endDate": "...",
      "bullets": ["...", "..."]
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "title": "...",
      "techStack": "...",
      "link": "...",
      "github": "...",
      "bullets": ["...", "..."]
    }
  ],
  "achievements": ["..."],
  "certifications": ["..."]
}`;

    const res = await fetch("/api/ai/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.text) {
        const cleaned = data.text.replace(/```json/gi, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.personal && parsed.education && parsed.skills) {
          return parsed;
        }
      }
    }
  } catch (e) {
    // network or parsing failure -> proceed to in-browser synthesis
  }

  // In-Browser Smart Synthesis
  const rolePreset = ROLE_PRESETS.find(
    (r) =>
      r.role.toLowerCase().includes(input.targetRole.toLowerCase()) ||
      input.targetRole.toLowerCase().includes(r.id)
  ) || ROLE_PRESETS[0];

  const summary =
    rolePreset?.suggestedSummary ||
    `Motivated undergraduate student with deep foundations in ${input.targetRole}. Experienced in designing scalable systems, building modern software solutions, and collaborating across high-velocity teams.`;

  // Bullets for Experience
  const expBullets = input.experienceNotes?.trim()
    ? input.experienceNotes
        .split("\n")
        .filter((l) => l.trim().length > 0)
        .map((l) => enhanceBulletInBrowser(l))
    : rolePreset.sampleBullets.slice(0, 2);

  // Bullets for Project 1
  const proj1Bullets = input.project1Notes?.trim()
    ? input.project1Notes
        .split("\n")
        .filter((l) => l.trim().length > 0)
        .map((l) => enhanceBulletInBrowser(l))
    : [
        `Architected responsive ${input.project1Title || "web application"} using ${input.project1Tech || input.languages || "modern technologies"}, optimizing latency by 35%.`,
        `Integrated secure backend data storage and modular APIs, ensuring 99.8% uptime and seamless user onboarding.`,
      ];

  // Bullets for Project 2
  const proj2Bullets = input.project2Notes?.trim()
    ? input.project2Notes
        .split("\n")
        .filter((l) => l.trim().length > 0)
        .map((l) => enhanceBulletInBrowser(l))
    : [
        `Constructed end-to-end architecture with ${input.project2Tech || "TypeScript and PostgreSQL"}, supporting concurrent user workflows.`,
        `Formulated automated test suites, elevating code reliability and test coverage to 90%.`,
      ];

  // Achievements
  const achievementsList = input.achievements?.trim()
    ? input.achievements.split("\n").filter((a) => a.trim().length > 0)
    : [
        "1st Place Winner — University Collegiate Hackathon (Won among 50+ participating teams)",
        "Dean's Academic Honor List for outstanding scholastic achievement and GPA",
      ];

  const resultResume = {
    personal: {
      fullName: input.fullName || "Alex Chen",
      title: input.targetRole || "Software Engineering Student",
      email: input.email || "alex.chen@university.edu",
      phone: input.phone || "+1 (555) 000-0000",
      location: input.location || "Boston, MA",
      linkedin: input.linkedin || `linkedin.com/in/${input.fullName.toLowerCase().replace(/\s+/g, "") || "profile"}`,
      github: input.github || `github.com/${input.fullName.toLowerCase().replace(/\s+/g, "") || "developer"}`,
      portfolio: input.portfolio || `${input.fullName.toLowerCase().replace(/\s+/g, "") || "alexchen"}.dev`,
      summary: summary,
    },
    education: [
      {
        id: "edu-1",
        institution: input.university || "State University of Technology",
        degree: input.degree || "Bachelor of Science in Computer Science & Engineering",
        location: input.location || "City, State",
        startDate: "2022",
        endDate: input.graduationYear || "2026 (Expected)",
        gpa: input.gpa ? (input.gpa.toLowerCase().includes("gpa") ? input.gpa : `CGPA: ${input.gpa}`) : "CGPA: 9.0 / 10.0",
        coursework: input.coursework || "Data Structures, Algorithms, Database Systems, Computer Networks",
      },
    ],
    skills: {
      languages: input.languages || "TypeScript, JavaScript, Python, C++, Java, SQL",
      frameworks: input.frameworks || "React, Next.js, Node.js, Express, Tailwind CSS",
      developerTools: input.tools || "Git, GitHub Actions, Docker, AWS (S3, Lambda), Linux, Redis",
      coreConcepts: "Object-Oriented Design, RESTful APIs, Microservices, CI/CD, Agile/Scrum",
    },
    experience: input.hasExperience && input.company
      ? [
          {
            id: "exp-1",
            role: input.experienceRole || `${input.targetRole} Intern`,
            company: input.company || "Tech Innovators Inc.",
            location: input.location || "Remote / Hybrid",
            startDate: input.experienceDates?.split("-")[0]?.trim() || "Jun 2024",
            endDate: input.experienceDates?.split("-")[1]?.trim() || "Aug 2024",
            bullets: expBullets,
          },
        ]
      : [],
    projects: [
      {
        id: "proj-1",
        title: input.project1Title || "DevSprint — Real-Time Collaborative Workspace",
        techStack: input.project1Tech || input.frameworks || "React, Next.js, WebSockets, Redis, Tailwind CSS",
        link: "https://project1.demo",
        github: `https://github.com/developer/${(input.project1Title || "project1").toLowerCase().replace(/\s+/g, "-")}`,
        bullets: proj1Bullets,
      },
      ...(input.project2Title
        ? [
            {
              id: "proj-2",
              title: input.project2Title,
              techStack: input.project2Tech || "Python, FastAPI, Docker, PostgreSQL",
              link: "https://project2.demo",
              github: `https://github.com/developer/${input.project2Title.toLowerCase().replace(/\s+/g, "-")}`,
              bullets: proj2Bullets,
            },
          ]
        : []),
    ],
    achievements: achievementsList,
    certifications: [
      "AWS Certified Cloud Practitioner — Amazon Web Services",
      "Meta Frontend Developer Professional Certificate",
    ],
  };

  return resultResume;
}

/**
 * Analyze Job Description Match Score and suggest missing ATS keywords
 */
export function analyzeAtsKeywordMatch(
  resumeText: string,
  jobDescriptionText: string
): { score: number; foundKeywords: string[]; missingKeywords: string[] } {
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const commonAtsKeywords = [
    "react", "typescript", "javascript", "python", "java", "c++", "sql", "postgresql",
    "mongodb", "aws", "docker", "kubernetes", "git", "ci/cd", "rest", "api", "graphql",
    "agile", "scrum", "microservices", "testing", "tailwind", "node", "express", "fastapi",
    "next.js", "linux", "cloud", "algorithms", "data structures", "redis", "figma",
    "performance", "scalable", "leadership", "analytics", "collaboration",
  ];

  const targetKeywords = commonAtsKeywords.filter((kw) =>
    jobDescriptionText.toLowerCase().includes(kw)
  );

  if (targetKeywords.length === 0) {
    return { score: 75, foundKeywords: ["general skills matched"], missingKeywords: [] };
  }

  const found: string[] = [];
  const missing: string[] = [];

  targetKeywords.forEach((kw) => {
    if (resumeText.toLowerCase().includes(kw)) {
      found.push(kw);
    } else {
      missing.push(kw);
    }
  });

  const score = Math.round((found.length / targetKeywords.length) * 100);

  return {
    score: Math.max(score, 10),
    foundKeywords: found,
    missingKeywords: missing,
  };
}

