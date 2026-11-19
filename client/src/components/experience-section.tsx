import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Briefcase, MapPin, Calendar } from "lucide-react";

interface Experience {
  title: string;
  company: string;
  period: string;
  location: string;
  description?: string;
  highlights?: string[];
  technologies: string[];
  current: boolean;
  highlightAi?: boolean;
}

const experiences: Experience[] = [
  {
    title: "Software & AI Engineer",
    company: "Ateshgah Insurance OJSC",
    period: "Dec 2025 – Present",
    location: "Baku, Azerbaijan (Hybrid)",
    highlights: [
      "Engineer insurance and fintech solutions using C#/.NET Core, ASP.NET Web API, MS SQL Server, and microservices.",
      "Integrate Generative AI, LLMs, ChatGPT, and Claude into development, debugging, testing, and documentation workflows.",
      "Explore local/self-hosted AI models, RAG, embeddings, and vector search for enterprise and insurance use cases.",
      "Apply AI-assisted engineering practices to improve development efficiency while maintaining code quality and security.",
    ],
    technologies: [
      "C#",
      ".NET Core",
      "ASP.NET Web API",
      "Generative AI",
      "LLMs",
      "ChatGPT API",
      "Claude API",
      "RAG",
      "Embeddings",
      "Vector Search",
      "Local/Self-hosted AI",
      "MS SQL Server",
      "Microservices",
      "Redis",
      "RabbitMQ",
    ],
    current: true,
    highlightAi: true,
  },
  {
    title: "AI & SRE Engineer",
    company: "Skolyn",
    period: "Oct 2025 – Present",
    location: "Remote (Contract)",
    highlights: [
      "Lead development, fine-tuning, and deployment of domain-specific LLM models and intelligent agentic workflows for a medical enterprise ERP platform.",
      "Build and optimize high-throughput, low-latency LLM serving and inference pipelines using containerized deployments (Docker, Kubernetes, vLLM/Ollama).",
      "Implement production-grade RAG pipelines, semantic vector search, and clinical knowledge retrieval over structured and unstructured medical ERP data.",
      "Design and deploy autonomous AI agents for automated infrastructure troubleshooting, log analysis, anomaly detection, and operational automation.",
      "Establish robust CI/CD, MLOps, containerization, and monitoring workflows using Docker, Kubernetes, Linux, Azure DevOps, Prometheus, and Grafana.",
    ],
    technologies: [
      "Generative AI",
      "LLM Development",
      "AI Agents",
      "RAG",
      "Vector Search",
      "vLLM / Ollama",
      "MLOps / LLMOps",
      "Docker",
      "Kubernetes",
      "Linux OS",
      "Azure DevOps",
      "CI/CD Automation",
      "Prometheus",
      "Grafana",
      "ELK Stack",
    ],
    current: true,
    highlightAi: true,
  },
  {
    title: "Software Engineer (AI & Data Solutions)",
    company: "Freelance",
    period: "May 2025 – Oct 2025",
    location: "United States (Remote)",
    highlights: [
      "Developed software solutions focused on Generative AI, LLM integration, and data-oriented applications.",
      "Built Python-based data processing and automation workflows for AI-enabled applications.",
      "Explored RAG, embeddings, vector search, and AI-powered information retrieval for structured and unstructured data.",
      "Applied LLMs and AI-assisted development across coding, debugging, testing, documentation, and automation.",
    ],
    technologies: [
      "Python",
      "Generative AI",
      "LLM Integration",
      "RAG",
      "Embeddings",
      "Vector Search",
      "FastAPI",
      "LangChain",
      "Pinecone",
      "Pandas",
      "Prompt Engineering",
    ],
    current: false,
    highlightAi: true,
  },
  {
    title: "Software & AI Engineer",
    company: "DendClub",
    period: "Nov 2024 – May 2025",
    location: "Remote (Contract)",
    highlights: [
      "Developed software solutions for medical processes and workflow automation.",
      "Explored LLM and Generative AI integration for information processing and workflow automation.",
      "Applied AI-assisted development for implementation, debugging, testing, and documentation.",
      "Investigated RAG, semantic search, embeddings, and vector-based information retrieval for domain-specific data.",
    ],
    technologies: [
      "C#",
      ".NET Core",
      "Python",
      "Generative AI",
      "LLM Integration",
      "RAG",
      "Semantic Search",
      "Vector Retrieval",
      "Docker",
      "React.js",
      "REST APIs",
    ],
    current: false,
    highlightAi: true,
  },
  {
    title: "Software Engineer (Instructor)",
    company: "CodeWorld",
    period: "Apr 2025 – Mar 2026",
    location: "Baku, Azerbaijan (Contract)",
    highlights: [
      "Teach C# programming, backend development, and software engineering principles.",
      "Introduce students to AI-assisted coding and LLM-based development workflows.",
      "Demonstrate LLM applications in code generation, debugging, refactoring, testing, and documentation.",
    ],
    technologies: [
      "C#",
      ".NET Core",
      "Backend Architecture",
      "Clean Code & SOLID",
      "AI-Assisted Coding",
      "LLM Workflows",
      "Mentoring",
      "Code Review",
    ],
    current: false,
    highlightAi: true,
  },
  {
    title: "Software Engineer (Instructor)",
    company: "Software Village",
    period: "Aug 2024 – Feb 2026",
    location: "Azerbaijan (Contract)",
    highlights: [
      "Teach C# programming and software development.",
      "Provide practical guidance in backend development, programming fundamentals, debugging, and software engineering.",
    ],
    technologies: [
      "C#",
      ".NET",
      "ASP.NET MVC",
      "Onion Architecture",
      "Software Engineering",
      "Mentoring",
    ],
    current: false,
  },
  {
    title: "ICT Onsite Support Technician",
    company: "Kronos (COP29)",
    period: "Oct 2024 – Nov 2024",
    location: "Baku, Azerbaijan (On-site)",
    highlights: [
      "Provided on-site IT technical support services during COP29 Baku, Azerbaijan.",
      "Ensured high-availability operational support, hardware/software troubleshooting, and network reliability for global delegates.",
    ],
    technologies: [
      "Network Administration",
      "TCP/IP",
      "Hardware Troubleshooting",
      "Incident Management",
      "COP29 Support",
    ],
    current: false,
  },
  {
    title: "Software Engineer",
    company: "TIC",
    period: "May 2021 – Oct 2024",
    location: "United States (Remote)",
    highlights: [
      "Developed full-stack web applications for US-based clients and software products.",
      "Worked on application development, debugging, integration, and software delivery.",
      "Collaborated within a remote international development environment.",
    ],
    technologies: [
      "C#",
      ".NET Core",
      "ASP.NET Core",
      "Microservices",
      "SQL Server",
      "Docker",
      "CI/CD",
      "REST APIs",
    ],
    current: false,
  },
];

export function ExperienceSection() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section id="experience" className="section-padding relative">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <Badge variant="outline" className="mb-2 text-primary border-primary/25 bg-primary/5 px-3.5 py-1 text-xs uppercase tracking-wider font-semibold">
                Career Trajectory
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Work Experience
              </h2>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-xl">
                Designing scalable systems, distributed microservices, MLOps/SRE pipelines, and enterprise Generative AI integrations.
              </p>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground bg-card/60 border border-border/60 hover:border-primary/40 transition-all self-start sm:self-auto"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {isExpanded ? "Collapse" : "Expand"}
            </button>
          </div>

          {isExpanded && (
            <div className="space-y-6">
              {experiences.map((exp, index) => (
                <Card
                  key={index}
                  className={`glass-panel card-hover-effect rounded-2xl relative transition-all duration-300 ${
                    exp.current ? "border-primary/60 shadow-lg shadow-primary/5 ring-1 ring-primary/20" : "border-border/70"
                  }`}
                >
                  <CardContent className="p-6 sm:p-7">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 gap-2">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2.5 mb-1.5">
                          <h3 className="text-xl font-bold text-foreground">
                            {exp.title}
                          </h3>
                          {exp.highlightAi && (
                            <Badge variant="outline" className="text-[11px] font-semibold bg-primary/10 text-primary border-primary/30 px-2.5 py-0.5 rounded-full">
                              AI Focus
                            </Badge>
                          )}
                          {exp.current && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 text-muted-foreground text-sm">
                          <span className="font-semibold text-primary">{exp.company}</span>
                          <span className="hidden sm:inline text-muted-foreground/40">•</span>
                          <span className="flex items-center gap-1.5 text-xs sm:text-sm">
                            <MapPin className="h-3.5 w-3.5 text-primary/70 shrink-0" /> {exp.location}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={exp.current ? "default" : "outline"}
                        className={`self-start text-xs px-3 py-1 rounded-lg ${
                          exp.current
                            ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                            : "text-muted-foreground border-border/80"
                        }`}
                      >
                        <Calendar className="h-3.5 w-3.5 mr-1.5 inline" />
                        {exp.period}
                      </Badge>
                    </div>

                    {exp.highlights ? (
                      <ul className="space-y-2.5 mb-5">
                        {exp.highlights.map((highlight, hIndex) => (
                          <li key={hIndex} className="flex items-start gap-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-2.5 ring-4 ring-primary/15" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground mb-5 leading-relaxed text-sm sm:text-base">
                        {exp.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
                      {exp.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs font-medium px-2.5 py-1 rounded-md bg-muted/60 border border-border/50 hover:border-primary/40 transition-colors">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
