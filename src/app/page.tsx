"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import SpinningCup from "./SpinningCup";
import dynamic from "next/dynamic";

const GitHubCalendar = dynamic(
  () => import("react-github-calendar").then((mod) => mod.GitHubCalendar),
  { ssr: false },
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

    const chars =
      "01アイウエオカキクケコサシスセソタチツテト{}[]<>/\\|=+-*&^%$#@!";
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

// Terminal window
function TerminalWindow({
  title,
  children,
  initialX,
  initialY,
  zIndex,
  width,
}: {
  title: string;
  children: React.ReactNode;
  initialX: number;
  initialY: number;
  zIndex: number;
  width: number;
}) {
  
  const [position, setPosition] = useState({
  x: initialX,
  y: initialY,
});

const [isDragging, setIsDragging] = useState(false);

const dragOffset = useRef({ x: 0, y: 0 });

useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    setPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);

  return () => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };
}, [isDragging]);

  return (
    <div
      style={{
        position: "absolute",
      left: position.x,
top: position.y,
        width: width,
        zIndex: zIndex,
      }}
      className="
        rounded-xl
        border border-violet-500/20
        bg-zinc-900/40
        backdrop-blur-md
        shadow-[0_20px_60px_rgba(0,0,0,0.6)]
        overflow-hidden
      ">
<div
  className="terminal-header flex justify-between items-center cursor-move select-none"
  onMouseDown={(e) => {
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  }}
>
        <span className="text-sm text-zinc-400 font-mono">{title}</span>
        <div className="flex items-center gap-4 text-zinc-500 text-xs">
          <span className="hover:text-violet-400 transition-colors cursor-pointer">
            —
          </span>
          <span className="hover:text-violet-400 transition-colors cursor-pointer">
            ▢
          </span>
          <span className="hover:text-red-400 transition-colors cursor-pointer">
            ✕
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

export default function Portfolio() {
  const { displayedText, isComplete } = useTypewriter(
    "Fullstack Developer",
    80,
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const projects = [
    {
      title: "Cloud Infrastructure Dashboard",
      description:
        "Real-time monitoring system for distributed cloud services with WebSocket connections and dynamic visualizations.",
      tags: ["React", "Node.js", "WebSocket", "D3.js"],
      command: "cat projects/cloud-dashboard.md",
      link: "#",
    },
    {
      title: "AI Code Review Bot",
      description:
        "GitHub integration that automatically reviews PRs using machine learning to detect bugs and suggest improvements.",
      tags: ["Python", "FastAPI", "OpenAI", "GitHub API"],
      command: "cat projects/ai-reviewer.md",
      link: "#",
    },
    {
      title: "E-Commerce Platform",
      description:
        "Full-featured marketplace with payment processing, inventory management, and real-time order tracking.",
      tags: ["Next.js", "PostgreSQL", "Stripe", "Redis"],
      command: "cat projects/marketplace.md",
      link: "#",
    },
    {
      title: "DevOps Pipeline Generator",
      description:
        "CLI tool that generates CI/CD configurations based on project analysis and best practices.",
      tags: ["Go", "Docker", "Kubernetes", "GitHub Actions"],
      command: "cat projects/pipeline-gen.md",
      link: "#",
    },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-black">
      <MatrixRain />
      <div className="absolute inset-0">
        {/* Workspace Window (Coffee - Back Layer) */}
        <TerminalWindow
          title="~/workspace"
          initialX={150}
          initialY={90}
          zIndex={10}
          width={1180}>
          <div className="flex items-center justify-center h-125">
            <SpinningCup />
          </div>
        </TerminalWindow>

        {/* About Window (Front Layer) */}
        <TerminalWindow
          title="~/about"
          initialX={230}
          initialY={130}
          zIndex={20}
          width={420}>
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
            I build systems that live on the internet. Usually when I want
            something no one has made before.
          </p>
        </TerminalWindow>

        {/* Projects Window (Top Layer) */}
        <TerminalWindow
          title="~/projects"
          initialX={880}
          initialY={200}
          zIndex={30}
          width={550}>
          <p className="text-zinc-400 text-sm mb-4">
            <span className="text-violet-400">user@dev</span>:~/projects$ ls
          </p>

          <div className="space-y-4">
            {projects.slice(0, 3).map((project) => (
              <div key={project.title} className="group cursor-pointer">
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

        {/* System Window */}
        <TerminalWindow
          title="~/system"
          initialX={50}
          initialY={480}
          zIndex={25}
          width={650}>
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
              theme={{
                light: ["#1a1a2e", "#3b1e6d", "#5b2bb5", "#7a33ff", "#b266ff"],
                dark: ["#1a1a2e", "#3b1e6d", "#5b2bb5", "#7a33ff", "#b266ff"],
              }}
            />
          </div>
        </TerminalWindow>
      </div>
      {/* Social Dock */}
<div className="absolute bottom-8 right-5 w-45 flex flex-col gap-2 text-sm font-mono">
  <a
    href="https://github.com/lindseyjorissen"
    target="_blank"
className="text-zinc-500 hover:text-violet-400 hover:tracking-wider transition-all duration-200"
  >
    [ /dev/github ]
  </a>

  <a
    href="https://www.linkedin.com/in/lindseyjorissen/"
    target="_blank"
className="text-zinc-500 hover:text-violet-400 hover:tracking-wider transition-all duration-200"
  >
    [ /dev/linkedin ]
  </a>

  <a
    href="https://twitter.com"
    target="_blank"
className="text-zinc-500 hover:text-violet-400 hover:tracking-wider transition-all duration-200"
  >
    [ /dev/x ]
  </a>
</div>

    </div>
  );
}
