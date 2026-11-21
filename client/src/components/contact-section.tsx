import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, Linkedin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Track form submission attempt
      trackEvent('form', 'contact', 'submit_attempt');

      // Send email via backend API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to send email');
      }

      // Track successful submission
      trackEvent('form', 'contact', 'submit_success');

      toast({
        title: "Message Sent!",
        description: "Thank you for your message. I'll get back to you soon.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      // Track submission error
      trackEvent('form', 'contact', 'submit_error');

      console.error('Contact form error:', error);
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please check your details or try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <section id="contact" className="section-padding relative">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-3 text-primary border-primary/25 bg-primary/5 px-3.5 py-1 text-xs uppercase tracking-wider font-semibold">
              Get in Touch
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Let's Connect & Build Together
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div className="glass-panel rounded-3xl p-7 sm:p-8 border border-border/70 card-hover-effect">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 tracking-tight">Open for Opportunities</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed text-sm sm:text-base">
                I'm always interested in discussing new opportunities, innovative AI solutions, microservice architecture, and engineering leadership. Whether you have a specific project or want to explore collaboration, feel free to reach out!
              </p>

              <div className="space-y-5">
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=latifovtebriz@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Send email via Gmail"
                  onClick={() => trackEvent('click', 'contact', 'email')}
                  className="flex items-center gap-4 p-3.5 rounded-2xl bg-card/60 border border-border/60 hover:border-primary/50 hover:bg-card/90 transition-all group cursor-pointer block"
                >
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0 group-hover:scale-105 group-hover:bg-primary/20 transition-all">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email (Gmail)</p>
                    <span className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate block">
                      latifovtebriz@gmail.com
                    </span>
                  </div>
                </a>

                <a
                  href="tel:+994507895282"
                  aria-label="Call +994507895282"
                  onClick={() => trackEvent('click', 'contact', 'phone')}
                  className="flex items-center gap-4 p-3.5 rounded-2xl bg-card/60 border border-border/60 hover:border-primary/50 hover:bg-card/90 transition-all group cursor-pointer block"
                >
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0 group-hover:scale-105 group-hover:bg-primary/20 transition-all">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone / Call</p>
                    <span className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate block">
                      +994 50 789 52 82
                    </span>
                  </div>
                </a>

                <a
                  href="https://www.linkedin.com/in/tabriz-latifov-544307260/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Profile"
                  className="flex items-center gap-4 p-3.5 rounded-2xl bg-card/60 border border-border/60 hover:border-primary/50 hover:bg-card/90 transition-all group cursor-pointer block"
                  onClick={() => trackEvent('click', 'social_media', 'linkedin_contact')}
                >
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0 group-hover:scale-105 group-hover:bg-primary/20 transition-all">
                    <Linkedin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LinkedIn</p>
                    <span className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate block">
                      linkedin.com/in/tabriz-latifov
                    </span>
                  </div>
                </a>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-7 sm:p-8 border border-border/70 card-hover-effect shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-foreground">Your Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="rounded-xl bg-slate-900/90 border border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/25 text-white placeholder:text-slate-400 transition-all py-5 [color-scheme:dark]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="rounded-xl bg-slate-900/90 border border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/25 text-white placeholder:text-slate-400 transition-all py-5 [color-scheme:dark]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-semibold text-foreground">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="Project Inquiry / Opportunity"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="rounded-xl bg-slate-900/90 border border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/25 text-white placeholder:text-slate-400 transition-all py-5 [color-scheme:dark]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-semibold text-foreground">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Share details about your project or inquiry..."
                    value={formData.message}
                    onChange={handleInputChange}
                    className="rounded-xl bg-slate-900/90 border border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/25 text-white placeholder:text-slate-400 transition-all resize-none [color-scheme:dark]"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}