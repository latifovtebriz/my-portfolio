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
  SiRedis, SiClickhouse, SiOracle, SiRabbitmq, SiApachekafka, SiGit, SiMlflow,
  SiLangchain, SiHuggingface
} from "react-icons/si";

// Featured Technologies visual bar
const featuredTechs = [
  { name: "OpenAI", icon: SiOpenai, color: "text-emerald-500" },
  { name: "Claude", icon: SiAnthropic, color: "text-amber-600" },
  { name: "LangChain", icon: SiLangchain, color: "text-emerald-400" },
  { name: "Hugging Face", icon: SiHuggingface, color: "text-yellow-500" },
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
    category: "Generative AI & LLM Engineering",
    icon: Brain,
    color: "text-purple-500",
    skills: [
      { name: "Generative AI / LLM Integration", highlight: true },
      { name: "RAG (Retrieval-Augmented Generation)", highlight: true },
      { name: "Embeddings & Vector Search", highlight: true },
      { name: "Semantic Search", highlight: true },
      { name: "Prompt Engineering", highlight: true },
      { name: "Tool-using LLM & Agent Workflows", highlight: true },
      { name: "AI-Assisted Engineering Practices", highlight: true },
      { name: "Local/Self-hosted AI (Llama, Mistral, DeepSeek)", highlight: true },
      { name: "Model Inference & Serving (vLLM, Ollama)", highlight: true },
      { name: "Deterministic Guardrails & Safety", highlight: false },
      { name: "OCR & Document Data Extraction", highlight: false },
    ],
  },
  {
    category: "LLM Frameworks, APIs & Ecosystem",
    icon: Bot,
    color: "text-emerald-500",
    skills: [
      { name: "OpenAI API (GPT-4o, ChatGPT)", highlight: true },
      { name: "Anthropic Claude API", highlight: true },
      { name: "LangChain", highlight: true },
      { name: "LlamaIndex", highlight: true },
      { name: "Hugging Face Transformers", highlight: true },
      { name: "Meta Llama & Mistral AI", highlight: false },
    ],
  },
  {
    category: "Vector Databases & Search",
    icon: Database,
    color: "text-amber-500",
    skills: [
      { name: "Pinecone", highlight: true },
      { name: "FAISS", highlight: true },
      { name: "Weaviate", highlight: true },
      { name: "pgvector (PostgreSQL)", highlight: true },
    ],
  },
  {
    category: "Evaluation, MLOps & Experimentation",
    icon: TestTube2,
    color: "text-pink-500",
    skills: [
      { name: "LLM Output Evaluation (Accuracy, Relevance, Groundedness)", highlight: true },
      { name: "Ragas Framework", highlight: true },
      { name: "MLflow Tracking", highlight: true },
      { name: "A/B Testing of Prompts & Pipelines", highlight: true },
      { name: "Model Benchmarking & Token Optimization", highlight: false },
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
    <section id="skills" className="section-padding relative">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <Badge variant="outline" className="mb-2 text-primary border-primary/25 bg-primary/5 px-3.5 py-1 text-xs uppercase tracking-wider font-semibold">
                Core Stack
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Technical Skills & Tools
              </h2>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-xl">
                Specialized in Generative AI, LLM systems, scalable microservices, and DevOps/SRE practices.
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
            <div>
              {/* Featured Technologies Visual Icons Bar */}
              <div className="mb-12 glass-panel p-6 sm:p-8 rounded-3xl border border-border/70 shadow-sm">
                <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-5 text-center sm:text-left">
                  Core Technologies & Frameworks
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-10 gap-3">
                  {featuredTechs.map((tech, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center p-3 rounded-2xl bg-card/60 border border-border/60 hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 hover:-translate-y-1 hover:shadow-md group cursor-default"
                      title={tech.name}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1.5">
                        <tech.icon className={`w-6 h-6 ${tech.color} transition-transform duration-200 group-hover:scale-115`} />
                      </div>
                      <span className="text-[11px] font-semibold text-center truncate max-w-full text-foreground/80 group-hover:text-foreground">
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
                    <Card key={index} className="glass-panel card-hover-effect rounded-2xl border-border/70 hover:border-primary/50 transition-all">
                      <CardContent className="p-6 sm:p-7">
                        <div className="flex items-center gap-3.5 mb-5">
                          <div className={`p-2.5 rounded-xl bg-card border border-border/70 ${group.color} shadow-sm`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="text-lg font-bold tracking-tight">{group.category}</h3>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {group.skills.map((skill, sIdx) => (
                            <Badge
                              key={sIdx}
                              variant={skill.highlight ? "default" : "secondary"}
                              className={`text-xs py-1.5 px-3 rounded-lg font-medium transition-all ${
                                skill.highlight
                                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
                                  : "bg-muted/70 hover:bg-muted text-foreground/90 border border-border/60"
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
