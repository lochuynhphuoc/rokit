"use client";

import { ArrowUpRight, Settings, Wrench } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

type ToolStatus = "available" | "unavailable";

type Tool = {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  status: ToolStatus;
};

type SocialLink = {
  name: string;
  url: string;
  icon: ReactNode;
  className?: string;
};

const socialLinks: SocialLink[] = [
  {
    name: "GitHub",
    url: "https://github.com/lochuynhphuoc",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.3 9.41 7.88 10.94.58.1.79-.25.79-.56v-2.16c-3.2.7-3.88-1.35-3.88-1.35-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.43-2.71 5.4-5.28 5.69.41.35.78 1.04.78 2.1v3.11c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
        />
      </svg>
    ),
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/Loc.rblx/",
    className: "facebook-social",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M14 8h3V4h-3c-3.31 0-5 1.69-5 5v3H6v4h3v8h4v-8h3.5l.5-4H13V9c0-.67.33-1 1-1Z"
        />
      </svg>
    ),
  },
  {
    name: "Discord",
    url: "https://discord.com/users/1473574308759736413",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M19.54 5.07A16.9 16.9 0 0 0 15.4 3.8a11.7 11.7 0 0 0-.53 1.08 15.7 15.7 0 0 0-5.74 0A11.7 11.7 0 0 0 8.6 3.8a16.9 16.9 0 0 0-4.14 1.27C1.84 8.96 1.13 12.76 1.49 16.51a16.9 16.9 0 0 0 5.09 2.57c.41-.56.77-1.15 1.08-1.77-.59-.22-1.16-.5-1.69-.82.14-.1.27-.2.4-.3 3.26 1.5 7.19 1.5 10.41 0 .13.1.26.2.4.3-.53.32-1.1.6-1.69.82.31.62.67 1.21 1.08 1.77a16.9 16.9 0 0 0 5.09-2.57c.42-4.35-.72-8.11-2.62-11.44ZM8.18 14.55c-.98 0-1.78-.9-1.78-2.01s.78-2.02 1.78-2.02 1.79.9 1.78 2.02c0 1.11-.79 2.01-1.78 2.01Zm7.64 0c-.98 0-1.78-.9-1.78-2.01s.78-2.02 1.78-2.02 1.79.9 1.78 2.02c0 1.11-.79 2.01-1.78 2.01Z"
        />
      </svg>
    ),
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@hutiuhutiu",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M23.5 6.2a3 3 0 0 0-2.11-2.12C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.39.58A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.11 2.12c1.87.58 9.39.58 9.39.58s7.52 0 9.39-.58a3 3 0 0 0 2.11-2.12A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8ZM9.6 15.89V8.11L16 12l-6.4 3.89Z"
        />
      </svg>
    ),
  },
];

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

  const availableCount = tools.filter(
    (tool) => tool.status === "available"
  ).length;

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
            {!loading &&
              tools.map((tool) => {
                const isAvailable = tool.status === "available";

                return (
                  <a
                    key={tool.id || tool.name}
                    href={isAvailable ? tool.url : undefined}
                    target={isAvailable ? "_blank" : undefined}
                    rel={isAvailable ? "noopener noreferrer" : undefined}
                    aria-disabled={!isAvailable}
                    className={`tool-card ${
                      isAvailable ? "available" : "unavailable"
                    }`}
                    onClick={(event) => {
                      if (!isAvailable) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <div className="tool-card-top">
                      <div className="tool-icon">
                        <img
                          src={tool.icon || "/vercel.svg"}
                          alt={tool.name}
                        />
                      </div>

                      {isAvailable ? (
                        <span className="tool-action" aria-hidden="true">
                          <ArrowUpRight
                            size={17}
                            className="tool-arrow"
                          />
                        </span>
                      ) : (
                        <span className="coming-soon">
                          UNAVAILABLE
                        </span>
                      )}
                    </div>

                    <div className="tool-content">
                      <h3>{tool.name}</h3>
                      <p>{tool.description}</p>
                    </div>

                    <div className="tool-status">
                      <span
                        className={
                          isAvailable
                            ? "status-dot available"
                            : "status-dot unavailable"
                        }
                      />
                      <span>
                        {isAvailable ? "Available" : "Unavailable"}
                      </span>
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

        <footer className="site-footer">
          <div className="footer-credit">
            <span className="footer-brand">RoKit</span>
            <span className="footer-separator">•</span>
            <span>Created &amp; maintained by Hu Tiu</span>
          </div>

          <div className="footer-socials">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`social-link ${social.className ?? ""}`}
                aria-label={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </footer>
      </div>
    </main>
  );
}