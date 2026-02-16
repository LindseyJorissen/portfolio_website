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
  scale = 1,
  centered = false,
  bright = false,
  onClose,
  onMinimize,
}: {
  title: string;
  children: React.ReactNode;
  initialX: number;
  initialY: number;
  zIndex: number;
  width: number;
  scale?: number;
  centered?: boolean;
  bright?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
}) {
  const [position, setPosition] = useState({
    x: initialX,
    y: initialY,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [hasBeenDragged, setHasBeenDragged] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);

  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      setPosition({
        x: e.clientX / scale - dragOffset.current.x,
        y: e.clientY / scale - dragOffset.current.y,
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
  }, [isDragging, scale]);

  const isCentered = centered && !hasBeenDragged;

  return (
    <div
      ref={windowRef}
      style={{
        position: "absolute",
        ...(isCentered
          ? { left: "50%", top: "50%", transform: "translate(-50%, -50%)" }
          : { left: position.x, top: position.y }),
        width: width,
        zIndex: zIndex,
      }}
      className={`rounded-xl ${bright ? "border border-violet-500/50" : "border border-violet-500/20"} bg-zinc-900/40 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden`}>
      <div
        className="terminal-header flex justify-between items-center cursor-move select-none"
        onMouseDown={(e) => {
          if (isCentered && windowRef.current) {
            const rect = windowRef.current.getBoundingClientRect();
            const newX = rect.left / scale;
            const newY = rect.top / scale;
            setPosition({ x: newX, y: newY });
            setHasBeenDragged(true);
            dragOffset.current = {
              x: e.clientX / scale - newX,
              y: e.clientY / scale - newY,
            };
          } else {
            dragOffset.current = {
              x: e.clientX / scale - position.x,
              y: e.clientY / scale - position.y,
            };
          }
          setIsDragging(true);
        }}>
        <span className="text-sm text-zinc-400 font-mono">{title}</span>
        <div className="flex items-center gap-4 text-zinc-500 text-xs">
          <span
            onClick={onMinimize}
            className="hover:text-violet-400 transition-colors cursor-pointer">
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [activeProject, setActiveProject] = useState<null | {
    name: string;
    description: string;
    stack: string;
    images: string[];
    layout: "landscape" | "portrait";
  }>(null);
  const [openWindows, setOpenWindows] = useState({
    workspace: true,
    about: true,
    projects: true,
    system: true,
  });
  const [minimizedWindows, setMinimizedWindows] = useState<string[]>([]);

  // Below these thresholds, content scales down to fit
  const MIN_LAYOUT_WIDTH = 1200;
  const MIN_LAYOUT_HEIGHT = 700;

  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
    scale: 1,
  });

  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isUltrawide = w / h > 2;

      let layoutW: number, layoutH: number, scale: number;

      if (isUltrawide) {
        // Ultrawide: constrain content to a 16:9 area, centered
        layoutW = Math.round(h * (16 / 9));
        layoutH = h;
        scale = 1;
      } else if (w < MIN_LAYOUT_WIDTH || h < MIN_LAYOUT_HEIGHT) {
        // Small screen: lay out at minimum size, then scale to fit
        layoutW = MIN_LAYOUT_WIDTH;
        layoutH = MIN_LAYOUT_HEIGHT;
        scale = Math.min(w / MIN_LAYOUT_WIDTH, h / MIN_LAYOUT_HEIGHT);
      } else {
        // Normal screen: use actual dimensions, no scaling
        layoutW = w;
        layoutH = h;
        scale = 1;
      }

      setViewport({ width: layoutW, height: layoutH, scale });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const { displayedText, isComplete } = useTypewriter(
    "Fullstack Developer",
    80,
  );
  const [mounted, setMounted] = useState(false);
  const [booting, setBooting] = useState(true);
  const [bootLines, setBootLines] = useState<string[]>([]);
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [activeProject]);

  useEffect(() => {
    setMounted(true);

    const lines = [
      "[OK] Loading kernel modules...",
      "[OK] Mounting /dev/workspace...",
      "[OK] Initializing matrix rain...",
      "[OK] Compiling shaders...",
      "[OK] Brewing coffee...",
      "[OK] Establishing uplink...",
      "[OK] System ready.",
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        const line = lines[i];
        setBootLines((prev) => [...prev, line]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setBooting(false), 700);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const projects = [
    {
      title: "Booktomo",
      description: `
Booktomo started as a personal side project inspired by Spotify Wrapped-style yearly recaps. I loved the visual statistics in StoryGraph, but many of the more advanced insights were locked behind a paywall.

The application parses a Goodreads CSV export and transforms raw reading data into fun, personalized graphs. Reading trends, genre breakdowns, and other interactive metrics.

Later, during the Python developer course I was taking, we were assigned an end project: choose a Python package and explore it in depth. I chose NetworkX and decided to expand Booktomo by implementing a graph-based recommendation system. Instead of suggesting books based on what *other* people liked, the system analyzes your own reading history to generate suggestions based on what you’ve read and enjoyed.

Booktomo was my first experience working with React. The project combines a Django backend for data processing and API handling with a React frontend for interactive visualizations.
  `,
      stack: "Django · React · Python · NetworkX · JavaScript",
      link: "#",
      layout: "landscape" as const,
      images: ["/screenshots/booktomo-1.png", "/screenshots/booktomo-2.png"],
    },
    {
      title: "Pookiebase",
      description: `
Pookiebase started with a simple thought:

“I want to catalog my book collection, but I don’t want to make another spreadsheet.”

There are plenty of book collection apps available, but every option we tried either included unnecessary features or lacked functionality we actually wanted. There just wasn’t a perfect fit, so my fiancé and I decided we should build our own.

Built as a mobile-first Flask application, Pookiebase allows users to scan an ISBN barcode, instantly fetch metadata from the Google Books API, preview the book, and decide whether it belongs in their collection or wishlist.

The collection can be:
• Searched  
• Filtered  
• Grouped by author or genre  
• Enriched with purchase price data  

A future feature may include looking up market prices to estimate the overall value of the collection.

The project was built collaboratively and is self-hosted on our own home server, giving us full control over deployment and data ownership. It combines backend logic in Python with Jinja templating and frontend interactivity in JavaScript, all backed by a local database.

The next evolution is transforming Pookiebase into a full Android app with native camera integration and app store distribution.
  `,
      stack: "Flask · Python · Jinja · HTML · CSS · JavaScript",
      link: "#",
      layout: "portrait" as const,
      images: [
        "/screenshots/pookiebase-1.jpeg",
        "/screenshots/pookiebase-2.jpeg",
        "/screenshots/pookiebase-3.jpeg",
        "/screenshots/pookiebase-4.jpeg",
        "/screenshots/pookiebase-5.jpeg",
      ],
    },
    {
      title: "SpaceWise",
      description: `
SpaceWise started as our group end project for my Python Developer program, but quickly evolved into something much bigger: a space-ecosystem platform focused on smarter use of underutilized properties.

We live in a time where space is scarce, yet countless buildings sit empty and unused. SpaceWise explores how we can make space work again for people, businesses, and policymakers.

The concept consists of multiple interconnected modules:

We began development with CoAgora as the foundation.

CoAgora is a Django-based web platform hosted on Azure, powered by PostgreSQL. It features authentication, a dashboard architecture, property upload flows, dynamic filtering, and an interactive Leaflet-based map displaying real-time property pins.

The project combines backend architecture, database modeling, geolocation handling, and structured filtering logic. It demonstrates full-stack collaboration within a larger system design.
  `,
      stack: "Django · Python · PostgreSQL · Azure · Leaflet · JavaScript",
      link: "#",
      layout: "landscape" as const,
      images: [
        "/screenshots/spacewise-1.jpg",
        "/screenshots/spacewise-2.png",
        "/screenshots/spacewise-3.jpg",
        "/screenshots/spacewise-4.jpg",
        "/screenshots/spacewise-5.jpg",
        "/screenshots/spacewise-6.jpg",
      ],
    },
    {
      title: "This Portfolio",
      description: `
This portfolio is less of a traditional website and more of an interactive experiment.

I wanted something fun. Something I could play with and truly enjoy building. Instead of a basic corporate layout, I leaned into geekyness and my love for coffee. A major inspiration came from ricing Arch Linux: customizing every detail, obsessing over aesthetics, and turning a functional environment into something uniquely personal.

It’s a portfolio, yes. But also intentionally artistic. Somewhere between resume, playground, and digital desktop environment.

And yes:  I use Arch, by the way. `,
      stack: "Next.js · TypeScript · Tailwind · Three.js",
      link: "#",
      layout: "landscape" as const,
    },
  ];
  if (!mounted) return null;

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-black">
      <MatrixRain />

      {/* Boot screen overlay */}
      <div
        className={`absolute inset-0 z-200 bg-black flex items-center justify-center transition-opacity duration-500 ${
          booting ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}>
        <div className="font-mono text-sm max-w-md w-full px-8">
          {bootLines.map((line, i) => (
            <div
              key={i}
              className={`mb-1 ${
                line.includes("System ready")
                  ? "text-violet-400"
                  : "text-zinc-500"
              }`}>
              {line}
            </div>
          ))}
          {booting && (
            <span className="inline-block w-2 h-4 bg-violet-400 animate-pulse mt-1" />
          )}
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          style={{
            width: viewport.width,
            height: viewport.height,
            transform: `scale(${viewport.scale})`,
            transformOrigin: "center center",
          }}
          className="relative">
          {/* Workspace Window (Coffee)*/}
          {openWindows.workspace && !minimizedWindows.includes("workspace") && (
            <TerminalWindow
              title="~/workspace"
              initialX={viewport.width * 0.11}
              initialY={viewport.height * 0.08}
              zIndex={10}
              width={viewport.width * 0.79}
              scale={viewport.scale}
              onClose={() =>
                setOpenWindows((prev) => ({ ...prev, workspace: false }))
              }
              onMinimize={() =>
                setMinimizedWindows((prev) => [...prev, "workspace"])
              }>
              <div className="flex items-center justify-center h-125">
                <SpinningCup />
              </div>
            </TerminalWindow>
          )}
          {/* About Window */}
          {openWindows.about && !minimizedWindows.includes("about") && (
            <TerminalWindow
              title="~/about"
              initialX={viewport.width * 0.15}
              initialY={viewport.height * 0.15}
              zIndex={20}
              width={viewport.width * 0.28}
              scale={viewport.scale}
              onClose={() =>
                setOpenWindows((prev) => ({ ...prev, about: false }))
              }
              onMinimize={() =>
                setMinimizedWindows((prev) => [...prev, "about"])
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
          {openWindows.projects && !minimizedWindows.includes("projects") && (
            <TerminalWindow
              title="~/projects"
              initialX={viewport.width * 0.6}
              initialY={viewport.height * 0.22}
              zIndex={30}
              width={viewport.width * 0.34}
              scale={viewport.scale}
              onClose={() =>
                setOpenWindows((prev) => ({ ...prev, projects: false }))
              }
              onMinimize={() =>
                setMinimizedWindows((prev) => [...prev, "projects"])
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
                        images: project.images,
                        layout: project.layout,
                      })
                    }>
                    drwxr-xr-x {project.title.toLowerCase().replace(/\s/g, "-")}
                  </div>
                ))}
              </div>
            </TerminalWindow>
          )}
          {/* System Window */}
          {openWindows.system && !minimizedWindows.includes("system") && (
            <TerminalWindow
              title="~/system"
              initialX={viewport.width * 0.05}
              initialY={viewport.height * 0.59}
              zIndex={25}
              width={viewport.width * 0.43}
              scale={viewport.scale}
              onClose={() =>
                setOpenWindows((prev) => ({ ...prev, system: false }))
              }
              onMinimize={() =>
                setMinimizedWindows((prev) => [...prev, "system"])
              }>
              <p className="text-zinc-400 text-sm mb-4">
                <span className="text-violet-400">user@dev</span>:~$
                system-status
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
                    dark: [
                      "#1a1a2e",
                      "#3b1e6d",
                      "#5b2bb5",
                      "#7a33ff",
                      "#b266ff",
                    ],
                  }}
                />
              </div>
            </TerminalWindow>
          )}
          {/*Dim overlay when project is open*/}
          {activeProject && (
            <div
              className="absolute inset-0 bg-black/60 z-90 transition-opacity duration-300"
              onClick={() => setActiveProject(null)}
            />
          )}
          {/*Specific Project window - Active*/}
          {activeProject && (
            <TerminalWindow
              title={`~/projects/${activeProject.name.toLowerCase().replace(/\s+/g, "-")}`}
              initialX={viewport.width * 0.5 - (viewport.width * 0.65) / 2}
              initialY={0}
              zIndex={100}
              width={viewport.width * 0.65}
              scale={viewport.scale}
              centered
              bright
              onClose={() => setActiveProject(null)}>
              {(() => {
                const currentSrc = activeProject.images?.[currentImageIndex];
                const isVideo = currentSrc?.match(/\.(mp4|webm|mov)$/i);
                const hasMultiple = activeProject.images?.length > 1;

                const rawMedia =
                  currentSrc &&
                  (isVideo ? (
                    <video
                      key={currentSrc}
                      src={currentSrc}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className={
                        activeProject.layout === "portrait"
                          ? "w-full h-full object-cover"
                          : "w-full max-h-[400px] object-contain rounded-lg border border-violet-500/20"
                      }
                    />
                  ) : (
                    <img
                      src={currentSrc}
                      alt="Project screenshot"
                      className={
                        activeProject.layout === "portrait"
                          ? "w-full h-full object-cover"
                          : "w-full max-h-[400px] object-contain rounded-lg border border-violet-500/20"
                      }
                    />
                  ));

                // Wrap portrait media in a phone mockup
                const media =
                  activeProject.layout === "portrait" ? (
                    <div className="relative h-145 w-71">
                      {/* Phone bezel */}
                      <div className="absolute inset-0 rounded-[2.5rem] border-[3px] border-zinc-600 bg-zinc-900 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                        {/* Notch / dynamic island */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-900 rounded-full border border-zinc-700 z-10" />
                        {/* Screen */}
                        <div className="absolute inset-0.75 rounded-[2.2rem] overflow-hidden bg-black">
                          {rawMedia}
                        </div>
                      </div>
                    </div>
                  ) : (
                    rawMedia
                  );

                const arrows = hasMultiple && (
                  <div className="flex items-center justify-center gap-4 mt-3">
                    <button
                      onClick={() => setCurrentImageIndex((prev) => prev - 1)}
                      disabled={currentImageIndex === 0}
                      className="w-8 h-8 rounded-full border border-violet-500/30 bg-zinc-800/60 flex items-center justify-center text-violet-400 hover:bg-violet-500/20 hover:text-white transition-all disabled:opacity-20 disabled:cursor-default">
                      &#x25C0;&#xFE0E;
                    </button>
                    <span className="text-xs text-zinc-500 font-mono">
                      {currentImageIndex + 1} / {activeProject.images.length}
                    </span>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => prev + 1)}
                      disabled={
                        currentImageIndex === activeProject.images.length - 1
                      }
                      className="w-8 h-8 rounded-full border border-violet-500/30 bg-zinc-800/60 flex items-center justify-center text-violet-400 hover:bg-violet-500/20 hover:text-white transition-all disabled:opacity-20 disabled:cursor-default">
                      &#x25B6;&#xFE0E;
                    </button>
                  </div>
                );

                return activeProject.layout === "portrait" ? (
                  <div className="flex gap-6 items-center">
                    <div className="flex-1 space-y-4 min-w-0">
                      <h2 className="text-xl text-violet-400 font-bold">
                        {activeProject.name}
                      </h2>
                      <p className="text-zinc-400 text-sm whitespace-pre-line">
                        {activeProject.description.trim()}
                      </p>
                      <div className="text-xs text-pink-400 font-mono">
                        stack: {activeProject.stack}
                      </div>
                    </div>

                    {activeProject.images?.length > 0 && (
                      <div className="flex flex-col items-center shrink-0">
                        {media}
                        {arrows}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h2 className="text-xl text-violet-400 font-bold">
                      {activeProject.name}
                    </h2>
                    <p className="text-zinc-400 text-sm">
                      {activeProject.description}
                    </p>
                    <div className="text-xs text-pink-400 font-mono">
                      stack: {activeProject.stack}
                    </div>
                    {activeProject.images?.length > 0 && (
                      <div className="mt-4 flex flex-col items-center">
                        <div className="p-4 bg-zinc-900/50 rounded-2xl border border-violet-500/20 shadow-[0_0_40px_rgba(139,92,246,0.08)]">
                          {media}
                        </div>
                        {arrows}
                      </div>
                    )}
                  </div>
                );
              })()}
            </TerminalWindow>
          )}
          {/* Taskbar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 px-4 py-2 bg-zinc-900/60 backdrop-blur-md border border-violet-500/20 rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.1)] z-200">
            {minimizedWindows.map((id) => (
              <button
                key={id}
                onClick={() =>
                  setMinimizedWindows((prev) => prev.filter((w) => w !== id))
                }
                className="px-4 py-1.5 text-xs font-mono text-violet-300 bg-zinc-800/70 border border-violet-500/30 rounded-xl hover:bg-violet-500/20 hover:text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all duration-200">
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>

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
      </div>
    </div>
  );
}
