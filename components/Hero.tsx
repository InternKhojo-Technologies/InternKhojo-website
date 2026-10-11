"use client";

import { useEffect, useRef } from "react";
import {
  createFluidField,
  scatterFluid,
  stepFluid,
  defaultFluidOptions,
  type CursorBoat,
} from "@/lib/fluid-field";

const tags = [
  "AI",
  "Frontend",
  "Backend",
  "Design",
  "Marketing",
  "React",
  "Startup",
  "Web3",
  "Python",
  "Node",
  "DevOps",
  "UI/UX",
  "Data",
  "Cloud",
  "Android",
  "iOS",
  "ML",
  "Finance",
  "Internship",
  "Next.js",
  "Fullstack",
  "API",
  "MongoDB",
  "SQL",
  "Blockchain",
  "Security",
  "Testing",
  "Product",
  "HR",
  "Sales",
  "Growth",
  "Content",
  "Analytics",
  "Cyber Security",
  "Robotics",
  "Game Dev",
  "AR/VR",
  "IoT",
  "Big Data",
  "SEO",
  "Digital Marketing",
  "Business",
  "Consulting",
  "Operations",
  "Management",
  "Data Analysis",
  "Power BI",
  "Excel",
  "Research",
  "Writing",
  "Teaching",
  "Legal",
  "Accounting",
  "Economics",
  "Psychology",
  "Biotech",
  "Healthcare",
  "Video Editing",
  "3D",
  "Animation",
  "UI Design",
  "Branding",
  "Social Media",

  // Tech & Tools
  "Figma",
  "Canva",
  "AWS",
  "Azure",
  "Oracle SQL",
  "Docker",
  "Kubernetes",
  "Git",
  "GitHub",
  "Java",
  "C++",
  "C#",
  "TypeScript",
  "PHP",
  "Flutter",

  // Business & Professional
  "Entrepreneurship",
  "Project Management",
  "Public Relations",
  "Market Research",
  "Business Analysis",
  "Recruitment",
  "Talent Acquisition",
  "Supply Chain",

  // Finance & Commerce
  "Investment",
  "Financial Analysis",
  "Accounting",
  "Taxation",
  "Banking",

  // Science & Engineering
  "Physics",
  "Chemistry",
  "Mathematics",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Environmental Science",
  "Bioinformatics",

  // Arts, Media & Humanities
  "Graphic Design",
  "Illustration",
  "Photography",
  "Journalism",
  "Creative Writing",
  "Film Making",
  "Public Speaking",
  "Languages",
];

// Motion tunables.
const HOME_RANGE_X = 600;
const HOME_RANGE_Y = 300;
const SCATTER_DELAY_MS = 300;
// Boat smoothing base: per-frame lerp = 1 - 0.82^dtSteps (≈0.18 at 60fps).
const BOAT_SMOOTH_BASE = 0.82;

export default function Hero() {
  const container = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLDivElement>(null);
  // Raw (unsmoothed) cursor, center-relative like the pill coordinates.
  const mouse = useRef({ x: 0, y: 0 });
  const visible = useRef(true);

  // mouse (cheap ref write; loop reads it only while visible)
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!visible.current) return;
      mouse.current.x = e.clientX - window.innerWidth / 2;
      mouse.current.y = e.clientY - window.innerHeight / 2;
    };

    window.addEventListener("mousemove", move, { passive: true });

    return () => window.removeEventListener("mousemove", move);
  }, []);

  // animation — pills drift like objects on water; the smoothed cursor
  // ("boat") leaves a directional wake that parts them.
  useEffect(() => {
    const root = container.current;
    if (!root) return;

    // One stable random home per tag (±600/±300), created once per mount.
    const homes = new Float32Array(tags.length * 2);
    for (let i = 0; i < tags.length; i++) {
      homes[i * 2] = Math.random() * (HOME_RANGE_X * 2) - HOME_RANGE_X;
      homes[i * 2 + 1] = Math.random() * (HOME_RANGE_Y * 2) - HOME_RANGE_Y;
    }
    const field = createFluidField(homes, defaultFluidOptions());
    // createFluidField seeds positions at the homes — reset to the center so
    // the pills start stacked (same intro as before); scatter follows.
    field.pos.fill(0);

    // Cache the pill nodes once instead of reading .children every frame.
    const nodes = Array.from(root.children) as HTMLElement[];
    const paint = () => {
      const pos = field.pos;
      for (let i = 0; i < tags.length; i++) {
        const el = nodes[i];
        if (el) {
          el.style.transform = `translate3d(${pos[i * 2]}px,${pos[i * 2 + 1]}px,0)`;
        }
      }
    };
    // Start stacked at the center (mostly hidden behind the headline glow),
    // then scatter — same intro as before.
    paint();

    // Respect reduced motion: static scattered render, run no loop.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const scatterTimer = window.setTimeout(() => {
        scatterFluid(field, HOME_RANGE_X, HOME_RANGE_Y);
        paint();
      }, SCATTER_DELAY_MS);
      return () => window.clearTimeout(scatterTimer);
    }

    const scatterTimer = window.setTimeout(() => {
      scatterFluid(field, HOME_RANGE_X, HOME_RANGE_Y);
    }, SCATTER_DELAY_MS);

    // Pause the loop while the hero is off-screen so scrolling stays smooth.
    const host = section.current ?? root;
    const io = new IntersectionObserver(
      (entries) => {
        visible.current = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 },
    );
    io.observe(host);

    // The single per-frame cursor object — reused so the loop allocates nothing.
    const boat: CursorBoat = { x: 0, y: 0, vx: 0, vy: 0, speed: 0 };
    let boatX = 0;
    let boatY = 0;
    let last = performance.now();

    let id = 0;
    const loop = (now: number) => {
      id = requestAnimationFrame(loop);
      if (!visible.current || document.hidden) {
        last = now;
        return;
      }

      // Clamp the delta so backgrounding can't teleport the physics.
      const dtMs = Math.min(Math.max(now - last, 8), 50);
      last = now;
      const dtSteps = Math.min(Math.max(dtMs / 16.667, 0.5), 2);

      // Smooth the raw mouse like a boat: momentum, no teleporting.
      // Lerp factor ≈ 0.18 at 60fps, normalized for variable dt.
      const k = 1 - Math.pow(BOAT_SMOOTH_BASE, dtSteps);
      const prevX = boatX;
      const prevY = boatY;
      boatX += (mouse.current.x - boatX) * k;
      boatY += (mouse.current.y - boatY) * k;

      // Per-step velocity in px-per-60fps-step units, plus scalar speed.
      const vx = (boatX - prevX) / dtSteps;
      const vy = (boatY - prevY) / dtSteps;
      boat.x = boatX;
      boat.y = boatY;
      boat.vx = vx;
      boat.vy = vy;
      boat.speed = Math.sqrt(vx * vx + vy * vy);

      stepFluid(field, boat, now, dtSteps);
      paint();
    };

    id = requestAnimationFrame(loop);

    return () => {
      window.clearTimeout(scatterTimer);
      io.disconnect();
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <div
      ref={section}
      className="relative h-[100dvh] min-h-[600px] overflow-hidden bg-white"
    >
      {/* text */}

      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <h1
          className="
            relative
            rounded-3xl
            px-8 py-4
            text-4xl sm:text-5xl md:text-6xl
            lg:text-7xl
            font-bold
            text-center
            sm:whitespace-nowrap
            pointer-events-none
            before:absolute
            before:inset-0
            before:-z-10
            before:rounded-3xl
            before:bg-white/80
            before:blur-xl
            before:scale-110
    
            after:absolute
            after:inset-0
            after:-z-10
            after:rounded-3xl
            after:bg-white/60
            after:blur-2xl
            after:scale-125

          "
        >
          Discover. Apply. Grow.
          <span className="sr-only">
            {" "}
            — internships and fresher jobs across India
          </span>
        </h1>
      </div>

      {/* tags (decorative floating pills — hidden from assistive tech) */}

      <div ref={container} className="absolute inset-0" aria-hidden="true">
        {tags.map((t, i) => (
          <div
            key={i}
            className="
              absolute
              left-1/2
              top-1/2

              px-8 py-3
              text-lg

              bg-white
              rounded-lg

              shadow-md
              shadow-black/15
            "
          >
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}
