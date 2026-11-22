import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Globe2, BookOpen, ChevronDown, ChevronUp, 
  MapPin, Calendar, Compass, ShieldCheck 
} from "lucide-react";

interface ResearchItem {
  title: string;
  role: string;
  organization: string;
  period: string;
  location?: string;
  description: string;
  tag: string;
}

const scientificResearches: ResearchItem[] = [
  {
    title: "Integrating Generative AI into Cloud-Native Systems",
    role: "Scientific Researcher",
    organization: "IAC 2026 Antalya (International Astronautical Congress)",
    period: "Jan 2026 – Sep 2026",
    location: "Antalya, Türkiye",
    description:
      "Advanced research on incorporating Generative AI and LLM agents into cloud-native microservices, optimizing automated telemetry, containerized workflows, and resilient distributed architectures.",
    tag: "Generative AI & Cloud",
  },
  {
    title: "The Role of Software Architectures in Space Systems",
    role: "Scientific Researcher",
    organization: "IAC 2025 Sydney (International Astronautical Congress)",
    period: "Jan 2025 – Sep 2025",
    location: "Sydney, Australia",
    description:
      "Research investigating high-reliability, fault-tolerant software engineering patterns, real-time message brokering, and deterministic execution required for space mission architectures.",
    tag: "Space Systems & Architecture",
  },
  {
    title: "Will Artificial Intelligence Replace Humans?",
    role: "Scientific Researcher",
    organization: "IKSAD Institute",
    period: "Jul 2024",
    location: "International Publication",
    description:
      "Published academic research examining LLM evolutionary trajectories, cognitive symbiosis between human developers and AI assistants, and future job market impact.",
    tag: "AI & Society",
  },
];

const globalConferences: ResearchItem[] = [
  {
    title: "XX International Tool Fair – GREEN FUTURE: Tools for Sustainable Transformation",
    role: "Tool Facilitator",
    organization: "International Tool Fair Community",
    period: "19–23 Oct 2026",
    location: "Sopot, Poland",
    description:
      "Participated in the 20th edition of the cross-sectoral event in Europe, focusing on sustainable development tools, green transition, and educational innovation.",
    tag: "Tool Facilitator",
  },
  {
    title: "Mindful Impact: Strengthening Youth Work From Within",
    role: "International Participant",
    organization: "Erasmus+ Training Course",
    period: "14–20 Sep 2026",
    location: "Kobuleti, Georgia",
    description:
      "Participated in an intensive international training focused on resilience, well-being, sustainable youth work practices, and practical non-formal methodologies.",
    tag: "Erasmus+",
  },
  {
    title: "Cool Facilitators",
    role: "International Participant & Facilitator",
    organization: "Erasmus+ Training Course",
    period: "18–25 May 2026",
    location: "Mezőberény, Hungary",
    description:
      "Explored the ethical integration of AI and digital tools into youth exchanges and non-formal education with an international facilitator network.",
    tag: "Ethical AI & Erasmus+",
  },
  {
    title: "COP30 – United Nations Climate Change Conference",
    role: "Virtual Participant & Tech Delegate",
    organization: "United Nations (UNFCCC) / COP30",
    period: "10–21 Nov 2025",
    location: "Belém, Brazil (Virtual)",
    description:
      "Participated virtually in the global climate summit, contributing to digital technology dialogues, green IT solutions, and international youth advocacy.",
    tag: "COP30 Virtual Delegate",
  },
  {
    title: "International Youth & Technology Program",
    role: "Tech Delegate",
    organization: "European Solidarity Corps (ESC) & Turkish Federation",
    period: "30 Aug – 17 Sep 2025",
    location: "Ankara, Türkiye",
    description:
      "Engaged in international technology programs, leadership development, cross-cultural collaboration, and digital youth empowerment initiatives.",
    tag: "ESC Program",
  },
  {
    title: "COP29 – United Nations Climate Change Conference",
    role: "Azerbaijan Delegate & ICT Onsite Support Technician",
    organization: "United Nations (UNFCCC) / COP29",
    period: "11–22 Nov 2024",
    location: "Baku, Azerbaijan",
    description:
      "Represented Azerbaijan at COP29 while delivering critical on-site ICT technical infrastructure support, networking, and digital systems for global delegations.",
    tag: "COP29 Delegate & ICT",
  },
  {
    title: "European Youth Development Project",
    role: "Project Participant",
    organization: "Slovenian National Agency (MOVIT)",
    period: "21 March 2024 to 12 Sep 2024",
    location: "Slovenia",
    description:
      "Participated in European activities focused on youth development, digital competencies, collaboration frameworks, and agile project coordination.",
    tag: "MOVIT / EU",
  },
];

export function ResearchConferencesSection() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section id="research" className="section-padding relative">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <Badge variant="outline" className="mb-2 text-primary border-primary/25 bg-primary/5 px-3.5 py-1 text-xs uppercase tracking-wider font-semibold">
                Global Impact
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Research & Global Conferences
              </h2>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-xl">
                International scientific papers, International Astronautical Congresses (IAC), and European Erasmus+ / UN delegations.
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
            <div className="space-y-12">
              {/* Scientific Research Subsection */}
              <div>
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Key Projects & Scientific Research</h3>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {scientificResearches.map((res, index) => (
                    <Card key={index} className="glass-panel card-hover-effect rounded-2xl border-border/70 hover:border-primary/50 transition-all">
                      <CardContent className="p-6 sm:p-7">
                        <div className="flex items-start justify-between mb-3.5 gap-2">
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/25 px-2.5 py-0.5 rounded-full font-medium">
                            {res.tag}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium shrink-0">
                            <Calendar className="h-3.5 w-3.5 inline text-primary/70" /> {res.period}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold mb-1.5 leading-snug tracking-tight">{res.title}</h4>
                        <div className="text-sm font-semibold text-primary mb-1.5">{res.organization}</div>
                        <div className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5 flex-wrap">
                          {res.location && (
                            <>
                              <MapPin className="h-3 w-3 inline text-muted-foreground/80" /> {res.location} •
                            </>
                          )}
                          <span className="font-semibold text-foreground/90">{res.role}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {res.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Global Conferences Subsection */}
              <div>
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Globe2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Conferences & Global Programs</h3>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {globalConferences.map((conf, index) => (
                    <Card key={index} className="glass-panel card-hover-effect rounded-2xl border-border/70 hover:border-primary/50 transition-all flex flex-col justify-between">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3.5 gap-2">
                          <Badge variant="secondary" className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-muted/70 border border-border/60">
                            {conf.tag}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-medium shrink-0">
                            {conf.period}
                          </span>
                        </div>
                        <h4 className="text-base font-bold mb-2 leading-snug line-clamp-2 tracking-tight" title={conf.title}>
                          {conf.title}
                        </h4>
                        <p className="text-xs font-semibold text-primary mb-1.5">{conf.organization}</p>
                        <p className="text-xs text-muted-foreground mb-3.5 flex items-center gap-1.5 flex-wrap">
                          <MapPin className="h-3 w-3 inline text-muted-foreground/80" /> {conf.location} • {conf.role}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {conf.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
