"use client";

import { ArrowUpRight, CheckCircle2, Wrench } from "lucide-react";

type Tool = {
  name: string;
  description: string;
  url: string;
  status: "available" | "coming-soon";
};

const tools: Tool[] = [
  {
    name: "RoCheck",
    description:
      "Check Roblox group membership quickly and efficiently.",
    url: "https://rocheck.vercel.app/",
    status: "available",
  },
  {
    name: "RoLink Resolver",
    description:
      "Resolve Roblox Share Links and extract their Roblox IDs.",
    url: "https://rolinkresolver.vercel.app/",
    status: "available",
  },
];

export default function Home() {
  return (
    <main className="page">
      <div className="container">
        <header className="header">
          <div className="brand">
            <span className="brand-mark">R</span>
            <span>RoKit</span>
          </div>

          <span className="badge">ROBLOX TOOLS</span>
        </header>

        <section className="hero">
          <p className="eyebrow">ROBLOX DEVELOPER TOOLKIT</p>

          <h1>
            Simple tools.
            <br />
            <span>Built for Roblox.</span>
          </h1>

          <p className="description">
            A collection of lightweight Roblox utilities and developer
            tools, built to make everyday tasks faster and easier.
          </p>
        </section>

        <section className="tools-section">
          <div className="section-header">
            <div>
              <span className="section-label">TOOLS</span>
              <h2>Available tools</h2>
            </div>

            <span className="tool-count">
              {tools.filter((tool) => tool.status === "available").length}{" "}
              available
            </span>
          </div>

          <div className="tools-grid">
            {tools.map((tool) => (
              <a
                key={tool.name}
                href={tool.status === "available" ? tool.url : undefined}
                target={tool.status === "available" ? "_blank" : undefined}
                rel={
                  tool.status === "available"
                    ? "noopener noreferrer"
                    : undefined
                }
                className={`tool-card ${
                  tool.status === "coming-soon" ? "disabled" : ""
                }`}
                aria-disabled={tool.status === "coming-soon"}
              >
                <div className="tool-card-top">
                  <div className="tool-icon">
                    {tool.status === "available" ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <Wrench size={20} />
                    )}
                  </div>

                  {tool.status === "available" ? (
                    <ArrowUpRight size={20} className="tool-arrow" />
                  ) : (
                    <span className="coming-soon">COMING SOON</span>
                  )}
                </div>

                <div className="tool-content">
                  <h3>{tool.name}</h3>
                  <p>{tool.description}</p>
                </div>

                <div className="tool-status">
                  <span
                    className={
                      tool.status === "available"
                        ? "status-dot available"
                        : "status-dot"
                    }
                  />
                  <span>
                    {tool.status === "available"
                      ? "Available"
                      : "Coming soon"}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="future-section">
          <div className="future-icon">
            <Wrench size={18} />
          </div>

          <div>
            <strong>More tools are coming.</strong>
            <p>
              RoKit will continue to grow with more utilities for Roblox
              developers and users.
            </p>
          </div>
        </section>

        <footer>
          <span>RoKit</span>
          <span>•</span>
          <span>Roblox Tools</span>
        </footer>
      </div>
    </main>
  );
}