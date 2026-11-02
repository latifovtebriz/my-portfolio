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
  {
    title: "Virtual Delegate for COP30 Brazil",
    role: "Virtual Delegate",
    organization: "United Nations",
    period: "Nov 2025 – Dec 2025",
    location: "Brazil (Virtual)",
    description:
      "Represented technological and digital perspectives in international climate negotiations, advocating for green IT, efficient cloud architectures, and AI-driven sustainability tools.",
    tag: "Global Delegation",
  },
];

const globalConferences: ResearchItem[] = [
  {
    title: "XX International Tool Fair – GREEN FUTURE: Tools for Sustainable Transformation",
    role: "Tool Facilitator",
    organization: "International Tool Fair Community",
    period: "Oct 2026",
    location: "Sopot, Poland",
    description:
      "Participated in the 20th edition of the cross-sectoral community-of-practice event gathering diverse organisations and project leaders across Europe and beyond. Engaged in discussions, peer-to-peer learning, and sessions focused on Education for Sustainable Development (ESD) tools, green transition, and innovative methodological approaches.",
    tag: "Tool Facilitator",
  },
  {
    title: "Mindful Impact: Strengthening Youth Work From Within",
    role: "International Participant",
    organization: "Erasmus+ Training Course",
    period: "Sep 2026",
    location: "Kobuleti, Georgia",
    description:
      "Participated in an intensive international training focused on well-being, resilience, personal development, and sustainable youth work practices. Engaged in non-formal learning and practical methodologies for maximizing impact.",
    tag: "Erasmus+",
  },
  {
    title: "Cool Facilitators",
    role: "International Participant & Facilitator",
    organization: "Erasmus+ Training Course",
    period: "18–27 May 2026",
    location: "Mezőberény, Hungary",
    description:
      "Explored the ethical integration of AI and digital tools into youth exchanges and non-formal educational activities. Co-designed human-centered and participatory digital methodologies with an international facilitator network.",
    tag: "Ethical AI & Erasmus+",
  },
  {
    title: "International Youth & Technology Program",
    role: "Tech Delegate",
    organization: "European Solidarity Corps (ESC) & Turkish Federation",
    period: "Aug 2025 – Sep 2025",
    location: "Ankara, Türkiye",
    description:
      "Engaged in international technology programs, leadership development, cross-cultural collaboration, and digital youth empowerment initiatives.",
    tag: "ESC Program",
  },
  {
    title: "European Youth Development Project",
    role: "Project Participant",
    organization: "Slovenian National Agency (MOVIT)",
    period: "Aug 2024 – Sep 2024",
    location: "Slovenia",
    description:
      "Participated in European activities focused on youth development, digital competencies, collaboration frameworks, and agile project coordination.",
    tag: "MOVIT / EU",
  },
];

export function ResearchConferencesSection() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section id="research" className="section-padding">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Research & Global Conferences
              </h2>
              <p className="text-muted-foreground mt-2 text-sm md:text-base">
                International scientific papers, space congresses (IAC), and European Erasmus+ / UN delegations.
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
            <div className="space-y-12">
              {/* Scientific Research Subsection */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="text-2xl font-bold">Key Projects & Scientific Research</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {scientificResearches.map((res, index) => (
                    <Card key={index} className="border-border/60 hover:border-primary/50 transition-all hover:shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                            {res.tag}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3 inline" /> {res.period}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold mb-1 leading-snug">{res.title}</h4>
                        <div className="text-sm font-semibold text-primary mb-1">{res.organization}</div>
                        <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                          {res.location && (
                            <>
                              <MapPin className="h-3 w-3 inline" /> {res.location} •
                            </>
                          )}
                          <span className="font-medium text-foreground/80">{res.role}</span>
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
                <div className="flex items-center gap-2 mb-6">
                  <Globe2 className="h-5 w-5 text-primary" />
                  <h3 className="text-2xl font-bold">Conferences & Global Programs</h3>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {globalConferences.map((conf, index) => (
                    <Card key={index} className="border-border/60 hover:border-primary/50 transition-all hover:shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {conf.tag}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {conf.period}
                          </span>
                        </div>
                        <h4 className="text-base font-bold mb-2 leading-snug line-clamp-2" title={conf.title}>
                          {conf.title}
                        </h4>
                        <p className="text-xs font-semibold text-primary mb-1">{conf.organization}</p>
                        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                          <MapPin className="h-3 w-3 inline" /> {conf.location} • {conf.role}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
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
