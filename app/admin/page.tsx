"use client";

import {
  CircleAlert,
  Eye,
  EyeOff,
  GripVertical,
  Home,
  LogIn,
  LogOut,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

type ToolStatus = "available" | "unavailable";

type Tool = {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  status: ToolStatus;
  order: number;
};

type ToolDraft = Omit<Tool, "id" | "order"> & {
  id?: string;
};

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

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragTargetIndex, setDragTargetIndex] = useState<number | null>(
    null
  );
  const [dragOffset, setDragOffset] = useState(0);

  const dragStartIndexRef = useRef<number | null>(null);
  const dragStartYRef = useRef(0);
  const dragHeightRef = useRef(0);
  const dragGapRef = useRef(10);
  const dragRectsRef = useRef<
    Array<{
      id: string;
      top: number;
      height: number;
      center: number;
    }>
  >([]);
  const dragMovedRef = useRef(false);
  const dragPointerIdRef = useRef<number | null>(null);
  const originalToolsRef = useRef<Tool[]>([]);

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pass: inputPass,
          action: "list",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
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
      setLoginError(true);

      window.setTimeout(() => {
        setLoginError(false);
      }, 2500);

      return;
    }

    setLoginLoading(true);
    setLoginError(false);

    try {
      const authenticated = await fetchTools(pass);

      if (authenticated) {
        sessionStorage.setItem("rokit_admin_pass", pass);
        return;
      }

      setLoginError(true);

      window.setTimeout(() => {
        setLoginError(false);
      }, 2500);
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pass,
          action,
          tool: draft,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not save tool.");
        return;
      }

      setTools(data.tools || []);
      setDraft(null);

      setMessage(
        action === "add" ? "Tool added." : "Tool updated."
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveToolQuick(tool: Tool) {
    try {
      const response = await fetch("/api/tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pass,
          action: "update",
          tool,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTools(data.tools || []);
      } else {
        setMessage(
          data.error || "Could not update status."
        );
      }
    } catch {
      setMessage("Could not connect to the admin API.");
    }
  }

  async function deleteTool(tool: Tool) {
    if (
      !window.confirm(
        `Delete ${tool.name}? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pass,
          action: "delete",
          id: tool.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.error || "Could not delete tool."
        );
        return;
      }

      setTools(data.tools || []);
      setMessage("Tool deleted.");
    } catch {
      setMessage("Could not connect to the admin API.");
    }
  }

  async function persistOrder(nextTools: Tool[]) {
    try {
      const response = await fetch("/api/tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pass,
          action: "reorder",
          orders: nextTools.map((tool, index) => ({
            id: tool.id,
            order: index,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setTools(originalToolsRef.current);
        setMessage(
          data.error || "Could not save tool order."
        );
        return;
      }

      if (Array.isArray(data.tools)) {
        setTools(data.tools);
      }

      setMessage("Tool order saved.");
    } catch {
      setTools(originalToolsRef.current);
      setMessage("Could not save tool order.");
    }
  }

  function moveTool(
    list: Tool[],
    fromIndex: number,
    toIndex: number
  ) {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= list.length ||
      toIndex >= list.length
    ) {
      return list;
    }

    const next = [...list];
    const [moved] = next.splice(fromIndex, 1);

    next.splice(toIndex, 0, moved);

    return next.map((tool, index) => ({
      ...tool,
      order: index,
    }));
  }

  function startDrag(
    event: ReactPointerEvent<HTMLButtonElement>,
    tool: Tool
  ) {
    if (event.button !== 0) {
      return;
    }

    const index = tools.findIndex(
      (item) => item.id === tool.id
    );

    if (index === -1) {
      return;
    }

    const row = document.querySelector(
      `[data-tool-id="${CSS.escape(tool.id)}"]`
    ) as HTMLElement | null;

    if (!row) {
      return;
    }

    const rows = Array.from(
      document.querySelectorAll<HTMLElement>(
        "[data-tool-id]"
      )
    );

    dragRectsRef.current = rows.map((item) => {
      const rect = item.getBoundingClientRect();

      return {
        id: item.dataset.toolId || "",
        top: rect.top,
        height: rect.height,
        center: rect.top + rect.height / 2,
      };
    });

    const rowRect = row.getBoundingClientRect();

    dragStartIndexRef.current = index;
    dragStartYRef.current = event.clientY;
    dragHeightRef.current = rowRect.height;
    dragGapRef.current = 10;
    dragPointerIdRef.current = event.pointerId;
    dragMovedRef.current = false;
    originalToolsRef.current = [...tools];

    setDraggingId(tool.id);
    setDragTargetIndex(index);
    setDragOffset(0);

    event.currentTarget.setPointerCapture(event.pointerId);

    event.preventDefault();
  }

  function handleDragMove(
    event: ReactPointerEvent<HTMLButtonElement>
  ) {
    if (
      draggingId === null ||
      dragStartIndexRef.current === null
    ) {
      return;
    }

    if (
      dragPointerIdRef.current !== null &&
      event.pointerId !== dragPointerIdRef.current
    ) {
      return;
    }

    const startIndex = dragStartIndexRef.current;
    const deltaY =
      event.clientY - dragStartYRef.current;

    if (Math.abs(deltaY) > 4) {
      dragMovedRef.current = true;
    }

    setDragOffset(deltaY);

    const rects = dragRectsRef.current;

    if (!rects.length) {
      return;
    }

    let targetIndex = startIndex;

    if (deltaY > 0) {
      for (
        let index = startIndex + 1;
        index < rects.length;
        index++
      ) {
        const midpoint =
          rects[index].center;

        if (event.clientY > midpoint) {
          targetIndex = index;
        } else {
          break;
        }
      }
    } else if (deltaY < 0) {
      for (
        let index = startIndex - 1;
        index >= 0;
        index--
      ) {
        const midpoint =
          rects[index].center;

        if (event.clientY < midpoint) {
          targetIndex = index;
        } else {
          break;
        }
      }
    }

    setDragTargetIndex(targetIndex);
  }

  async function finishDrag(
    event: ReactPointerEvent<HTMLButtonElement>
  ) {
    if (
      draggingId === null ||
      dragStartIndexRef.current === null
    ) {
      return;
    }

    const startIndex = dragStartIndexRef.current;
    const targetIndex =
      dragTargetIndex ?? startIndex;

    try {
      if (
        event.currentTarget.hasPointerCapture(
          event.pointerId
        )
      ) {
        event.currentTarget.releasePointerCapture(
          event.pointerId
        );
      }
    } catch {
      // Ignore pointer capture errors.
    }

    if (
      !dragMovedRef.current ||
      targetIndex === startIndex
    ) {
      resetDrag();
      return;
    }

    const nextTools = moveTool(
      tools,
      startIndex,
      targetIndex
    );

    setTools(nextTools);
    resetDrag();

    await persistOrder(nextTools);
  }

  function cancelDrag(
    event: ReactPointerEvent<HTMLButtonElement>
  ) {
    try {
      if (
        event.currentTarget.hasPointerCapture(
          event.pointerId
        )
      ) {
        event.currentTarget.releasePointerCapture(
          event.pointerId
        );
      }
    } catch {
      // Ignore pointer capture errors.
    }

    resetDrag();
  }

  function resetDrag() {
    dragStartIndexRef.current = null;
    dragPointerIdRef.current = null;
    dragMovedRef.current = false;
    dragRectsRef.current = [];

    setDraggingId(null);
    setDragTargetIndex(null);
    setDragOffset(0);
  }

  function getToolTransform(index: number) {
    if (
      draggingId === null ||
      dragStartIndexRef.current === null ||
      dragTargetIndex === null
    ) {
      return undefined;
    }

    const startIndex =
      dragStartIndexRef.current;

    if (index === startIndex) {
      return `translate3d(0, ${dragOffset}px, 0)`;
    }

    const shift =
      dragHeightRef.current +
      dragGapRef.current;

    if (
      dragTargetIndex > startIndex &&
      index > startIndex &&
      index <= dragTargetIndex
    ) {
      return `translate3d(0, -${shift}px, 0)`;
    }

    if (
      dragTargetIndex < startIndex &&
      index >= dragTargetIndex &&
      index < startIndex
    ) {
      return `translate3d(0, ${shift}px, 0)`;
    }

    return undefined;
  }

  function logout() {
    sessionStorage.removeItem("rokit_admin_pass");

    setAuthenticated(false);
    setPass("");
    setMessage("");
    setLoginError(false);
    resetDrag();
  }

  if (!authenticated) {
    return (
      <main className="admin-shell">
        <div className="admin-box login-box">
          <p className="admin-eyebrow">
            <span />
            Secure control room
          </p>

          <h1>Login</h1>

          <div className="password-field">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={pass}
              onChange={(event) => {
                setPass(event.target.value);
                setLoginError(false);
              }}
              placeholder="Enter admin password"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  login();
                }
              }}
              disabled={loginLoading}
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(
                  (visible) => !visible
                )
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              title={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          <button
            className={`primary-button login-submit ${
              loginError
                ? "login-error"
                : ""
            }`}
            onClick={login}
            disabled={loginLoading}
          >
            {loginLoading ? (
              <LoaderCircle
                className="loading-icon"
                size={17}
              />
            ) : loginError ? (
              <CircleAlert size={17} />
            ) : (
              <LogIn size={17} />
            )}

            {loginLoading
              ? "Authenticating..."
              : loginError
                ? "Unauthorized: Sai mật khẩu Admin!"
                : "Access dashboard"}
          </button>

          <a
            href="/"
            className="back-link home-link"
          >
            <Home size={15} />
            Back to homepage
          </a>

          {message && !loginError ? (
            <p className="admin-message error-message">
              {message}
            </p>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <div className="admin-box admin-box-wide">
        <div className="admin-header-row">
          <div className="admin-header-title">
            <p className="admin-eyebrow">
              <span />
              Workspace settings
            </p>

            <h1>Tool management</h1>
          </div>

          <div className="admin-header-actions">
            <a
              className="home-button"
              href="/"
            >
              <Home size={15} />
              Home
            </a>

            <button
              className="logout-button"
              onClick={logout}
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>

        <div className="admin-actions">
          <span>
            {tools.length} tool
            {tools.length === 1
              ? ""
              : "s"}
          </span>

          <button
            className="add-button"
            onClick={() =>
              setDraft({
                ...emptyDraft,
              })
            }
          >
            <Plus size={17} />
            Add tool
          </button>
        </div>

        <p className="drag-help">
          Drag a tool card to change its order.
        </p>

        <div className="tool-list">
          {tools.length === 0 ? (
            <p className="empty-state">
              No tools configured yet.
            </p>
          ) : null}

          {tools.map((tool, index) => {
            const isDragging =
              draggingId === tool.id;

            const transform =
              getToolTransform(index);

            return (
              <div
                key={tool.id}
                data-tool-id={tool.id}
                className={`tool-row ${
                  isDragging
                    ? "is-dragging"
                    : ""
                } ${
                  dragTargetIndex === index &&
                  draggingId !== tool.id
                    ? "is-drag-target"
                    : ""
                }`}
                style={{
                  transform,
                  zIndex: isDragging
                    ? 10
                    : undefined,
                }}
              >
                <button
                  type="button"
                  className="drag-handle"
                  aria-label={`Drag ${tool.name}`}
                  title={`Drag ${tool.name}`}
                  onPointerDown={(event) =>
                    startDrag(event, tool)
                  }
                  onPointerMove={
                    handleDragMove
                  }
                  onPointerUp={
                    finishDrag
                  }
                  onPointerCancel={
                    cancelDrag
                  }
                >
                  <GripVertical size={18} />
                </button>

                <div className="tool-icon-column">
                  <img
                    src={
                      tool.icon ||
                      "/vercel.svg"
                    }
                    alt=""
                  />
                </div>

                <div className="tool-row-left">
                  <div className="tool-info">
                    <strong>
                      {tool.name}
                    </strong>

                    <small>
                      {tool.url}
                    </small>
                  </div>
                </div>

                <div className="tool-row-controls">
                  <button
                    className={`status-switch ${
                      tool.status ===
                      "available"
                        ? "is-on"
                        : ""
                    }`}
                    onClick={() =>
                      saveToolQuick({
                        ...tool,
                        status:
                          tool.status ===
                          "available"
                            ? "unavailable"
                            : "available",
                      })
                    }
                    aria-label={`Set ${
                      tool.name
                    } ${
                      tool.status ===
                      "available"
                        ? "unavailable"
                        : "available"
                    }`}
                  >
                    <span />
                  </button>

                  <span
                    className={`status-label ${tool.status}`}
                  >
                    {tool.status ===
                    "available"
                      ? "Available"
                      : "Unavailable"}
                  </span>

                  <button
                    className="icon-button"
                    onClick={() =>
                      setDraft({
                        ...tool,
                      })
                    }
                    aria-label={`Edit ${tool.name}`}
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    className="icon-button delete-icon"
                    onClick={() =>
                      deleteTool(tool)
                    }
                    aria-label={`Delete ${tool.name}`}
                  >
                    <Trash2 size={19} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {message ? (
          <p className="admin-message">
            {message}
          </p>
        ) : null}
      </div>

      {draft ? (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setDraft(null);
            }
          }}
        >
          <div className="edit-modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  {draft.id
                    ? "EDIT TOOL"
                    : "NEW TOOL"}
                </p>

                <h2>
                  {draft.id
                    ? "Edit tool"
                    : "Add tool"}
                </h2>
              </div>

              <button
                className="icon-button"
                onClick={() =>
                  setDraft(null)
                }
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <label>
              Title
              <input
                value={draft.name}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    name: event.target.value,
                  })
                }
                placeholder="Tool title"
              />
            </label>

            <label>
              URL
              <input
                value={draft.url}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    url: event.target.value,
                  })
                }
                placeholder="https://example.com"
              />
            </label>

            <label>
              Description
              <textarea
                value={
                  draft.description
                }
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    description:
                      event.target.value,
                  })
                }
                placeholder="What does this tool do?"
                rows={4}
              />
            </label>

            <label className="modal-status-row">
              Status

              <button
                type="button"
                className={`status-switch ${
                  draft.status ===
                  "available"
                    ? "is-on"
                    : ""
                }`}
                onClick={() =>
                  setDraft({
                    ...draft,
                    status:
                      draft.status ===
                      "available"
                        ? "unavailable"
                        : "available",
                  })
                }
              >
                <span />
              </button>

              <span
                className={`status-label ${draft.status}`}
              >
                {draft.status ===
                "available"
                  ? "Available"
                  : "Unavailable"}
              </span>
            </label>

            <button
              className="primary-button"
              onClick={saveTool}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : draft.id
                  ? "Save changes"
                  : "Add tool"}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}