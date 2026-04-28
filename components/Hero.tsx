"use client";

import { useEffect, useRef } from "react";

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
];

type Item = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function Hero() {
  const items = useRef<Item[]>([]);
  const container = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const started = useRef(false);

  // create tags

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const arr: Item[] = [];

    const spacing = 120;

    tags.forEach(() => {
      let x = 0;
      let y = 0;
      let safe = false;

      while (!safe) {
        x = rand(-600, 600);
        y = rand(-300, 300);

        safe = true;

        for (const p of arr) {
          const dx = p.x - x;
          const dy = p.y - y;

          if (Math.sqrt(dx * dx + dy * dy) < spacing) {
            safe = false;
            break;
          }
        }
      }

      arr.push({
        x: 0,
        y: 0,
        vx: rand(-0.3, 0.3),
        vy: rand(-0.3, 0.3),
      });
    });

    items.current = arr;

    // scatter after load

    setTimeout(() => {
      items.current.forEach((p, i) => {
        p.x = rand(-600, 600);
        p.y = rand(-300, 300);
      });
    }, 300);
  }, []);

  // mouse

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouse.current = {
        x: e.clientX - window.innerWidth / 2,
        y: e.clientY - window.innerHeight / 2,
      };
    };

    window.addEventListener("mousemove", move);

    return () => window.removeEventListener("mousemove", move);
  }, []);

  // animation

  useEffect(() => {
    let id: number;

    const loop = () => {
      const nodes = container.current?.children;

      if (!nodes) return;

      items.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x > 650 || p.x < -650) p.vx *= -1;
        if (p.y > 350 || p.y < -350) p.vy *= -1;

        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;

        const d = Math.sqrt(dx * dx + dy * dy);

        if (d < 140) {
          p.x += dx * 0.06;
          p.y += dy * 0.06;
        }

        const el = nodes[i] as HTMLElement;

        if (el) {
          el.style.transform = `translate(${p.x}px,${p.y}px)`;
        }
      });

      id = requestAnimationFrame(loop);
    };

    id = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="relative h-screen overflow-hidden bg-white">
      {/* text */}

      <div className="absolute inset-0 flex items-center justify-center z-10">
        <h1 className="text-7xl font-bold">Find what's next</h1>
      </div>

      {/* tags */}

      <div ref={container} className="absolute inset-0">
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

              transition
              hover:scale-110
              hover:bg-blue-600
              hover:text-white
            "
          >
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}
