import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Briefcase, MapPin, Calendar } from "lucide-react";

interface Experience {
  title: string;
  company: string;
  period: string;
  location: string;
  description: string;
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
    description:
      "Engineer insurance and fintech solutions using C#/.NET Core, ASP.NET Web API, MS SQL Server, and microservices. Integrate Generative AI, LLMs, ChatGPT, and Claude into development, debugging, testing, and documentation workflows. Explore local/self-hosted AI models, RAG, embeddings, and vector search for enterprise and insurance use cases while applying AI-assisted engineering practices to boost development efficiency and maintain high code quality and security.",
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
    title: "SRE & AI Engineer",
    company: "Skolyn",
    period: "Oct 2025 – Present",
    location: "Remote (Contract)",
    description:
      "Develop and maintain deployment and infrastructure workflows for a medical enterprise ERP platform. Design CI/CD, containerization, deployment automation, monitoring, and logging workflows. Apply AI-assisted approaches to infrastructure troubleshooting, log analysis, and operational automation. Work extensively with Docker, Kubernetes, Linux, Azure DevOps, and cloud-native deployment practices.",
    technologies: [
      "SRE Practices",
      "AI-Assisted Troubleshooting",
      "Log Analysis",
      "Docker",
      "Kubernetes",
      "Linux OS",
      "Azure DevOps",
      "CI/CD Automation",
      "Terraform",
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
    description:
      "Developed software solutions focused on Generative AI, LLM integration, and data-oriented applications. Built Python-based data processing and automation workflows for AI-enabled applications. Explored RAG, embeddings, vector search, and AI-powered information retrieval for structured and unstructured data. Applied LLMs and AI-assisted development across coding, debugging, testing, and documentation.",
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
    description:
      "Developed software solutions for medical processes and workflow automation. Explored LLM and Generative AI integration for information processing and clinical workflow automation. Applied AI-assisted development for implementation, debugging, testing, and documentation. Investigated RAG, semantic search, embeddings, and vector-based information retrieval for domain-specific medical data.",
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
    description:
      "Teach C# programming, backend development, and software engineering principles. Introduce students to AI-assisted coding and LLM-based development workflows. Demonstrate LLM applications in code generation, debugging, refactoring, testing, and documentation.",
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
    description:
      "Teach C# programming and software development. Provide practical guidance in backend development, programming fundamentals, debugging, and software engineering.",
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
    description:
      "Provided critical on-site IT technical support services during COP29 Baku, Azerbaijan. Managed network infrastructure, hardware/software troubleshooting, and ensured high-availability operational support for conference systems.",
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
    description:
      "Developed full-stack web applications for US-based clients and software products. Worked on application development, debugging, integration, and software delivery within a remote international development environment.",
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
    <section id="experience" className="section-padding bg-muted/30">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Work Experience
              </h2>
              <p className="text-muted-foreground mt-2 text-sm md:text-base">
                Engineering scalable backend systems, SRE infrastructure, and enterprise Generative AI integrations.
              </p>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
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
                  className={`relative transition-all hover:shadow-md ${
                    exp.current ? "border-primary/50 shadow-sm" : "border-border/60"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-foreground">
                            {exp.title}
                          </h3>
                          {exp.highlightAi && (
                            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                              AI Focus
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-muted-foreground mb-3 text-sm">
                          <span className="font-semibold text-primary">{exp.company}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 inline" /> {exp.location}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={exp.current ? "default" : "outline"}
                        className={`self-start mt-2 md:mt-0 ${
                          exp.current
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        <Calendar className="h-3 w-3 mr-1 inline" />
                        {exp.period}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground mb-4 leading-relaxed text-sm md:text-base">
                      {exp.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {exp.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
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
