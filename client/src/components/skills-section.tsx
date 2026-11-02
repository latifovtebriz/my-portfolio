import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, Bot, Sparkles, Server, Cloud, Database, 
  Workflow, GitBranch, Terminal, Layers, Cpu, 
  CheckCircle2, ChevronDown, ChevronUp, TestTube2, Network
} from "lucide-react";
import { 
  SiSharp, SiDotnet, SiPython, SiFastapi, SiFlask, SiPandas, SiNumpy,
  SiOpenai, SiAnthropic, SiDocker, SiKubernetes, SiTerraform, SiAnsible,
  SiPrometheus, SiGrafana, SiElasticsearch, SiLinux, SiPostgresql,
  SiRedis, SiClickhouse, SiOracle, SiRabbitmq, SiApachekafka, SiGit, SiMlflow
} from "react-icons/si";

// Featured Technologies visual bar
const featuredTechs = [
  { name: "OpenAI", icon: SiOpenai, color: "text-emerald-500" },
  { name: "Claude", icon: SiAnthropic, color: "text-amber-600" },
  { name: "Python", icon: SiPython, color: "text-yellow-500" },
  { name: "FastAPI", icon: SiFastapi, color: "text-teal-500" },
  { name: "C#", icon: SiSharp, color: "text-purple-600" },
  { name: ".NET Core", icon: SiDotnet, color: "text-purple-700" },
  { name: "Docker", icon: SiDocker, color: "text-blue-500" },
  { name: "Kubernetes", icon: SiKubernetes, color: "text-blue-600" },
  { name: "Terraform", icon: SiTerraform, color: "text-indigo-500" },
  { name: "Prometheus", icon: SiPrometheus, color: "text-orange-500" },
  { name: "Grafana", icon: SiGrafana, color: "text-orange-600" },
  { name: "PostgreSQL", icon: SiPostgresql, color: "text-blue-700" },
  { name: "Redis", icon: SiRedis, color: "text-red-500" },
  { name: "ClickHouse", icon: SiClickhouse, color: "text-yellow-600" },
  { name: "RabbitMQ", icon: SiRabbitmq, color: "text-orange-600" },
  { name: "Kafka", icon: SiApachekafka, color: "text-slate-200" },
  { name: "MLflow", icon: SiMlflow, color: "text-blue-400" },
  { name: "Linux", icon: SiLinux, color: "text-amber-400" },
];

interface SkillGroup {
  category: string;
  icon: any;
  color: string;
  badgeVariant?: "default" | "secondary" | "outline";
  skills: { name: string; highlight?: boolean }[];
}

const skillGroups: SkillGroup[] = [
  {
    category: "LLM & AI Engineering",
    icon: Brain,
    color: "text-purple-500",
    skills: [
      { name: "Prompt Engineering", highlight: true },
      { name: "RAG (Retrieval-Augmented Generation)", highlight: true },
      { name: "Embeddings & Vector Search", highlight: true },
      { name: "Semantic Search", highlight: true },
      { name: "Tool-using LLM & Agent Workflows", highlight: true },
      { name: "Model Selection", highlight: false },
      { name: "OCR & Document Data Extraction", highlight: false },
      { name: "Self-hosting Open-Source Models (Llama, Mistral)", highlight: true },
    ],
  },
  {
    category: "LLM Providers & Frameworks",
    icon: Bot,
    color: "text-emerald-500",
    skills: [
      { name: "OpenAI (GPT-4, ChatGPT API)", highlight: true },
      { name: "Anthropic Claude", highlight: true },
      { name: "Llama (Meta)", highlight: true },
      { name: "Mistral AI", highlight: true },
      { name: "LangChain", highlight: true },
      { name: "LlamaIndex", highlight: true },
    ],
  },
  {
    category: "Vector Databases",
    icon: Database,
    color: "text-amber-500",
    skills: [
      { name: "Pinecone", highlight: true },
      { name: "FAISS", highlight: true },
      { name: "Weaviate", highlight: true },
    ],
  },
  {
    category: "Evaluation & Experimentation",
    icon: TestTube2,
    color: "text-pink-500",
    skills: [
      { name: "LLM Output Evaluation (Accuracy, Relevance, Quality)", highlight: true },
      { name: "Ragas", highlight: true },
      { name: "MLflow", highlight: true },
      { name: "A/B Testing of Prompts & Pipelines", highlight: true },
      { name: "Model Configurations & Benchmarking", highlight: false },
    ],
  },
  {
    category: "Languages & Frameworks",
    icon: Terminal,
    color: "text-blue-500",
    skills: [
      { name: "Python", highlight: true },
      { name: "FastAPI", highlight: true },
      { name: "Flask", highlight: false },
      { name: "Pandas", highlight: false },
      { name: "NumPy", highlight: false },
      { name: "C#", highlight: true },
      { name: ".NET Core", highlight: true },
      { name: "ASP.NET Web API", highlight: true },
      { name: "ASP.NET MVC", highlight: false },
    ],
  },
  {
    category: "DevOps & Cloud (SRE)",
    icon: Cloud,
    color: "text-cyan-500",
    skills: [
      { name: "Azure DevOps", highlight: true },
      { name: "CI/CD Automation", highlight: true },
      { name: "Docker", highlight: true },
      { name: "Kubernetes", highlight: true },
      { name: "Terraform", highlight: true },
      { name: "Ansible", highlight: false },
      { name: "Prometheus", highlight: true },
      { name: "Grafana", highlight: true },
      { name: "ELK Stack", highlight: false },
      { name: "Linux OS", highlight: true },
    ],
  },
  {
    category: "Databases & Messaging",
    icon: Network,
    color: "text-orange-500",
    skills: [
      { name: "PostgreSQL", highlight: true },
      { name: "Microsoft SQL Server", highlight: true },
      { name: "Redis", highlight: true },
      { name: "ClickHouse", highlight: true },
      { name: "Oracle Database", highlight: false },
      { name: "RabbitMQ", highlight: true },
      { name: "Kafka", highlight: true },
    ],
  },
  {
    category: "Architecture & Practices",
    icon: Layers,
    color: "text-violet-500",
    skills: [
      { name: "Microservice Architecture", highlight: true },
      { name: "CQRS", highlight: true },
      { name: "DDD (Domain-Driven Design)", highlight: true },
      { name: "SRE Practices", highlight: true },
      { name: "Agile / Scrum", highlight: false },
      { name: "Git & GitOps", highlight: true },
    ],
  },
];

export function SkillsSection() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section id="skills" className="section-padding">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Technical Skills
              </h2>
              <p className="text-muted-foreground mt-2 text-sm md:text-base">
                Specialized in Generative AI, LLM systems, scalable microservices, and DevOps/SRE practices.
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
            <div>
              {/* Featured Technologies Visual Icons Bar */}
              <div className="mb-12">
                <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-3 md:gap-4">
                  {featuredTechs.map((tech, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center p-3 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all hover:scale-105 group"
                    >
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-2">
                        <tech.icon className={`w-7 h-7 ${tech.color} transition-transform group-hover:scale-110`} />
                      </div>
                      <span className="text-xs font-medium text-center truncate max-w-full">
                        {tech.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categorized Skills Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {skillGroups.map((group, index) => {
                  const Icon = group.icon;
                  return (
                    <Card key={index} className="border-border/60 hover:border-primary/40 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-5">
                          <div className={`p-2.5 rounded-lg bg-muted/60 ${group.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="text-lg font-bold">{group.category}</h3>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {group.skills.map((skill, sIdx) => (
                            <Badge
                              key={sIdx}
                              variant={skill.highlight ? "default" : "secondary"}
                              className={`text-xs py-1.5 px-3 font-medium transition-colors ${
                                skill.highlight
                                  ? "bg-primary/90 hover:bg-primary text-primary-foreground"
                                  : "bg-muted hover:bg-muted/80 text-foreground"
                              }`}
                            >
                              {skill.name}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
