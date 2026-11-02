import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, BookOpen, ChevronDown, ChevronUp, Download, GraduationCap } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const education = [
  {
    institution: "Baku Engineering University",
    degree: "Bachelor of Science in Computer Engineering",
    period: "Sep 2022 – Sep 2026",
    location: "Baku, Azerbaijan",
    description:
      "Core focus on computer engineering, algorithm design, data structures, distributed systems, and modern software architecture.",
    status: "in-progress",
  },
  {
    institution: "Massachusetts Institute of Technology (MIT)",
    degree: "Computer Science and Programming",
    period: "Aug 2024 – Nov 2024",
    location: "Online",
    description:
      "Advanced computational thinking, data algorithms, and programmatic problem-solving methodologies.",
    status: "completed",
  },
  {
    institution: "Stanford University",
    degree: "Algorithms: Divide and Conquer, Sorting and Searching",
    period: "Jan 2024 – Apr 2024",
    location: "Online",
    description:
      "Rigorous algorithm analysis, master method, randomized algorithms, divide-and-conquer paradigms, and complex sorting networks.",
    status: "completed",
  },
  {
    institution: "Udemy Professional Certification",
    degree: "Generative AI & Cloud Engineering Professional (60+ hours)",
    period: "Nov 2024 – Apr 2025",
    location: "Online",
    description:
      "Comprehensive mastery in LLM orchestration, RAG architectures, cloud deployment, embeddings, vector databases, and enterprise AI engineering.",
    status: "completed",
  },
];

const achievements = [
  {
    title: "Will Artificial Intelligence Replace Humans?",
    organization: "IKSAD Institute / Scopus Indexed",
    type: "publication",
    year: "2024",
    description:
      "Scientific research paper examining the transformative trajectory of AI, LLM capabilities, and their synergy with human expertise.",
    downloadUrl: "/assets/Article AI by Tabriz Latifov.pdf",
    status: "published",
  },
  {
    title: "Algorithms & Data Structures",
    organization: "Stanford University (Coursera)",
    type: "certificate",
    year: "2024",
    description:
      "Advanced algorithmic complexity, sorting, graph traversal, and performance optimization techniques.",
    downloadUrl: "/assets/Stanford - Algorithms Coursera.pdf",
    status: "completed",
  },
  {
    title: "Computer Science and Programming using Python",
    organization: "MITx 6.00",
    type: "certificate",
    year: "2024",
    description:
      "Computational problem-solving, algorithmic thinking, and advanced Python architecture.",
    downloadUrl: "/assets/MITx 6.00.pdf",
    status: "completed",
  },
  {
    title: "JavaScript Certificate",
    organization: "CISCO Networking Academy",
    type: "certificate",
    year: "2023",
    description:
      "Comprehensive JavaScript programming certification covering ES6+, DOM manipulation, and modern web application development.",
    downloadUrl: "/assets/CISCO Certificate.png",
    status: "completed",
  },
  {
    title: "C# Programming",
    organization: "Coursera",
    type: "certificate",
    year: "2022",
    description:
      "Object-oriented programming, .NET architecture, and enterprise application development in C#.",
    downloadUrl: "/assets/Coursera CSharp.pdf",
    status: "completed",
  },
  {
    title: "Data Structure and OOP",
    organization: "Programming Academy",
    type: "certificate",
    year: "2022",
    description:
      "Fundamental data structures, abstraction, memory management, and OOP design patterns.",
    downloadUrl: "/assets/Data Structured Certificate.pdf",
    status: "completed",
  },
  {
    title: "C++ Programming",
    organization: "Coursera",
    type: "certificate",
    year: "2021",
    description:
      "Memory management, pointers, templates, and low-level system performance optimization in C++.",
    downloadUrl: "/assets/Coursera CPlusPlus.pdf",
    status: "completed",
  },
];

export function EducationSection() {
  const [isEducationExpanded, setIsEducationExpanded] = useState(true);
  const [isAchievementsExpanded, setIsAchievementsExpanded] = useState(true);

  const handleDownload = (url: string, title: string) => {
    trackEvent("download", "certificate", title);
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop() || title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="education" className="section-padding bg-muted/20">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Education & Certifications
          </h2>

          {/* Education Subsection */}
          <div className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-bold">Formal Education & Training</h3>
              </div>
              <button
                onClick={() => setIsEducationExpanded(!isEducationExpanded)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {isEducationExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {isEducationExpanded ? "Collapse" : "Expand"}
              </button>
            </div>

            {isEducationExpanded && (
              <div className="grid md:grid-cols-2 gap-6">
                {education.map((edu, index) => (
                  <Card key={index} className="border-border/60 hover:border-primary/40 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-lg leading-tight">{edu.degree}</h4>
                        <Badge variant="outline" className="text-xs">
                          {edu.period}
                        </Badge>
                      </div>
                      <p className="font-semibold text-primary mb-1 text-sm">{edu.institution}</p>
                      <p className="text-xs text-muted-foreground mb-3">{edu.location}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {edu.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Certificates Subsection */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-bold">Certificates & Published Work</h3>
              </div>
              <button
                onClick={() => setIsAchievementsExpanded(!isAchievementsExpanded)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {isAchievementsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {isAchievementsExpanded ? "Collapse" : "Expand"}
              </button>
            </div>

            {isAchievementsExpanded && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement, index) => (
                  <Card
                    key={index}
                    className="relative group hover:shadow-lg transition-all border-border/60 hover:border-primary/40"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm leading-tight mb-2 line-clamp-2">
                            {achievement.title}
                          </h4>
                          <p className="text-xs text-primary font-medium mb-2 truncate">
                            {achievement.organization}
                          </p>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="text-xs capitalize">
                              {achievement.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {achievement.year}
                            </Badge>
                          </div>
                        </div>
                        {achievement.downloadUrl && (
                          <button
                            onClick={() => handleDownload(achievement.downloadUrl!, achievement.title)}
                            className="ml-2 p-2 rounded-lg bg-muted hover:bg-primary/20 hover:text-primary transition-colors flex-shrink-0"
                            title="Download Certificate / Paper"
                          >
                            <Download className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {achievement.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
