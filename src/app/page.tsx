"use client";

import { useState, useEffect, useRef } from "react";
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

// Terminal typing effect
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
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  initialX: number;
  initialY: number;
  zIndex: number;
  width: number;
  onClose?: () => void;
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
        }}>
        <span className="text-sm text-zinc-400 font-mono">{title}</span>
        <div className="flex items-center gap-4 text-zinc-500 text-xs">
          <span className="hover:text-violet-400 transition-colors cursor-pointer">
            —
          </span>
          <span className="hover:text-violet-400 transition-colors cursor-pointer">
            ▢
          </span>
          <span
            onClick={onClose}
            className="hover:text-red-400 transition-colors cursor-pointer">
            ✕
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

export default function Portfolio() {
  const [activeProject, setActiveProject] = useState<null | {
    name: string;
    description: string;
    stack: string;
  }>(null);
  const [openWindows, setOpenWindows] = useState({
    workspace: true,
    about: true,
    projects: true,
    system: true,
  });

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
      title: "Booktomo",
      description:
        "Reading analytics platform that visualizes your book data in interactive graphs. Uses NetworkX to generate relationship graphs and suggest new books based on your own reading patterns.",
      stack: "Django + React",
      link: "#",
    },
    {
      title: "Pookiebase",
      description:
        "Mobile-first book collection manager with ISBN scanner. Pulls metadata from Google Books API to generate previews before adding to collection or wishlist.",
      stack: "Flask",
      link: "#",
    },
    {
      title: "Spacewise",
      description:
        "Property intelligence platform focused on spatial data and smart filtering. Integrates geolocation APIs and structured property datasets to surface meaningful real-estate insights.",
      stack: "Django",
      link: "#",
    },
    {
      title: "This Portfolio",
      description:
        "Cyberpunk terminal-style portfolio with draggable glass windows, custom matrix rain canvas, and a Three.js shaded coffee cup.",
      stack: "Next.js + Tailwind + Three.js",
      link: "#",
    },
  ];

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-black">
      <MatrixRain />
      <div className="absolute inset-0">
        {/* Workspace Window (Coffee)*/}
        {openWindows.workspace && (
          <TerminalWindow
            title="~/workspace"
            initialX={150}
            initialY={90}
            zIndex={10}
            width={1180}
            onClose={() =>
              setOpenWindows((prev) => ({ ...prev, workspace: false }))
            }>
            <div className="flex items-center justify-center h-125">
              <SpinningCup />
            </div>
          </TerminalWindow>
        )}
        {/* About Window */}
        {openWindows.about && (
          <TerminalWindow
            title="~/about"
            initialX={230}
            initialY={130}
            zIndex={20}
            width={420}
            onClose={() =>
              setOpenWindows((prev) => ({ ...prev, about: false }))
            }>
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
        )}
        {/* Projects Window */}
        {openWindows.projects && (
          <TerminalWindow
            title="~/projects"
            initialX={880}
            initialY={190}
            zIndex={30}
            width={550}
            onClose={() =>
              setOpenWindows((prev) => ({ ...prev, projects: false }))
            }>
            <p className="text-zinc-400 text-sm mb-4">
              <span className="text-violet-400">user@dev</span>:~/projects$ ls
            </p>

            <div className="space-y-2 font-mono text-sm">
              {projects.map((project) => (
                <div
                  key={project.title}
                  className="text-violet-400 font-mono text-sm cursor-pointer hover:text-pink-400 transition-colors"
                  onClick={() =>
                    setActiveProject({
                      name: project.title,
                      description: project.description,
                      stack: project.stack,
                    })
                  }>
                  drwxr-xr-x {project.title.toLowerCase().replace(/\s/g, "-")}
                </div>
              ))}
            </div>
          </TerminalWindow>
        )}
        {/* System Window */}
        {openWindows.system && (
          <TerminalWindow
            title="~/system"
            initialX={50}
            initialY={480}
            zIndex={25}
            width={650}
            onClose={() =>
              setOpenWindows((prev) => ({ ...prev, system: false }))
            }>
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
                  light: [
                    "#1a1a2e",
                    "#3b1e6d",
                    "#5b2bb5",
                    "#7a33ff",
                    "#b266ff",
                  ],
                  dark: ["#1a1a2e", "#3b1e6d", "#5b2bb5", "#7a33ff", "#b266ff"],
                }}
              />
            </div>
          </TerminalWindow>
        )}
      </div>

      {/*Specific Project window - Active*/}
      {activeProject && (
        <TerminalWindow
          title={`~/projects/${activeProject.name.toLowerCase().replace(/\s+/g, "-")}`}
          initialX={400}
          initialY={150}
          zIndex={100}
          width={800}
          onClose={() => setActiveProject(null)}>
          <div className="space-y-4">
            <h2 className="text-xl text-violet-400 font-bold">
              {activeProject.name}
            </h2>

            <p className="text-zinc-400 text-sm">{activeProject.description}</p>

            <div className="text-xs text-pink-400 font-mono">
              stack: {activeProject.stack}
            </div>
          </div>
        </TerminalWindow>
      )}

      {/* Social Links */}
      <div className="absolute bottom-8 right-5 w-45 flex flex-col gap-2 text-sm font-mono">
        <a
          href="https://github.com/lindseyjorissen"
          target="_blank"
          className="text-zinc-500 hover:text-violet-400 hover:tracking-wider transition-all duration-200">
          [ /dev/github ]
        </a>

        <a
          href="https://www.linkedin.com/in/lindseyjorissen/"
          target="_blank"
          className="text-zinc-500 hover:text-violet-400 hover:tracking-wider transition-all duration-200">
          [ /dev/linkedin ]
        </a>

        <a
          href="https://twitter.com"
          target="_blank"
          className="text-zinc-500 hover:text-violet-400 hover:tracking-wider transition-all duration-200">
          [ /dev/x ]
        </a>
      </div>
    </div>
  );
}
