import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, Download } from "lucide-react";
import { TypeAnimation } from "react-type-animation";
import tabrizPhoto from "@/assets/profile-image.png";
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
    <section className="pt-24 pb-16 gradient-bg">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <img
              src={tabrizPhoto}
              alt="Tabriz Latifov"
              className="rounded-full mx-auto w-64 h-64 object-cover border-4 border-background shadow-xl"
            />
          </div>

          <div className="mb-4 text-xl md:text-2xl font-semibold min-h-[64px] flex items-center justify-center">
            <TypeAnimation
              sequence={[
                "Hi, I'm Tabriz!",
                1000,
                "Generative AI & Software Engineer",
                1500,
                "LLMs | RAG | Vector Search | Agent Workflows",
                1500,
                "C# / .NET Core & Microservices Architecture",
                1500,
                "Cloud Infrastructure, DevOps & SRE",
                1500,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </div>

          <p className="text-lg mb-8 max-w-3xl mx-auto text-muted-foreground leading-relaxed">
            Software Engineer with <strong>4+ years of experience</strong> in C# and the .NET ecosystem, microservices architecture, and DevOps practices, plus <strong>2+ years of experience</strong> in Python development and AI/LLM engineering. Proven track record in designing scalable systems, building production-grade RAG pipelines, vector search, and managing cloud infrastructure.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button onClick={scrollToContact} size="lg" className="px-8 shadow-md">
              Contact Me
            </Button>
            <Button variant="outline" size="lg" className="px-8 shadow-sm" onClick={downloadCV}>
              <Download className="mr-2 h-4 w-4" />
              Download CV
            </Button>
          </div>

          <div className="flex justify-center space-x-6">
            <a
              href="https://github.com/latifovtebriz"
              className="text-muted-foreground hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              onClick={() => trackEvent("click", "social_media", "github")}
            >
              <Github className="h-6 w-6" />
            </a>
            <a
              href="https://linkedin.com/in/tabriz-latifov-544307260"
              className="text-muted-foreground hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              onClick={() => trackEvent("click", "social_media", "linkedin")}
            >
              <Linkedin className="h-6 w-6" />
            </a>
            <a
              href="mailto:latifovtebriz@gmail.com"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Email"
              onClick={() => trackEvent("click", "social_media", "email")}
            >
              <Mail className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
