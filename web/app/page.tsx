"use client";

import { useMemo, useState } from "react";
import { Github, Linkedin, Mail } from "lucide-react";
import { ProjectCard, ProjectCardProps } from "@/components/ProjectCard";

type Tab = "software" | "roblox";

const softwareProjects: ProjectCardProps[] = [
  {
    title: "CS 561 Viterbi Temporal Solver",
    description:
      "Typed Python package that parses HW3 datasets, runs a Viterbi/POMDP solver, and ships CLIs, synthetic data tooling, and pytest coverage.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    technologies: ["Python", "Typer", "NumPy", "Pytest", "Ruff"],
    github: "https://github.com/seansalv/pomdp-viterbi-speech",
    demo: "https://github.com/seansalv/pomdp-viterbi-speech#readme",
  },
  {
    title: "5x5 Go Alpha-Beta Engine",
    description:
      "Competitive Go bot with alpha-beta pruning, aspiration windows, history heuristics, and a FastAPI surface so you can play it in-browser.",
    image:
      "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80",
    technologies: ["Python", "FastAPI", "Alpha-Beta", "TypeScript"],
    github: "https://github.com/seansalv/little_go-agent",
    demo: "/go-agent.html",
  },
  {
    title: "Level-Up IRL",
    description:
      "Solo Leveling–inspired fitness app that turns workouts into RPG quests with Supabase auth, deterministic XP math, and streak tracking.",
    image:
      "https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=1200&q=80",
    technologies: ["React Native", "Expo Router", "Supabase", "TypeScript"],
    github: "https://github.com/seansalv/Fitness-App",
  },
  {
    title: "Shift Auto-Scheduler",
    description:
      "Async Playwright bot that logs into Celayix, watches for self-schedulable shifts, applies rule filters, and books work automatically.",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
    technologies: ["Python", "Playwright", "asyncio", "Web Automation"],
    github: "https://github.com/seansalv/shift-scheduler",
  },
  {
    title: "3D Traveling Salesman GA",
    description:
      "Genetic algorithm that evolves 3D TSP tours with tournament selection, swap mutation, canonicalized outputs, and reproducible runs.",
    image:
      "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1200&q=80",
    technologies: ["Python", "NumPy", "GA"],
    github: "https://github.com/seansalv/genetic-tsp-xyz",
  },
];

const robloxProjects: ProjectCardProps[] = [
  {
    title: "Ledge Vaulting & Wall-Run System",
    description:
      "Custom Roblox movement stack that blends ledge grabs, vaults, and wall-runs with decay mechanics, animation hooks, and blocker handling.",
    image:
      "https://images.unsplash.com/photo-1656639969809-ebc544c96955?auto=format&fit=crop&w=1200&q=80",
    technologies: ["Lua", "Roblox Studio", "State Machines", "Raycasting"],
    github: "https://github.com/seansalv/roblox-wall-run-and-decay",
    demo: "/projects/roblox-ledge-system.html",
  },
  {
    title: "Combat Parkour Sandbox",
    description:
      "Prototype combines directional dash chains, stamina layers, and reactive VFX for a session-based PvP map built entirely in Roblox Studio.",
    image:
      "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&w=1200&q=80",
    technologies: ["Lua", "Roblox Studio", "FX Systems", "Gameplay Design"],
    demo: "https://www.roblox.com/users/17342072/profile",
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("software");
  const projects = activeTab === "software" ? softwareProjects : robloxProjects;
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#020617]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-lg font-semibold text-slate-200">Sean Salvador</p>
            <p className="text-slate-400">Software Engineer</p>
          </div>
          <div className="flex gap-4 text-slate-400">
            <a
              href="https://github.com/seansalv"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-sky-400"
            >
              <Github className="h-6 w-6" />
            </a>
            <a
              href="https://www.linkedin.com/in/sean-salvador-01826627b/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-sky-400"
            >
              <Linkedin className="h-6 w-6" />
            </a>
            <a
              href="mailto:sean1.salvador1@gmail.com"
              className="transition-colors hover:text-sky-400"
            >
              <Mail className="h-6 w-6" />
            </a>
          </div>
        </div>
      </header>

      <main className="space-y-16">
        <section className="mx-auto max-w-4xl px-4 pt-16 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 text-3xl text-slate-200">
            Engineering reliable platforms and expressive technical systems.
          </h1>
          <p className="text-lg text-slate-400">
            I design and ship end-to-end software—typed data pipelines, automation, and gameplay
            prototypes—grounded in strong tooling, measurable outcomes, and smooth delivery.
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex gap-6 border-b border-slate-800">
            {(["software", "roblox"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative pb-4 text-sm uppercase tracking-wide transition-colors ${
                  activeTab === tab
                    ? "text-sky-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab === "software" ? "Software Projects" : "Roblox Projects"}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 pb-20 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.title} {...project} />
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-[#020617]/80">
        <div className="mx-auto px-4 py-8 text-center text-slate-400 sm:px-6 lg:px-8">
          © {year} Sean Salvador. Built with Next.js & Tailwind CSS.
        </div>
      </footer>
    </div>
  );
}
