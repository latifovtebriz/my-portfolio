import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, Download } from "lucide-react";
import { TypeAnimation } from "react-type-animation";
import tabrizPhoto from "@/assets/profile-photo.jpg";
import { trackEvent } from "@/lib/analytics";

export function HeroSection() {
  const scrollToContact = () => {
    const element = document.querySelector("#contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const downloadCV = () => {
    trackEvent("download", "cv", "hero_section");
    const link = document.createElement("a");
    link.href = "/Tabriz Latifov CV.pdf";
    link.download = "Tabriz Latifov CV.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 gradient-bg overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Profile Photo */}
          <div className="mb-8">
            <div className="hero-profile relative mx-auto w-48 h-48 sm:w-56 sm:h-56 rounded-full shadow-2xl">
              <img
                src={tabrizPhoto}
                alt="Tabriz Latifov"
                className="rounded-full w-full h-full object-cover border-4 border-background"
              />
            </div>
          </div>

          {/* Name & Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            <span>Hi, I'm </span>
            <span className="text-gradient-ai">Tabriz Latifov</span>
          </h1>

          <div className="mb-6 text-lg sm:text-xl md:text-2xl font-semibold text-primary/95 min-h-[48px] flex items-center justify-center font-mono">
            <TypeAnimation
              sequence={[
                "Generative AI & Software Engineer",
                1800,
                "LLMs | RAG | Vector Search | AI Agents",
                1800,
                "C# / .NET Core & Microservices Architecture",
                1800,
                "Cloud-Native Infrastructure & MLOps/SRE",
                1800,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </div>

          <p className="text-base sm:text-lg mb-10 max-w-3xl mx-auto text-muted-foreground leading-relaxed">
            Software Engineer with <strong>4+ years of experience</strong> in C# and the .NET ecosystem, microservices architecture, and DevOps practices, plus <strong>2+ years of experience</strong> in Python development and AI/LLM engineering. Proven track record in designing scalable systems, automating CI/CD pipelines, and managing cloud infrastructure. Growing expertise in AI-assisted engineering, including Generative AI/LLM integration, RAG, embeddings, and vector search for enterprise and domain-specific use cases.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Button 
              onClick={scrollToContact} 
              size="lg" 
              className="px-8 py-6 text-base font-semibold rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              Contact Me
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-6 text-base font-semibold rounded-xl bg-card/70 backdrop-blur-md border border-border hover:border-primary/50 hover:bg-muted/60 hover:-translate-y-0.5 transition-all duration-200 shadow-sm" 
              onClick={downloadCV}
            >
              <Download className="mr-2 h-4 w-4 text-primary" />
              Download CV
            </Button>
          </div>

          <div className="flex justify-center items-center gap-3">
            <a
              href="https://github.com/latifovtebriz"
              className="p-3 rounded-xl bg-card/70 backdrop-blur-md border border-border/70 hover:border-primary/50 text-muted-foreground hover:text-primary hover:-translate-y-1 hover:shadow-md transition-all duration-200"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              onClick={() => trackEvent("click", "social_media", "github")}
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com/in/tabriz-latifov-544307260"
              className="p-3 rounded-xl bg-card/70 backdrop-blur-md border border-border/70 hover:border-primary/50 text-muted-foreground hover:text-primary hover:-translate-y-1 hover:shadow-md transition-all duration-200"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              onClick={() => trackEvent("click", "social_media", "linkedin")}
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="mailto:latifovtebriz@gmail.com"
              className="p-3 rounded-xl bg-card/70 backdrop-blur-md border border-border/70 hover:border-primary/50 text-muted-foreground hover:text-primary hover:-translate-y-1 hover:shadow-md transition-all duration-200"
              aria-label="Email"
              onClick={() => trackEvent("click", "social_media", "email")}
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
