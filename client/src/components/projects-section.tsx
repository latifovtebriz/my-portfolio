import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

// Project images
import insurAiImage from "@assets/InsurAI.png";
import flowMindAiImage from "@assets/FlowMindAI.png";
import ecommerceImage from "@assets/ECommerceMicroservicePicture.png";
import jobSearchImage from "@assets/JobSearchApp.png";
import softwareVillageImage from "@assets/SoftwareVillage.png";
import dendClubImage from "@assets/DendClub.png";
import ecommerceAppImage from "@assets/ECommerceApp.png";
import lawProjectImage from "@assets/LawProject.png";
import shopECommerceImage from "@assets/ShopECommerce.png";

// Featured Projects
const staticProjects = [
  {
    id: 1,
    name: "InsurAI",
    description: "Autonomous Enterprise P&C Insurance Core Platform powered by 8 specialized AI agents (A1–A8), deterministic guardrails (G1–G10), double-entry ledger, and pgvector semantic search.",
    image: insurAiImage,
    technologies: ["Python", "FastAPI", "AI Agents", "Guardrails", "pgvector", "RAG", "React 18", "TypeScript", "Prometheus"],
    githubUrl: "https://github.com/latifovtebriz/InsurAI",
    liveUrl: null,
    status: "Featured AI",
    isAi: true,
    featured: true
  },
  {
    id: 2,
    name: "FlowMindAI",
    description: "Enterprise workplace automation platform featuring AI-powered Q&A, intelligent helpdesk routing, document semantic search, and approval workflows.",
    image: flowMindAiImage,
    technologies: ["TypeScript", "React 18", "Express.js", "OpenAI GPT", "Vector Embeddings", "RAG", "PostgreSQL", "Drizzle ORM"],
    githubUrl: "https://github.com/latifovtebriz/FlowMindAI",
    liveUrl: null,
    status: "Featured AI",
    isAi: true,
    featured: true
  },
  {
    id: 3,
    name: "ECommerceMicroservice",
    description: "Modern microservices-based e-commerce platform with distributed architecture.",
    image: ecommerceImage,
    technologies: ["C#", ".NET", "REST API", "RabbitMQ", "Elasticsearch", "Redis"],
    githubUrl: "https://github.com/latifovtebriz/ECommerceMicroservice",
    liveUrl: null,
    status: "Microservices",
    isAi: false,
    featured: true
  },
  {
    id: 4,
    name: "JobSearchApp",
    description: "A comprehensive platform for searching and managing job applications.",
    image: jobSearchImage,
    technologies: ["C#", ".NET", "RestAPI", "Clean Architecture"],
    githubUrl: "https://github.com/latifovtebriz/JobSearch-App",
    liveUrl: null,
    status: "Full Stack",
    isAi: false,
    featured: true
  },
  {
    id: 5,
    name: "DendClub",
    description: "A healthcare system project designed to manage patient and clinical data efficiently.",
    image: dendClubImage,
    technologies: ["C#", ".NET", "RestAPI", "JavaScript", "TypeScript", "React.js"],
    githubUrl: "https://github.com/latifovtebriz/DendClub",
    liveUrl: null,
    status: "Healthcare",
    isAi: false,
    featured: true
  },
  {
    id: 6,
    name: "ShopECommerce",
    description: "A corporate e-commerce solution with Onion Architecture and Elasticsearch.",
    image: shopECommerceImage,
    technologies: ["C#", ".NET", "RestAPI", "Onion Architecture", "ElasticSearch"],
    githubUrl: "https://github.com/latifovtebriz/ShopECommerce",
    liveUrl: null,
    status: "Enterprise",
    isAi: false,
    featured: true
  },
  {
    id: 7,
    name: "SoftwareVillage",
    description: "A project for the Software Village course, demonstrating core software principles.",
    image: softwareVillageImage,
    technologies: ["C#", ".NET Core MVC", "MVVM", "MVC Architecture"],
    githubUrl: "https://github.com/latifovtebriz/SoftwareVillage",
    liveUrl: null,
    status: "Education",
    isAi: false,
    featured: true
  },
  {
    id: 8,
    name: "ECommerceApp",
    description: "A full-featured e-commerce application built with an N-layer architecture.",
    image: ecommerceAppImage,
    technologies: ["C#", ".NET", ".NET MVC", "MVVM", "N-layer Architecture"],
    githubUrl: "https://github.com/latifovtebriz/ECommerceApp",
    liveUrl: null,
    status: "N-Layer",
    isAi: false,
    featured: true
  },
  {
    id: 9,
    name: "LawProject",
    description: "A specialized application designed to assist legal professionals and law firms.",
    image: lawProjectImage,
    technologies: ["C#", ".NET Core MVC", "MVVM"],
    githubUrl: "https://github.com/latifovtebriz/Law_Project",
    liveUrl: null,
    status: "Legal Tech",
    isAi: false,
    featured: true
  },
];

export function ProjectsSection() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filter, setFilter] = useState<"all" | "ai" | "backend">("all");

  const filteredProjects = staticProjects.filter((p) => {
    if (filter === "ai") return p.isAi;
    if (filter === "backend") return !p.isAi;
    return true;
  });

  return (
    <section id="projects" className="section-padding relative">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <Badge variant="outline" className="mb-2 text-primary border-primary/25 bg-primary/5 px-3.5 py-1 text-xs uppercase tracking-wider font-semibold">
                Showcase
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Featured Projects
              </h2>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-xl">
                Autonomous AI agents, enterprise workplace automation platforms, and distributed microservices.
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

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2.5 mb-10">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === "all"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]"
                  : "bg-card/70 border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              All Projects ({staticProjects.length})
            </button>
            <button
              onClick={() => setFilter("ai")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === "ai"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]"
                  : "bg-card/70 border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Platforms & Agents
            </button>
            <button
              onClick={() => setFilter("backend")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === "backend"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]"
                  : "bg-card/70 border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              Microservices & Architecture
            </button>
          </div>

          {isExpanded && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card 
                  key={project.id} 
                  className={`glass-panel card-hover-effect rounded-2xl group flex flex-col justify-between overflow-hidden border-border/70 hover:border-primary/50 transition-all duration-300 ${
                    project.isAi ? "border-primary/40 ring-1 ring-primary/15 shadow-sm" : ""
                  }`}
                >
                  <div>
                    <div className="aspect-video overflow-hidden rounded-t-2xl bg-muted relative">
                      <img
                        src={project.image}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDQwMCAyMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjI1IiBmaWxsPSIjZjMfNGY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTEyLjVMMTc1IDg3LjVMMjAwIDYyLjVMMjI1IDg3LjVMMjAwIDExMi41WiIgZmlsbD0iIzk5YTNhZiIvPgo8L3N2Zz4K';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
                      {project.isAi && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-primary text-primary-foreground font-semibold flex items-center gap-1 shadow-md shadow-primary/30 backdrop-blur-md">
                            <Sparkles className="h-3 w-3" />
                            AI Platform
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2.5">
                        <h3 className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        <Badge 
                          variant={project.isAi ? "default" : "outline"}
                          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3 leading-relaxed">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {project.technologies?.map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted/60 border border-border/50">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-6 pt-0 flex gap-2.5">
                    {project.githubUrl && (
                      <Button variant="outline" size="sm" asChild className="flex-1 rounded-xl bg-card/60 hover:border-primary/50 hover:bg-muted/60 transition-all font-medium">
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5"
                        >
                          <Github className="h-4 w-4" />
                          View Code
                        </a>
                      </Button>
                    )}
                    {project.liveUrl && (
                      <Button size="sm" asChild className="flex-1 rounded-xl bg-primary shadow-sm hover:bg-primary/90 font-medium">
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Live Demo
                        </a>
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
