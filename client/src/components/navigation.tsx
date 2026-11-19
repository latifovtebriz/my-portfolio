import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Moon, Sun, Menu, Gamepad2 } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Link } from "wouter";
import { trackEvent } from "@/lib/analytics";

export function Navigation() {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "#about", label: "About" },
    { href: "#experience", label: "Experience" },
    { href: "#skills", label: "Skills" },
    { href: "#projects", label: "Projects" },
    { href: "#research", label: "Research" },
    { href: "#education", label: "Education" },
    { href: "#contact", label: "Contact" },
  ];

  const scrollToSection = (href: string) => {
    trackEvent("navigation", "click", href.replace("#", ""));
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b border-border/60 shadow-sm transition-all duration-300">
      <div className="container-custom">
        <div className="flex justify-between items-center py-3.5">
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-xl font-bold tracking-tight cursor-pointer select-none group"
          >
            <span className="font-mono text-primary group-hover:-translate-x-0.5 inline-block transition-transform">&lt;</span>
            <span className="text-gradient-ai font-extrabold px-0.5">Tabriz</span>
            <span className="font-mono text-primary group-hover:translate-x-0.5 inline-block transition-transform">/&gt;</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="px-3.5 py-1.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
              >
                {item.label}
              </button>
            ))}
            <Link to="/games">
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-200 text-sm font-semibold ml-2">
                <Gamepad2 className="h-4 w-4" />
                My Games
              </button>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                trackEvent("theme", "toggle", theme === "dark" ? "to_light" : "to_dark");
                toggleTheme();
              }}
              className="rounded-xl border border-border/60 hover:bg-muted/60 hover:border-primary/40 transition-all"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="rounded-xl border border-border/60" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="glass-panel border-l border-border/70">
                <div className="flex flex-col space-y-3 mt-8">
                  {navItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => scrollToSection(item.href)}
                      className="text-left px-3.5 py-2.5 rounded-xl hover:bg-muted/60 hover:text-primary transition-all text-base font-medium"
                    >
                      {item.label}
                    </button>
                  ))}
                  <Link to="/games">
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 text-left px-3.5 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all text-base font-semibold mt-2"
                    >
                      <Gamepad2 className="h-4 w-4" />
                      My Games
                    </button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
