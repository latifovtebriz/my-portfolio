import { Github, Linkedin, Mail, Phone, ArrowUp } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-card/40 backdrop-blur-xl border-t border-border/60 py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 flex flex-col items-center">
            <h3 className="text-2xl font-extrabold tracking-tight mb-1.5">
              <span className="font-mono text-primary">&lt;</span>
              <span className="text-gradient-ai">Tabriz Latifov</span>
              <span className="font-mono text-primary">/&gt;</span>
            </h3>
            <p className="text-muted-foreground text-sm font-medium">Generative AI & Software Engineer</p>
          </div>

          <div className="flex justify-center items-center gap-3 mb-8">
            <a
              href="https://github.com/latifovtebriz"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className="p-3 rounded-xl bg-card border border-border/70 text-muted-foreground hover:text-primary hover:border-primary/50 hover:-translate-y-0.5 transition-all shadow-sm"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com/in/tabriz-latifov-544307260"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="p-3 rounded-xl bg-card border border-border/70 text-muted-foreground hover:text-primary hover:border-primary/50 hover:-translate-y-0.5 transition-all shadow-sm"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=latifovtebriz@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Email via Gmail"
              className="p-3 rounded-xl bg-card border border-border/70 text-muted-foreground hover:text-primary hover:border-primary/50 hover:-translate-y-0.5 transition-all shadow-sm"
            >
              <Mail className="h-5 w-5" />
            </a>
            <a
              href="tel:+994507895282"
              aria-label="Call +994507895282"
              className="p-3 rounded-xl bg-card border border-border/70 text-muted-foreground hover:text-primary hover:border-primary/50 hover:-translate-y-0.5 transition-all shadow-sm"
            >
              <Phone className="h-5 w-5" />
            </a>
            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground hover:-translate-y-0.5 transition-all shadow-sm"
              title="Back to Top"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>

          <div className="border-t border-border/40 pt-6">
            <p className="text-muted-foreground text-xs font-medium">
              © {new Date().getFullYear()} Tabriz Latifov. Engineered with modern UI/UX Pro Max design standards.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
