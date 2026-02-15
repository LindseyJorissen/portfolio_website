"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import SpinningCup from "./SpinningCup";

// Matrix Rain Background Component
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const chars = "01アイウエオカキクケコサシスセソタチツテト{}[]<>/\\|=+-*&^%$#@!";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.025)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = "#8756e4";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-20"
    />
  );
}

// Terminal typing effect hook
function useTypewriter(text: string, speed: number = 50) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let index = 0;
    setDisplayedText("");
    setIsComplete(false);
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayedText, isComplete };
}

// Terminal Window Component
function TerminalWindow({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="terminal-window hover-lift">
      <div className="terminal-header">
        <div className="terminal-btn terminal-btn-red" />
        <div className="terminal-btn terminal-btn-yellow" />
        <div className="terminal-btn terminal-btn-green" />
        <span className="text-sm text-muted-foreground ml-2">{title}</span>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

// Project Card Component
function ProjectCard({
  title,
  description,
  tags,
  link,
  command
}: {
  title: string;
  description: string;
  tags: string[];
  link?: string;
  command: string;
}) {
  return (
    <Card className="bg-black/50 border-violet-500/30/30 hover:border-violet-500/30/60 transition-all hover-lift group">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <span className="text-violet-400">$</span>
          <code className="font-mono">{command}</code>
        </div>
        <h3 className="text-lg font-bold text-violet-400 group-hover:neon-text transition-all">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-secondary-foreground text-sm mb-4 leading-relaxed">{description}</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs border-accent/50 text-accent">
              {tag}
            </Badge>
          ))}
        </div>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-4 text-sm text-violet-400 hover:underline"
          >
            <span className="text-muted-foreground">&gt;</span> view_project
          </a>
        )}
      </CardContent>
    </Card>
  );
}

// Nav Link Component
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-muted-foreground hover:text-violet-400 transition-colors text-sm glitch"
    >
      <span className="text-violet-400 mr-1">&gt;</span>
      {children}
    </a>
  );
}

//Ascii art
function AsciiCoffee() {
  return (
<pre className="float text-[10px] sm:text-sm md:text-lg leading-none font-mono text-violet-400/70 select-none">
{`
        ( (
         ) )
      ........
      |      |]
      \\      /
      \`------'
`}
    </pre>
  )
}

//custom cursor
function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform =
          `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-3 h-3 bg-pink-400 rounded-full pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2"
    />
  );
}

export default function Portfolio() {
  const { displayedText, isComplete } = useTypewriter("Fullstack Developer", 80);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const projects = [
    {
      title: "Cloud Infrastructure Dashboard",
      description: "Real-time monitoring system for distributed cloud services with WebSocket connections and dynamic visualizations.",
      tags: ["React", "Node.js", "WebSocket", "D3.js"],
      command: "cat projects/cloud-dashboard.md",
      link: "#"
    },
    {
      title: "AI Code Review Bot",
      description: "GitHub integration that automatically reviews PRs using machine learning to detect bugs and suggest improvements.",
      tags: ["Python", "FastAPI", "OpenAI", "GitHub API"],
      command: "cat projects/ai-reviewer.md",
      link: "#"
    },
    {
      title: "E-Commerce Platform",
      description: "Full-featured marketplace with payment processing, inventory management, and real-time order tracking.",
      tags: ["Next.js", "PostgreSQL", "Stripe", "Redis"],
      command: "cat projects/marketplace.md",
      link: "#"
    },
    {
      title: "DevOps Pipeline Generator",
      description: "CLI tool that generates CI/CD configurations based on project analysis and best practices.",
      tags: ["Go", "Docker", "Kubernetes", "GitHub Actions"],
      command: "cat projects/pipeline-gen.md",
      link: "#"
    },
  ];

  return (
<div className="min-h-screen bg-black grid-bg scanlines relative cursor-none">
      {/* Activate Matrix Rain Background */}
      <MatrixRain />
      {/* Activate Custom CUrsor */}
      <CustomCursor />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-pink-400 font-bold text-lg crt-glow">~/portfolio</span>
              <span className="cursor-blink text-violet-400">_</span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <NavLink href="#about">about</NavLink>
              <NavLink href="#projects">projects</NavLink>
              <NavLink href="#socials">socials</NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="about" className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className={`space-y-6 ${mounted ? 'fade-in-up' : 'opacity-0'}`}>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  <span className="text-violet-400">user@dev</span>:<span className="text-accent">~</span>$ whoami
                </p>
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold neon-name">
  Lindsey Jorissen
</h1>

                <div className="flex items-center gap-2 text-xl sm:text-2xl text-violet-200">
                  <span className="text-muted-foreground">&gt;</span>
                  <span>{displayedText}</span>
                  {!isComplete && <span className="cursor-blink text-violet-400">|</span>}
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed max-w-lg">
                I build things that live on the internet. Usually when I want something no one has made before.
              </p>

              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">{`// based in Belgium`}</span>
              </div>
            </div>

            <div className="flex justify-center items-center">
<SpinningCup />
</div>

          </div>
        </div>
      </section>

      <Separator className="max-w-xl mx-auto bg-border/50" />

      {/* Projects Section */}
<section id="projects" className="pt-40 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="text-muted-foreground text-sm mb-2">
              <span className="text-violet-400">user@dev</span>:<span className="text-accent">~/projects</span>$ ls -la
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-violet-400">Featured Projects</h2>
            <p className="text-muted-foreground mt-2">Some things I've built</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <div
                key={project.title}
                className={`${mounted ? `fade-in-up delay-${index + 1}` : 'opacity-0'}`}
              >
                <ProjectCard {...project} />
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
              <span className="text-violet-400">$</span> git log --oneline | wc -l
              <span className="ml-2 text-accent">→ 1,247 commits this year</span>
            </p>
          </div>
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto bg-border/50" />

{/* Socials Section */}
<section id="socials" className="py-32 px-4 sm:px-6">
  <div className="max-w-6xl mx-auto text-center">

    <p className="text-zinc-500 text-sm mb-2">
      <span className="text-violet-400">user@dev</span>:~$ ls socials/
    </p>

    <h2 className="text-3xl sm:text-4xl font-bold text-violet-400 mb-12">
      Socials
    </h2>

    <div className="flex justify-center gap-10 text-lg">

      <a
        href="https://github.com/lindseyjorissen"
        target="_blank"
        className="text-zinc-400 hover:text-violet-400 transition-colors"
      >
        GitHub
      </a>

      <a
        href="https://www.linkedin.com/in/lindseyjorissen/"
        target="_blank"
        className="text-zinc-400 hover:text-violet-400 transition-colors"
      >
        LinkedIn
      </a>

      <a
        href="https://twitter.com"
        target="_blank"
        className="text-zinc-400 hover:text-violet-400 transition-colors"
      >
        Twitter
      </a>

    </div>
  </div>
</section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            <span className="text-violet-400">$</span> echo &quot;Built with Next.js, TypeScript &amp; lots of coffee&quot;
          </p>
          <p className="text-muted-foreground/50 text-xs mt-2">
            © 2026 Lindsey Jorissen. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
