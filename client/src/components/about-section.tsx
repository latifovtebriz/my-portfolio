import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Globe2, Sparkles, HeartHandshake } from "lucide-react";

export function AboutSection() {
  const languages = [
    { name: "Azerbaijani", level: "Native" },
    { name: "Turkish", level: "Native" },
    { name: "English", level: "C1 (Fluent)" },
    { name: "German", level: "A2 (Elementary)" },
  ];

  const softSkills = [
    "Problem Solving & Analytical Thinking",
    "Self-Management & Adaptability",
    "Effective Communication (Remote/Async)",
    "Team Collaboration & Mentorship",
    "Critical Thinking & Innovation",
    "Time Management",
  ];

  return (
    <section id="about" className="section-padding">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            About Me
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <img
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                alt="Software & AI engineering workspace"
                className="rounded-xl w-full h-84 object-cover shadow-lg border border-border/50"
              />
            </div>
            <div>
              <p className="text-lg text-muted-foreground mb-5 leading-relaxed">
                I am a <strong>Generative AI & Software Engineer</strong> with <strong>4+ years</strong> of hands-on experience in C# and the .NET ecosystem, microservices architecture, and DevOps practices, alongside <strong>2+ years</strong> specializing in Python development and AI/LLM engineering.
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                My work centers on designing robust scalable systems and integrating advanced AI capabilities into production — including <strong>Retrieval-Augmented Generation (RAG)</strong>, semantic vector search (Pinecone, FAISS, Weaviate), agentic tool-using workflows, and fine-tuning prompt pipelines. I bridge the gap between reliable enterprise backend architecture and cutting-edge Generative AI innovation.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Card className="text-center h-24 flex items-center justify-center hover:border-primary/50 transition-colors">
                  <CardContent className="p-3">
                    <div className="text-2xl font-bold text-primary mb-1">4+ Years</div>
                    <p className="text-xs text-muted-foreground">Software & DevOps</p>
                  </CardContent>
                </Card>
                <Card className="text-center h-24 flex items-center justify-center hover:border-primary/50 transition-colors">
                  <CardContent className="p-3">
                    <div className="text-2xl font-bold text-primary mb-1">2+ Years</div>
                    <p className="text-xs text-muted-foreground">AI & LLM Engineering</p>
                  </CardContent>
                </Card>
                <Card className="text-center h-24 flex items-center justify-center hover:border-primary/50 transition-colors">
                  <CardContent className="p-3">
                    <div className="text-2xl font-bold text-primary mb-1">4+</div>
                    <p className="text-xs text-muted-foreground">Scientific Researches</p>
                  </CardContent>
                </Card>
                <Card className="text-center h-24 flex items-center justify-center hover:border-primary/50 transition-colors">
                  <CardContent className="p-3">
                    <div className="text-2xl font-bold text-primary mb-1">5+</div>
                    <p className="text-xs text-muted-foreground">Global Conferences</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Languages & Soft Skills Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border/60">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 text-primary font-semibold text-lg">
                  <Globe2 className="h-5 w-5" />
                  <h3>Languages</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {languages.map((lang, index) => (
                    <div key={index} className="flex flex-col p-2.5 rounded-lg bg-muted/40 border border-muted/50">
                      <span className="font-medium text-sm">{lang.name}</span>
                      <span className="text-xs text-muted-foreground">{lang.level}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 text-primary font-semibold text-lg">
                  <Sparkles className="h-5 w-5" />
                  <h3>Soft Skills & Work Ethic</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {softSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs py-1.5 px-3">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
