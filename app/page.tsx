"use client";

import { ArrowUpRight, Settings, Wrench } from "lucide-react";
import { useEffect, useState } from "react";

type ToolStatus = "available" | "unavailable";

type Tool = {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  status: ToolStatus;
};

export default function Home() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTools() {
      try {
        const response = await fetch("/api/tools", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data.tools)) {
          setTools(data.tools);
        }
      } catch {
        setTools([]);
      } finally {
        setLoading(false);
      }
    }

    loadTools();
  }, []);

  const availableCount = tools.filter((tool) => tool.status === "available").length;

  return (
    <main className="page">
      <a href="/admin" className="admin-link">
        <Settings size={14} aria-hidden="true" />
        Admin Panel
      </a>

      <div className="container">
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

            <span className="tool-count">{availableCount} available</span>
          </div>

          {loading ? <p className="tools-loading">Loading tools...</p> : null}

          <div className="tools-grid">
            {!loading && tools.map((tool) => {
              const isAvailable = tool.status === "available";

              return (
                <a
                  key={tool.id || tool.name}
                  href={isAvailable ? tool.url : undefined}
                  target={isAvailable ? "_blank" : undefined}
                  rel={isAvailable ? "noopener noreferrer" : undefined}
                  aria-disabled={!isAvailable}
                  className={`tool-card ${isAvailable ? "available" : "unavailable"}`}
                  onClick={(event) => {
                    if (!isAvailable) {
                      event.preventDefault();
                    }
                  }}
                >
                  <div className="tool-card-top">
                    <div className="tool-icon">
                      <img src={tool.icon || "/vercel.svg"} alt={tool.name} />
                    </div>

                    {isAvailable ? (
                      <span className="tool-action" aria-hidden="true">
                        <ArrowUpRight size={17} className="tool-arrow" />
                      </span>
                    ) : (
                      <span className="coming-soon">UNAVAILABLE</span>
                    )}
                  </div>

                  <div className="tool-content">
                    <h3>{tool.name}</h3>
                    <p>{tool.description}</p>
                  </div>

                  <div className="tool-status">
                    <span
                      className={
                        isAvailable ? "status-dot available" : "status-dot unavailable"
                      }
                    />
                    <span>{isAvailable ? "Available" : "Unavailable"}</span>
                  </div>
                </a>
              );
            })}
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