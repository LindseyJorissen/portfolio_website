"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import SpinningCup from "./SpinningCup";
import dynamic from "next/dynamic";

const GitHubCalendar = dynamic(
  () => import("react-github-calendar").then(mod => mod.GitHubCalendar),
  { ssr: false }
);


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
      className="fixed inset-0 pointer-events-none z-0 opacity-60"
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
      <div className="terminal-header flex justify-between items-center">
  <span className="text-sm text-zinc-400 font-mono">{title}</span>
  <div className="flex items-center gap-4 text-zinc-500 text-xs">
    <span className="hover:text-violet-400 transition-colors cursor-pointer">—</span>
    <span className="hover:text-violet-400 transition-colors cursor-pointer">▢</span>
    <span className="hover:text-red-400 transition-colors cursor-pointer">✕</span>
  </div>
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
      className="fixed top-0 left-0 w-3 h-3 better-pink-bg rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
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
<div className="h-screen w-screen overflow-hidden relative bg-black cursor-none">
  <MatrixRain />
  <CustomCursor />

  <div className="absolute inset-0 flex items-center justify-center ">

    {/* Workspace Window (Coffee - Back Layer) */}
    <div className="absolute w-[80%] h-[70%] z-10 -translate-y-14 border-violet-500/10
shadow-[0_10px_40px_rgba(0,0,0,0.5)]
">
      <TerminalWindow title="~/workspace">
        <div className="flex items-center justify-center h-[500px]">
          <SpinningCup />
        </div>
      </TerminalWindow>
    </div>
{/* About Window (Front Layer) */}
<div
  className="
    absolute
    w-[450px]
    top-[14%]
    left-[15%]
    z-20 border-violet-500/40
shadow-[0_20px_80px_rgba(180,0,255,0.15)]

  "
>
  <TerminalWindow title="~/about">

    <p className="text-zinc-400 text-sm mb-2">
      <span className="text-violet-400">user@dev</span>:~$ whoami
    </p>

    <h1 className="text-2xl font-bold neon-name mb-2">
      Lindsey Jorissen
    </h1>

    <div className="flex items-center gap-2 text-lg text-violet-200 mb-4">
      <span className="text-zinc-500">&gt;</span>
      <span>{displayedText}</span>
      {!isComplete && (
        <span className="cursor-blink text-violet-400">|</span>
      )}
    </div>

    <p className="text-zinc-400 text-sm mb-4">
      I build systems that live on the internet.
      Usually when I want something no one has made before.
    </p>

  </TerminalWindow>
</div>
{/* Projects Window (Top Layer) */}
<div
  className="
    absolute
    w-[550px]
    top-[22%]
    right-[5%]
    z-30     z-20 border-violet-500/40
shadow-[0_20px_80px_rgba(180,0,255,0.15)]

  "
>
  <TerminalWindow title="~/projects">

    <p className="text-zinc-400 text-sm mb-4">
      <span className="text-violet-400">user@dev</span>:~/projects$ ls
    </p>

    <div className="space-y-4">
      {projects.slice(0, 3).map((project) => (
        <div
          key={project.title}
          className="group cursor-pointer"
        >
          <div className="text-violet-400 font-mono text-sm">
            {project.title}
          </div>
          <div className="text-zinc-400 text-xs">
            {project.description}
          </div>
        </div>
      ))}
    </div>

  </TerminalWindow>
</div>
{/* System Window */}
<div
  className="
    absolute
    w-[650px]
    bottom-[7%]
    left-[3%]
    z-25
    rotate-[-0.5deg]     z-20 border-violet-500/40
shadow-[0_20px_80px_rgba(180,0,255,0.15)]

  "
>
  <TerminalWindow title="~/system">

    <p className="text-zinc-400 text-sm mb-4">
      <span className="text-violet-400">user@dev</span>:~$ system-status
    </p>

    <div className="space-y-3 text-sm">

      <div className="flex justify-between">
        <span className="text-zinc-400">LOCATION</span>
        <span className="text-violet-300">Belgium</span>
      </div>

      <div className="flex justify-between">
        <span className="text-zinc-400">COFFEE LEVEL</span>
        <span className="text-violet-400">████████░░</span>
      </div>

    </div>

    <div className="mt-6">
      <GitHubCalendar
        username="lindseyjorissen"
        blockSize={8}
        blockMargin={3}
        fontSize={10}
        hideColorLegend
        theme={{
          light: ["#1a1a2e","#3b1e6d","#5b2bb5","#7a33ff","#b266ff"],
          dark: ["#1a1a2e","#3b1e6d","#5b2bb5","#7a33ff","#b266ff"]
        }}
      />
    </div>

  </TerminalWindow>
</div>

  </div>
</div>

);
}