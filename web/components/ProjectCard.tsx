"use client";

import Image from "next/image";
import { ExternalLink, Github } from "lucide-react";

export type ProjectCardProps = {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  github?: string;
  demo?: string;
};

export function ProjectCard({
  title,
  description,
  image,
  technologies,
  github,
  demo,
}: ProjectCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-800 bg-[#020617] transition-all hover:border-sky-500 hover:shadow-xl hover:shadow-sky-500/10">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <h3 className="mb-2 text-slate-200 transition-colors hover:text-sky-400">
          {title}
        </h3>
        <p className="mb-4 text-slate-400">{description}</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-slate-800 bg-slate-800/50 px-3 py-1 text-sm text-zinc-400"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="flex gap-3">
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-slate-200 transition-colors hover:bg-slate-700"
            >
              <Github className="h-4 w-4" />
              Code
            </a>
          )}
          {demo && (
            <a
              href={demo}
              target={demo.startsWith("/") ? undefined : "_blank"}
              rel={
                demo.startsWith("/")
                  ? undefined
                  : "noopener noreferrer"
              }
              className="flex items-center gap-2 rounded-full bg-sky-500 px-5 py-2 text-slate-950 transition-colors hover:bg-sky-400"
            >
              <ExternalLink className="h-4 w-4" />
              Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

