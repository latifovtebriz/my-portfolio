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
    <section id="about" className="section-padding relative">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-3 text-primary border-primary/25 bg-primary/5 px-3.5 py-1 text-xs uppercase tracking-wider font-semibold">
              Background & Vision
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              About Me
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-14">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition duration-500" />
              <img
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                alt="Software & AI engineering workspace"
                className="relative rounded-2xl w-full h-84 object-cover shadow-xl border border-border/60"
              />
            </div>
            <div>
              <p className="text-base sm:text-lg text-muted-foreground mb-5 leading-relaxed">
                I am a <strong>Generative AI & Software Engineer</strong> with <strong>4+ years</strong> of hands-on experience in C# and the .NET ecosystem, microservices architecture, and DevOps practices, alongside <strong>2+ years</strong> specializing in Python development and AI/LLM engineering.
              </p>
              <p className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed">
                My work centers on designing robust scalable systems and integrating advanced AI capabilities into production — including <strong>Retrieval-Augmented Generation (RAG)</strong>, semantic vector search (Pinecone, FAISS, Weaviate), agentic tool-using workflows, and fine-tuning prompt pipelines. I bridge the gap between reliable enterprise backend architecture and cutting-edge Generative AI innovation.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel card-hover-effect rounded-2xl p-4 text-center border border-border/70 hover:border-primary/50">
                  <div className="text-2xl font-extrabold text-primary mb-1">4+ Years</div>
                  <p className="text-xs text-muted-foreground font-medium">Software & DevOps</p>
                </div>
                <div className="glass-panel card-hover-effect rounded-2xl p-4 text-center border border-border/70 hover:border-primary/50">
                  <div className="text-2xl font-extrabold text-primary mb-1">2+ Years</div>
                  <p className="text-xs text-muted-foreground font-medium">AI & LLM Engineering</p>
                </div>
                <div className="glass-panel card-hover-effect rounded-2xl p-4 text-center border border-border/70 hover:border-primary/50">
                  <div className="text-2xl font-extrabold text-primary mb-1">4+</div>
                  <p className="text-xs text-muted-foreground font-medium">Scientific Researches</p>
                </div>
                <div className="glass-panel card-hover-effect rounded-2xl p-4 text-center border border-border/70 hover:border-primary/50">
                  <div className="text-2xl font-extrabold text-primary mb-1">5+</div>
                  <p className="text-xs text-muted-foreground font-medium">Global Conferences</p>
                </div>
              </div>
            </div>
          </div>

          {/* Languages & Soft Skills Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-panel border-border/70 card-hover-effect rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-2.5 mb-5 text-primary font-bold text-lg">
                  <Globe2 className="h-5 w-5" />
                  <h3>Languages</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {languages.map((lang, index) => (
                    <div key={index} className="flex flex-col p-3 rounded-xl bg-muted/40 border border-muted/50 hover:border-primary/30 transition-colors">
                      <span className="font-semibold text-sm">{lang.name}</span>
                      <span className="text-xs text-muted-foreground">{lang.level}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-border/70 card-hover-effect rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-2.5 mb-5 text-primary font-bold text-lg">
                  <Sparkles className="h-5 w-5" />
                  <h3>Soft Skills & Work Ethic</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {softSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs py-1.5 px-3 rounded-lg bg-muted/60 border border-border/60 hover:border-primary/40 transition-colors">
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
