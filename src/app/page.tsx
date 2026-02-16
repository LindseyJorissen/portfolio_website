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
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  initialX: number;
  initialY: number;
  zIndex: number;
  width: number;
  scale?: number;
  centered?: boolean;
  onClose?: () => void;
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
useEffect(() => {
  setCurrentImageIndex(0);
}, [activeProject]);

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
      layout: "landscape" as const,
        images: [
      "/screenshots/booktomo-1.png",
      "/screenshots/booktomo-2.png",
    ],
    },
 {
  title: "Pookiebase",
  description: `
Pookiebase started with a simple thought:

“I want to catalog my book collection, but I don’t want to make another spreadsheet.”

There are plenty of book collection apps available, but every option we tried either included unnecessary features or lacked functionality we actually wanted. There wasn’t a perfect fit — so my fiancé and I decided to build our own.

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
}
,
    {
      title: "Spacewise",
      description:
        "Property intelligence platform focused on spatial data and smart filtering. Integrates geolocation APIs and structured property datasets to surface meaningful real-estate insights.",
      stack: "Django",
      link: "#",
      layout: "landscape" as const,
        images: [
      "/screenshots/spacewise-1.png",
      "/screenshots/spacewise-2.png",
    ],
    },
    {
      title: "This Portfolio",
      description:
        "Cyberpunk terminal-style portfolio with draggable glass windows, custom matrix rain canvas, and a Three.js shaded coffee cup.",
      stack: "Next.js + Tailwind + Three.js",
      link: "#",
      layout: "landscape" as const,
        images: [
      "/screenshots/portfolio-1.png",
      "/screenshots/portfolio-2.png",
    ],
    },
  ];
if (!mounted) return null;

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-black">
      <MatrixRain />
      <div
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          style={{
            width: viewport.width,
            height: viewport.height,
            transform: `scale(${viewport.scale})`,
            transformOrigin: "center center",
          }}
          className="relative"
        >
        {/* Workspace Window (Coffee)*/}
        {openWindows.workspace && (
          <TerminalWindow
            title="~/workspace"
            initialX={viewport.width * 0.11}
            initialY={viewport.height * 0.08}
            zIndex={10}
            width={viewport.width * 0.79}
            scale={viewport.scale}
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
            initialX={viewport.width * 0.15}
            initialY={viewport.height * 0.15}
            zIndex={20}
            width={viewport.width * 0.28}
            scale={viewport.scale}
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
            initialX={viewport.width * 0.60}
            initialY={viewport.height * 0.22}
            zIndex={30}
            width={viewport.width * 0.34}
            scale={viewport.scale}
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
        {openWindows.system && (
          <TerminalWindow
            title="~/system"
            initialX={viewport.width * 0.05}
            initialY={viewport.height * 0.59}
            zIndex={25}
            width={viewport.width * 0.43}
            scale={viewport.scale}
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
      {/*Specific Project window - Active*/}
      {activeProject && (
        <TerminalWindow
          title={`~/projects/${activeProject.name.toLowerCase().replace(/\s+/g, "-")}`}
          initialX={(viewport.width * 0.5) - (viewport.width * 0.65) / 2}
          initialY={0}
          zIndex={100}
          width={viewport.width * 0.65}
          scale={viewport.scale}
          centered
          onClose={() => setActiveProject(null)}>
{(() => {
  const currentSrc = activeProject.images?.[currentImageIndex];
  const isVideo = currentSrc?.match(/\.(mp4|webm|mov)$/i);
  const hasMultiple = activeProject.images?.length > 1;

  const rawMedia = currentSrc && (
    isVideo ? (
      <video
        key={currentSrc}
        src={currentSrc}
        autoPlay
        loop
        muted
        playsInline
        className={activeProject.layout === "portrait"
          ? "w-full h-full object-cover"
          : "w-full max-h-[500px] object-contain rounded-lg border border-violet-500/20"
        }
      />
    ) : (
      <img
        src={currentSrc}
        alt="Project screenshot"
        className={activeProject.layout === "portrait"
          ? "w-full h-full object-cover"
          : "w-full max-h-[500px] object-contain rounded-lg border border-violet-500/20"
        }
      />
    )
  );

  // Wrap portrait media in a phone mockup
  const media = activeProject.layout === "portrait" ? (
    <div className="relative h-[580px] w-[284px]">
      {/* Phone bezel */}
      <div className="absolute inset-0 rounded-[2.5rem] border-[3px] border-zinc-600 bg-zinc-900 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
        {/* Notch / dynamic island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-900 rounded-full border border-zinc-700 z-10" />
        {/* Screen */}
        <div className="absolute inset-[3px] rounded-[2.2rem] overflow-hidden bg-black">
          {rawMedia}
        </div>
      </div>
    </div>
  ) : rawMedia;

  const arrows = hasMultiple && (
    <div className="flex items-center justify-center gap-4 mt-3">
      <button
        onClick={() => setCurrentImageIndex((prev) => prev - 1)}
        disabled={currentImageIndex === 0}
        className="w-8 h-8 rounded-full border border-violet-500/30 bg-zinc-800/60 flex items-center justify-center text-violet-400 hover:bg-violet-500/20 hover:text-white transition-all disabled:opacity-20 disabled:cursor-default"
      >
        &#x25C0;&#xFE0E;
      </button>
      <span className="text-xs text-zinc-500 font-mono">
        {currentImageIndex + 1} / {activeProject.images.length}
      </span>
      <button
        onClick={() => setCurrentImageIndex((prev) => prev + 1)}
        disabled={currentImageIndex === activeProject.images.length - 1}
        className="w-8 h-8 rounded-full border border-violet-500/30 bg-zinc-800/60 flex items-center justify-center text-violet-400 hover:bg-violet-500/20 hover:text-white transition-all disabled:opacity-20 disabled:cursor-default"
      >
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
        <div className="flex flex-col items-center flex-shrink-0">
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
        <div>
          {media}
          {arrows}
        </div>
      )}
    </div>
  );
})()}

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
      </div>
    </div>
  );
}
