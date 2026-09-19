"use client";

import {
  CircleAlert,
  Eye,
  EyeOff,
  Home,
  LogIn,
  LogOut,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
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
type ToolDraft = Omit<Tool, "id"> & { id?: string };

const emptyDraft: ToolDraft = {
  name: "",
  description: "",
  url: "",
  icon: "",
  status: "available",
};

export default function AdminPage() {
  const [pass, setPass] = useState("");
  const [tools, setTools] = useState<Tool[]>([]);
  const [message, setMessage] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [draft, setDraft] = useState<ToolDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(false);

  useEffect(() => {
    const savedPass = sessionStorage.getItem("rokit_admin_pass");
    if (savedPass) {
      setPass(savedPass);
      fetchTools(savedPass);
    }
  }, []);

  async function fetchTools(inputPass: string): Promise<boolean> {
    try {
      const response = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pass: inputPass, action: "list" }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Unauthorized");
        setAuthenticated(false);
        return false;
      }
      setTools(Array.isArray(data.tools) ? data.tools : []);
      setAuthenticated(true);
      setMessage("");
      return true;
    } catch {
      setMessage("Could not connect to the admin API.");
      setAuthenticated(false);
      return false;
    }
  }

  async function login() {
    if (!pass.trim()) {
      setMessage("Please enter the admin password.");
      return;
    }
    setLoginLoading(true);
    try {
      const authenticated = await fetchTools(pass);
      if (authenticated) {
        sessionStorage.setItem("rokit_admin_pass", pass);
        return;
      }

      setLoginError(true);
      window.setTimeout(() => setLoginError(false), 2500);
    } finally {
      setLoginLoading(false);
    }
  }

  async function saveTool() {
    if (!draft?.name.trim() || !draft.url.trim()) {
      setMessage("Title and URL are required.");
      return;
    }
    setSaving(true);
    const action = draft.id ? "update" : "add";
    try {
      const response = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pass, action, tool: draft }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Could not save tool.");
        return;
      }
      setTools(data.tools || []);
      setDraft(null);
      setMessage(action === "add" ? "Tool added." : "Tool updated.");
    } finally {
      setSaving(false);
    }
  }

  async function saveToolQuick(tool: Tool) {
    const response = await fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pass, action: "update", tool }),
    });
    const data = await response.json();
    if (response.ok) setTools(data.tools || []);
    else setMessage(data.error || "Could not update status.");
  }

  async function deleteTool(tool: Tool) {
    if (!window.confirm(`Delete ${tool.name}? This cannot be undone.`)) return;
    const response = await fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pass, action: "delete", id: tool.id }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Could not delete tool.");
      return;
    }
    setTools(data.tools || []);
    setMessage("Tool deleted.");
  }

  function logout() {
    sessionStorage.removeItem("rokit_admin_pass");
    setAuthenticated(false);
    setPass("");
    setMessage("");
  }

  if (!authenticated) {
    return (
      <main className="admin-shell">
        <div className="admin-box login-box">
          <p className="admin-eyebrow"><span /> Secure control room</p>
          <h1>Login</h1>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              value={pass}
              onChange={(event) => setPass(event.target.value)}
              placeholder="Enter admin password"
              onKeyDown={(event) => { if (event.key === "Enter") login(); }}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button
            className={`primary-button login-submit ${loginError ? "login-error" : ""}`}
            onClick={login}
            disabled={loginLoading}
          >
            {loginLoading ? <LoaderCircle className="loading-icon" size={17} /> : loginError ? <CircleAlert size={17} /> : <LogIn size={17} />}
            {loginLoading ? "Authenticating..." : loginError ? "Unauthorized: Sai mật khẩu Admin!" : "Access dashboard"}
          </button>
          <a href="/" className="back-link home-link"><Home size={15} /> Back to homepage</a>
          {message ? <p className="admin-message error-message">{message}</p> : null}
        </div>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <div className="admin-box admin-box-wide">
        <div className="admin-header-row">
          <div>
            <p className="admin-eyebrow"><span /> Workspace settings</p>
            <h1>Tool management</h1>
          </div>
          <div className="admin-header-actions">
            <a className="home-button" href="/">
              <Home size={15} /> Home
            </a>
            <button className="logout-button" onClick={logout}>
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>

        <div className="admin-actions">
          <span>{tools.length} tool{tools.length === 1 ? "" : "s"}</span>
          <button className="add-button" onClick={() => setDraft({ ...emptyDraft })}><Plus size={17} /> Add tool</button>
        </div>

        <div className="tool-list">
          {tools.length === 0 ? <p className="empty-state">No tools configured yet.</p> : null}
          {tools.map((tool) => (
            <div key={tool.id} className="tool-row">
              <div className="tool-row-left">
                <img src={tool.icon || "/vercel.svg"} alt="" />
                <div><strong>{tool.name}</strong><small>{tool.url}</small></div>
              </div>
              <div className="tool-row-controls">
                <button className={`status-switch ${tool.status === "available" ? "is-on" : ""}`} onClick={() => saveToolQuick({ ...tool, status: tool.status === "available" ? "unavailable" : "available" })} aria-label={`Set ${tool.name} ${tool.status === "available" ? "unavailable" : "available"}`}><span /></button>
                <span className={`status-label ${tool.status}`}>{tool.status === "available" ? "Available" : "Unavailable"}</span>
                <button className="icon-button" onClick={() => setDraft({ ...tool })} aria-label={`Edit ${tool.name}`}><Pencil size={17} /></button>
                <button className="icon-button delete-icon" onClick={() => deleteTool(tool)} aria-label={`Delete ${tool.name}`}><Trash2 size={19} /></button>
              </div>
            </div>
          ))}
        </div>
        {message ? <p className="admin-message">{message}</p> : null}
      </div>

      {draft ? (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDraft(null); }}>
          <div className="edit-modal">
            <div className="modal-header">
              <div><p className="eyebrow">{draft.id ? "EDIT TOOL" : "NEW TOOL"}</p><h2>{draft.id ? "Edit tool" : "Add tool"}</h2></div>
              <button className="icon-button" onClick={() => setDraft(null)} aria-label="Close"><X size={19} /></button>
            </div>
            <label>Title<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Tool title" /></label>
            <label>URL<input value={draft.url} onChange={(event) => setDraft({ ...draft, url: event.target.value })} placeholder="https://example.com" /></label>
            <label>Description<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="What does this tool do?" rows={4} /></label>
            <label className="modal-status-row">Status <button type="button" className={`status-switch ${draft.status === "available" ? "is-on" : ""}`} onClick={() => setDraft({ ...draft, status: draft.status === "available" ? "unavailable" : "available" })}><span /></button><span className={`status-label ${draft.status}`}>{draft.status === "available" ? "Available" : "Unavailable"}</span></label>
            <button className="primary-button" onClick={saveTool} disabled={saving}>{saving ? "Saving..." : draft.id ? "Save changes" : "Add tool"}</button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
