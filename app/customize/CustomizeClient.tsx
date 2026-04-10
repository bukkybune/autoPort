"use client";

import type { GitHubRepo } from "../types/github";
import type { CustomizedProject } from "../types/customize";
import {
  SELECTED_REPOS_KEY,
  CUSTOMIZED_PROJECTS_KEY,
  DASHBOARD_SELECTION_KEY,
} from "../types/customize";
import type { PortfolioConfig, ExperienceEntry, SkillCategory, ServiceItem, TestimonialItem } from "../types/portfolio";
import type { ColorSchemeId, TemplateId } from "../types/portfolio";
import {
  PORTFOLIO_CONFIG_KEY,
  createDefaultPortfolioConfig,
  createDefaultTheme,
  getEmptyExperienceEntry,
  SKILL_LEVELS,
} from "../types/portfolio";
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  ChevronDown,
  GripVertical,
  HelpCircle,
  Pencil,
  Trash2,
  Plus,
  X,
  User,
  FileText,
  Code,
  Briefcase,
  Mail,
  Layout,
  Palette,
  Star,
  MessageSquare,
  BarChart2,
} from "lucide-react";
import { PreviewTemplate } from "../components/PreviewTemplate";
import { Tour, type TourStep } from "../components/Tour";

const CUSTOMIZE_TOUR_KEY = "autoport_tour_customize_v1";

const CUSTOMIZE_TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to the Editor",
    body: "This is where your portfolio comes to life. Every change you make updates the live preview instantly.",
  },
  {
    target: "section-nav",
    title: "Sections",
    body: "Toggle sections on/off with the checkboxes. Click a section name to edit it in the panel to the right.",
  },
  {
    target: "editor-panel",
    title: "Edit Your Content",
    body: "Fill in your name, bio, skills, experience, social links, and more. Changes appear in the preview as you type.",
  },
  {
    target: "preview-panel",
    title: "Live Preview",
    body: "This is exactly how your portfolio will look. Drag the resize handles to give the preview more space.",
  },
  {
    target: "export-btn",
    title: "Export When Ready",
    body: "Click 'Choose Template →' to pick your final template and download a standalone HTML file you can host anywhere.",
  },
];

const TEMPLATE_OPTIONS: { id: TemplateId; label: string }[] = [
  { id: "minimal-pro", label: "Minimal Pro" },
  { id: "clean-minimal", label: "Clean & Minimal" },
  { id: "aurora", label: "Aurora" },
];

const SUGGESTED_TAGS: Record<string, string[]> = {
  JavaScript: ["JavaScript", "Node.js", "React", "TypeScript"],
  TypeScript: ["TypeScript", "Node.js", "React"],
  Python: ["Python", "Django", "FastAPI", "Flask"],
  "C++": ["C++", "CMake"],
  Go: ["Go"],
  Rust: ["Rust"],
  Java: ["Java", "Spring"],
  Ruby: ["Ruby", "Rails"],
  Vue: ["Vue.js", "JavaScript"],
  Svelte: ["Svelte", "JavaScript"],
};

function repoToCustomized(repo: GitHubRepo, order: number): CustomizedProject {
  return {
    id: String(repo.id),
    originalName: repo.name,
    customTitle: repo.name,
    originalDescription: repo.description ?? null,
    customDescription: repo.description?.slice(0, 500) ?? "",
    tags: repo.language ? [repo.language] : [],
    imageUrl: undefined,
    demoUrl: undefined,
    githubUrl: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count,
    showGithubLink: true,
    order,
  };
}

function loadProjectsFromStorage(): CustomizedProject[] | null {
  if (typeof window === "undefined") return null;
  try {
    // Repos freshly selected from the dashboard take priority
    const reposRaw = sessionStorage.getItem(SELECTED_REPOS_KEY);
    if (reposRaw) {
      const repos: unknown = JSON.parse(reposRaw);
      if (Array.isArray(repos) && repos.length > 0) {
        return (repos as GitHubRepo[]).map((r: GitHubRepo, i: number) => repoToCustomized(r, i));
      }
    }
    // Previously customized projects stored across navigation
    const customRaw = sessionStorage.getItem(CUSTOMIZED_PROJECTS_KEY);
    if (customRaw) {
      const parsed: unknown = JSON.parse(customRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return (parsed as CustomizedProject[]).map((p, i) => ({ ...p, order: p.order ?? i }));
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function loadConfigFromStorage(): PortfolioConfig | null {
  if (typeof window === "undefined") return null;
  try {
    // localStorage persists across tab closes; sessionStorage is a fallback for in-session state
    const raw =
      localStorage.getItem(PORTFOLIO_CONFIG_KEY) ??
      sessionStorage.getItem(PORTFOLIO_CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PortfolioConfig;
    if (parsed && typeof parsed === "object" && parsed.hero) return parsed;
  } catch {
    // ignore
  }
  return null;
}

type SectionId = "hero" | "about" | "skills" | "services" | "projects" | "testimonials" | "experience" | "contact" | "theme";

const COLOR_SCHEMES: { id: ColorSchemeId; label: string; swatch: [string, string, string] }[] = [
  { id: "navy", label: "Navy Blue", swatch: ["#0a192f", "#ccd6f6", "#64ffda"] },
  { id: "purple", label: "Purple Gradient", swatch: ["#1a0b2e", "#e9d5ff", "#ec4899"] },
  { id: "teal", label: "Teal Modern", swatch: ["#0f172a", "#e2e8f0", "#22d3ee"] },
  { id: "green", label: "Forest Green", swatch: ["#052e16", "#dcfce7", "#34d399"] },
  { id: "warm-earth", label: "Warm Earth", swatch: ["#FAF9F6", "#2C2C2C", "#E8A87C"] },
  { id: "ocean-glass", label: "Ocean Glass", swatch: ["#1e3a5f", "#E8F4F8", "#64E9EE"] },
  { id: "sunset-warm", label: "Sunset Warm", swatch: ["#FAF3E0", "#264653", "#E76F51"] },
  { id: "gradient-purple", label: "Gradient Purple", swatch: ["#667eea", "#FFFFFF", "#4FACFE"] },
  { id: "custom", label: "Custom", swatch: ["#1e293b", "#f1f5f9", "#3b82f6"] },
];

const SECTIONS: { id: SectionId; label: string; icon: React.ReactNode; noCheckbox?: boolean }[] = [
  { id: "hero", label: "Hero", icon: <User className="h-4 w-4" /> },
  { id: "about", label: "About Me", icon: <FileText className="h-4 w-4" /> },
  { id: "skills", label: "Skills", icon: <Code className="h-4 w-4" /> },
  { id: "services", label: "Services", icon: <Star className="h-4 w-4" /> },
  { id: "projects", label: "Projects", icon: <Layout className="h-4 w-4" /> },
  { id: "testimonials", label: "Testimonials", icon: <MessageSquare className="h-4 w-4" /> },
  { id: "experience", label: "Experience", icon: <Briefcase className="h-4 w-4" /> },
  { id: "contact", label: "Contact", icon: <Mail className="h-4 w-4" /> },
  { id: "theme", label: "Theme & Colors", icon: <Palette className="h-4 w-4" />, noCheckbox: true },
];

function SortableProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: CustomizedProject;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 rounded-lg border p-3 transition-all ${
        isDragging ? "border-blue-500 bg-slate-800/80" : "border-slate-700 bg-slate-800/50"
      }`}
    >
      <button
        type="button"
        className="cursor-grab touch-manipulation rounded p-1 text-slate-500 hover:text-slate-300"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-200 truncate">
          {project.customTitle || project.originalName}
        </p>
        <p className="text-xs text-slate-500 line-clamp-1">
          {project.customDescription || project.originalDescription || "No description"}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onEdit(project.id)}
        className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white"
        aria-label="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onDelete(project.id)}
        className="rounded p-1.5 text-slate-400 hover:bg-red-500/20 hover:text-red-400"
        aria-label="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function ProjectEditModal({
  project,
  onClose,
  onSave,
}: {
  project: CustomizedProject;
  onClose: () => void;
  onSave: (p: CustomizedProject) => void;
}) {
  const [title, setTitle] = useState(project.customTitle);
  const [description, setDescription] = useState(project.customDescription);
  const [tags, setTags] = useState<string[]>(project.tags);
  const [tagInput, setTagInput] = useState("");
  const [imageUrl, setImageUrl] = useState(project.imageUrl ?? "");
  const [demoUrl, setDemoUrl] = useState(project.demoUrl ?? "");
  const [showGithubLink, setShowGithubLink] = useState(project.showGithubLink);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...project,
      customTitle: title.slice(0, 100).trim() || project.originalName,
      customDescription: description.slice(0, 500),
      tags,
      imageUrl: imageUrl.trim() || undefined,
      demoUrl: demoUrl.trim() || undefined,
      showGithubLink,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-700 px-4 py-3 bg-slate-900">
          <h3 className="font-semibold text-slate-100">Edit Project</h3>
          <button type="button" onClick={onClose} className="rounded p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="proj-title" className="block text-sm font-medium text-slate-300 mb-1">Title</label>
            <input
              id="proj-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="proj-description" className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              id="proj-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 resize-y"
            />
          </div>
          <div>
            <label htmlFor="proj-tags" className="block text-sm font-medium text-slate-300 mb-1">Tags (Enter to add)</label>
            <input
              id="proj-tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const t = tagInput.trim().slice(0, 50); // max 50 chars per tag
                  if (t && !tags.includes(t) && tags.length < 10) { // max 10 tags
                    setTags((prev) => [...prev, t]);
                  }
                  setTagInput("");
                }
              }}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded bg-slate-700 px-2 py-0.5 text-sm text-slate-200"
                >
                  {tag}
                  <button type="button" onClick={() => setTags((p) => p.filter((x) => x !== tag))}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="proj-image-url" className="block text-sm font-medium text-slate-300 mb-1">Image URL (optional)</label>
            <input
              id="proj-image-url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="proj-demo-url" className="block text-sm font-medium text-slate-300 mb-1">Demo URL (optional)</label>
            <input
              id="proj-demo-url"
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showGithubLink}
              onChange={(e) => setShowGithubLink(e.target.checked)}
              className="rounded border-slate-600 bg-slate-800 text-blue-500"
            />
            <span className="text-sm text-slate-300">Show GitHub link</span>
          </label>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-600 bg-slate-800 py-2 text-slate-200">
              Cancel
            </button>
            <button type="submit" className="flex-1 rounded-lg bg-blue-600 py-2 text-white font-medium hover:bg-blue-500">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AccordionSection({
  id, label, icon, enabled, noCheckbox, isOpen, onToggle, onToggleEnabled, children,
}: {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
  enabled: boolean;
  noCheckbox?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onToggleEnabled: (enabled: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-800/70 last:border-b-0">
      <button
        type="button"
        className="flex w-full items-center gap-2.5 px-4 py-3 cursor-pointer hover:bg-slate-800/40 transition-colors select-none text-left"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`section-panel-${label.replace(/\s+/g, "-").toLowerCase()}`}
      >
        {!noCheckbox ? (
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => { e.stopPropagation(); onToggleEnabled(e.target.checked); }}
            onClick={(e) => e.stopPropagation()}
            className="rounded border-slate-600 bg-slate-800 accent-amber-500 shrink-0"
          />
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <span className={`shrink-0 transition-colors ${isOpen ? "text-amber-400" : "text-slate-500"}`}>{icon}</span>
        <span className={`flex-1 text-sm font-medium transition-colors ${isOpen ? "text-slate-100" : "text-slate-400"}`}>{label}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-600 transition-transform duration-200 ${isOpen ? "rotate-180 text-amber-500" : ""}`} />
      </button>
      <div
        id={`section-panel-${label.replace(/\s+/g, "-").toLowerCase()}`}
        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pt-1 pb-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CustomizeClient() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [config, setConfig] = useState<PortfolioConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<"empty" | "corrupt" | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId | null>("hero");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);

  // Mobile layout: track breakpoint and active tab
  const [isMobile, setIsMobile] = useState(false);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(CUSTOMIZE_TOUR_KEY)) setShowTour(true);
  }, []);

  function completeTour() {
    localStorage.setItem(CUSTOMIZE_TOUR_KEY, "1");
    setShowTour(false);
  }

  // Resizable panel
  const [editorW, setEditorW] = useState(400);
  // Keep a ref in sync so the drag closure doesn't need editorW in its deps array
  const editorWRef = useRef(editorW);
  useEffect(() => { editorWRef.current = editorW; }, [editorW]);

  const startPanelResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = editorWRef.current;
    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      setEditorW(Math.max(320, Math.min(600, startW + delta)));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []); // no state deps — reads editorW from ref at drag-start time

  // Dynamic preview zoom
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewZoom, setPreviewZoom] = useState(0.6);
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const update = () => { if (el.clientWidth > 0) setPreviewZoom(el.clientWidth / 960); };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const projectsFromStorage = useMemo(() => loadProjectsFromStorage(), []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
      return;
    }
    if (status !== "authenticated") return;

    async function loadConfig() {
      const projects = projectsFromStorage;

      // Merge a persisted config with current defaults so any sections added
      // after the config was originally saved are present with safe empty values.
      function mergeWithDefaults(persisted: PortfolioConfig): PortfolioConfig {
        const defaults = createDefaultPortfolioConfig();
        return {
          ...defaults,
          ...persisted,
          services:     persisted.services     ?? defaults.services,
          testimonials: persisted.testimonials ?? defaults.testimonials,
          theme:        persisted.theme        ?? createDefaultTheme(),
        };
      }

      // 1. Try loading the saved config from the server first
      try {
        const res = await fetch("/api/portfolio");
        if (res.ok) {
          const data = await res.json() as { config: PortfolioConfig | null };
          if (data.config) {
            const merged = mergeWithDefaults(data.config);
            // If fresh repos were selected from the dashboard, inject them
            if (projects && projects.length > 0 && !merged.projects?.items?.length) {
              setConfig({ ...merged, projects: { ...merged.projects, items: projects.map((p, i) => ({ ...p, order: i })) } });
            } else {
              setConfig(merged);
            }
            setLoading(false);
            return;
          }
        }
      } catch {
        // Server unavailable — fall through to local storage
      }

      // 2. Fall back to localStorage / sessionStorage
      try {
        const saved = loadConfigFromStorage();
        if (saved) {
          const merged = mergeWithDefaults(saved);
          if (projects && projects.length > 0 && (!merged.projects?.items?.length || merged.projects.items.length === 0)) {
            setConfig({ ...merged, projects: { ...merged.projects, items: projects.map((p, i) => ({ ...p, order: i })) } });
          } else {
            setConfig(merged);
          }
        } else {
          if (!projects || projects.length === 0) {
            setLoadError("empty");
            setLoading(false);
            return;
          }
          setConfig(
            createDefaultPortfolioConfig({
              name: session?.user?.name ?? undefined,
              email: session?.user?.email ?? undefined,
              projects,
            })
          );
        }
      } catch {
        setLoadError("corrupt");
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, [status, session?.user?.name, session?.user?.email, projectsFromStorage, router]);

  // Refs for debounce timer and in-flight PUT cancellation
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveAbortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!config || typeof window === "undefined") return;

    // Write to localStorage immediately so data survives tab close
    try {
      localStorage.setItem(PORTFOLIO_CONFIG_KEY, JSON.stringify(config));
      sessionStorage.setItem(CUSTOMIZED_PROJECTS_KEY, JSON.stringify(config.projects.items));
    } catch (e) {
      console.error("Failed to save config locally", e);
    }

    // Debounced save to server (2 s after the last change).
    // Abort any in-flight request so only the latest config wins.
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      if (saveAbortControllerRef.current) saveAbortControllerRef.current.abort();
      const controller = new AbortController();
      saveAbortControllerRef.current = controller;
      try {
        await fetch("/api/portfolio", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config }),
          signal: controller.signal,
        });
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        // Silent — localStorage already has the data as a backup
      } finally {
        if (saveAbortControllerRef.current === controller) {
          saveAbortControllerRef.current = null;
        }
      }
    }, 2000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [config]);

  const updateConfig = useCallback(<K extends keyof PortfolioConfig>(key: K, value: PortfolioConfig[K]) => {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleProjectDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setConfig((prev) => {
      if (!prev?.projects.items.length) return prev;
      const items = prev.projects.items;
      const ids = items.map((p) => p.id);
      const o = ids.indexOf(active.id as string);
      const n = ids.indexOf(over.id as string);
      if (o === -1 || n === -1) return prev;
      const reordered = arrayMove(items, o, n).map((p, i) => ({ ...p, order: i }));
      return { ...prev, projects: { ...prev.projects, items: reordered } };
    });
  };

  const handleSaveProject = (updated: CustomizedProject) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const items = prev.projects.items.map((p) => (p.id === updated.id ? updated : p));
      return { ...prev, projects: { ...prev.projects, items } };
    });
    setEditingProjectId(null);
  };

  const handleDeleteProject = (id: string) => {
    if (deleteConfirmId === id) {
      setConfig((prev) => {
        if (!prev) return prev;
        const items = prev.projects.items.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i }));
        return { ...prev, projects: { ...prev.projects, items } };
      });
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const syncSelectionToDashboard = useCallback(() => {
    if (!config?.projects.items.length) return;
    const ids = config.projects.items
      .map((p) => Number(p.id))
      .filter((n) => !Number.isNaN(n));
    try {
      if (ids.length > 0) sessionStorage.setItem(DASHBOARD_SELECTION_KEY, JSON.stringify(ids));
      else sessionStorage.removeItem(DASHBOARD_SELECTION_KEY);
    } catch (e) {
      console.error("Failed to sync selection", e);
    }
  }, [config?.projects.items]);

  const handleChooseTemplate = () => {
    try {
      sessionStorage.setItem(PORTFOLIO_CONFIG_KEY, JSON.stringify(config));
      sessionStorage.setItem(CUSTOMIZED_PROJECTS_KEY, JSON.stringify(config?.projects.items ?? []));
      router.push("/templates");
    } catch (e) {
      console.error("Failed to save", e);
    }
  };

  const canProceed = config && config.hero.enabled && (config.hero.name?.trim() || config.projects.items?.length > 0);

  if (status === "loading" || loading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4" role="status">
          <div className="h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading…</p>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-center">
          <p className="text-slate-200">
            {loadError === "corrupt"
              ? "Saved data was invalid. Please start from the dashboard."
              : "Select repos on the dashboard first, then customize your portfolio."}
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-600"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (!config) return null;

  const editingProject = config.projects.items.find((p) => p.id === editingProjectId);

  return (
    <main className="flex flex-col bg-slate-950 text-slate-100" style={{ height: "calc(100vh - 4rem)", overflow: "hidden" }}>
      {showTour && <Tour steps={CUSTOMIZE_TOUR_STEPS} onDone={completeTour} />}

      {/* ── Mobile tab bar ── */}
      <div className="md:hidden flex shrink-0 border-b border-slate-800 bg-slate-900/60">
        <button
          type="button"
          onClick={() => setMobileTab("edit")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mobileTab === "edit" ? "text-amber-400 border-b-2 border-amber-500 -mb-px" : "text-slate-400 hover:text-slate-200"}`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mobileTab === "preview" ? "text-amber-400 border-b-2 border-amber-500 -mb-px" : "text-slate-400 hover:text-slate-200"}`}
        >
          Preview
        </button>
      </div>

      {/* ── Three-panel area ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

      {/* ── Accordion Editor Panel ── */}
      <div
        data-tour="editor-panel"
        className={`${isMobile && mobileTab !== "edit" ? "hidden" : ""} shrink-0 border-r border-slate-800/80 flex flex-col overflow-hidden bg-slate-900/30`}
        style={{ width: isMobile ? "100%" : editorW }}
      >
        <div className="px-4 py-3.5 border-b border-slate-800/60 shrink-0 flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={syncSelectionToDashboard}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Customize</span>
        </div>
        <div className="flex-1 overflow-y-auto" data-tour="section-nav">
          {SECTIONS.map(({ id, label, icon, noCheckbox }) => {
            const section = config[id as keyof PortfolioConfig];
            const enabled = section && typeof section === "object" && "enabled" in section
              ? (section as { enabled: boolean }).enabled
              : true;
            return (
              <AccordionSection
                key={id}
                id={id}
                label={label}
                icon={icon}
                enabled={enabled}
                noCheckbox={noCheckbox}
                isOpen={activeSection === id}
                onToggle={() => setActiveSection(activeSection === id ? null : id)}
                onToggleEnabled={(checked) => {
                  const key = id as keyof PortfolioConfig;
                  const sec = config[key];
                  if (sec && typeof sec === "object" && "enabled" in sec) {
                    updateConfig(key, { ...sec, enabled: checked } as PortfolioConfig[keyof PortfolioConfig]);
                  }
                }}
              >

          {id === "hero" && (
            <div className="space-y-5">
              <div>
                <label htmlFor="hero-name" className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Name *</label>
                <input
                  id="hero-name"
                  type="text"
                  value={config.hero.name}
                  onChange={(e) => updateConfig("hero", { ...config.hero, name: e.target.value })}
                  maxLength={100}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div>
                <label htmlFor="hero-title" className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Title / Role</label>
                <input
                  id="hero-title"
                  type="text"
                  value={config.hero.title}
                  onChange={(e) => updateConfig("hero", { ...config.hero, title: e.target.value })}
                  placeholder="e.g. Full-Stack Developer"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div>
                <label htmlFor="hero-bio" className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Bio <span className="normal-case text-slate-500">(max 200)</span></label>
                <textarea
                  id="hero-bio"
                  value={config.hero.bio}
                  onChange={(e) => updateConfig("hero", { ...config.hero, bio: e.target.value.slice(0, 200) })}
                  maxLength={200}
                  rows={3}
                  placeholder="Short one-liner about yourself"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm resize-y focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div>
                <label htmlFor="hero-photo" className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Profile photo URL</label>
                <input
                  id="hero-photo"
                  type="url"
                  value={config.hero.photoUrl ?? ""}
                  onChange={(e) => updateConfig("hero", { ...config.hero, photoUrl: e.target.value.trim() || undefined })}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="hero-cta-text" className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">CTA Text</label>
                  <input
                    id="hero-cta-text"
                    type="text"
                    value={config.hero.ctaText ?? ""}
                    onChange={(e) => updateConfig("hero", { ...config.hero, ctaText: e.target.value })}
                    placeholder="e.g. View my work"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
                <div>
                  <label htmlFor="hero-cta-link" className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">CTA Link</label>
                  <input
                    id="hero-cta-link"
                    type="url"
                    value={config.hero.ctaLink ?? ""}
                    onChange={(e) => updateConfig("hero", { ...config.hero, ctaLink: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="hero-resume-url" className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Resume URL <span className="normal-case text-slate-500">(Google Drive, Dropbox, etc.)</span></label>
                <input
                  id="hero-resume-url"
                  type="url"
                  value={config.hero.resumeUrl ?? ""}
                  onChange={(e) => updateConfig("hero", { ...config.hero, resumeUrl: e.target.value.trim() || undefined })}
                  placeholder="https://drive.google.com/..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              {/* Available for work */}
              <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-200">Available for Work</p>
                  <p className="text-xs text-slate-500 mt-0.5">Show a green "Available for Work" badge</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateConfig("hero", { ...config.hero, availableForWork: !config.hero.availableForWork })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.hero.availableForWork ? "bg-amber-500" : "bg-slate-600"}`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${config.hero.availableForWork ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              {/* Stats */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Stats <span className="normal-case text-slate-500">(e.g. 3+ Years of experience)</span></label>
                  <button
                    type="button"
                    onClick={() => updateConfig("hero", { ...config.hero, stats: [...(config.hero.stats ?? []), { label: "", value: "" }] })}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-amber-400 hover:bg-amber-400/10 transition-colors"
                  >
                    <Plus className="h-3 w-3" /> Add Stat
                  </button>
                </div>
                <div className="space-y-2">
                  {(config.hero.stats ?? []).map((stat, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => {
                          const stats = [...(config.hero.stats ?? [])];
                          stats[i] = { ...stats[i], value: e.target.value };
                          updateConfig("hero", { ...config.hero, stats });
                        }}
                        placeholder="3+"
                        className="w-20 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => {
                          const stats = [...(config.hero.stats ?? [])];
                          stats[i] = { ...stats[i], label: e.target.value };
                          updateConfig("hero", { ...config.hero, stats });
                        }}
                        placeholder="Years of experience"
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const stats = (config.hero.stats ?? []).filter((_, j) => j !== i);
                          updateConfig("hero", { ...config.hero, stats });
                        }}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {(!config.hero.stats || config.hero.stats.length === 0) && (
                    <p className="text-xs text-slate-600 italic">No stats yet — click "Add Stat" above</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {id === "about" && (
            <div className="space-y-5">
              <div>
                <label htmlFor="about-description" className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">About you <span className="normal-case text-slate-500">(max 500)</span></label>
                <textarea
                  id="about-description"
                  value={config.about.description}
                  onChange={(e) => updateConfig("about", { ...config.about, description: e.target.value.slice(0, 500) })}
                  maxLength={500}
                  rows={6}
                  placeholder="Who you are, what you do, what you care about..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm resize-y focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div>
                <label htmlFor="about-funfacts" className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Fun facts / hobbies <span className="normal-case text-slate-500">(max 200)</span></label>
                <textarea
                  id="about-funfacts"
                  value={config.about.funFacts ?? ""}
                  onChange={(e) => updateConfig("about", { ...config.about, funFacts: e.target.value.slice(0, 200) })}
                  maxLength={200}
                  rows={3}
                  placeholder="Optional — interests, hobbies, etc."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm resize-y focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
            </div>
          )}

          {id === "skills" && (
            <div className="space-y-5">
              {config.skills.categories.map((cat, catIndex) => (
                <div key={catIndex} className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-4">
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => {
                      const next = [...config.skills.categories];
                      next[catIndex] = { ...cat, name: e.target.value };
                      updateConfig("skills", { ...config.skills, categories: next });
                    }}
                    placeholder="Category name"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 text-sm font-medium mb-3 focus:border-amber-500/60 focus:outline-none"
                  />
                  <div className="space-y-2">
                    {cat.skills.map((skill, skillIndex) => (
                      <div key={skillIndex} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={skill.name}
                          onChange={(e) => {
                            const next = [...config.skills.categories];
                            const skills = [...next[catIndex].skills];
                            skills[skillIndex] = { ...skill, name: e.target.value };
                            next[catIndex] = { ...next[catIndex], skills };
                            updateConfig("skills", { ...config.skills, categories: next });
                          }}
                          placeholder="Skill name"
                          className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-100 focus:border-amber-500/60 focus:outline-none"
                        />
                        <select
                          value={skill.level}
                          onChange={(e) => {
                            const next = [...config.skills.categories];
                            const skills = [...next[catIndex].skills];
                            skills[skillIndex] = { ...skill, level: e.target.value };
                            next[catIndex] = { ...next[catIndex], skills };
                            updateConfig("skills", { ...config.skills, categories: next });
                          }}
                          className="rounded-lg border border-slate-600 bg-slate-800 px-2 py-1.5 text-sm text-slate-100 focus:border-amber-500/60 focus:outline-none"
                        >
                          {SKILL_LEVELS.map((l) => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...config.skills.categories];
                            next[catIndex] = {
                              ...next[catIndex],
                              skills: next[catIndex].skills.filter((_, i) => i !== skillIndex),
                            };
                            updateConfig("skills", { ...config.skills, categories: next });
                          }}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-700 hover:text-red-400 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...config.skills.categories];
                        next[catIndex] = {
                          ...next[catIndex],
                          skills: [...next[catIndex].skills, { name: "", level: "Intermediate" }],
                        };
                        updateConfig("skills", { ...config.skills, categories: next });
                      }}
                      className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 mt-1 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add skill
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  updateConfig("skills", {
                    ...config.skills,
                    categories: [...config.skills.categories, { name: "New category", skills: [] }],
                  })
                }
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add category
              </button>
            </div>
          )}

          {id === "projects" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                {config.projects.items.length} project{config.projects.items.length !== 1 ? 's' : ''}. Drag to reorder; click edit to change details.
              </p>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleProjectDragEnd}>
                <SortableContext
                  items={config.projects.items.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {config.projects.items.map((project) => (
                      <SortableProjectCard
                        key={project.id}
                        project={project}
                        onEdit={setEditingProjectId}
                        onDelete={handleDeleteProject}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              {deleteConfirmId && (
                <p className="text-xs text-amber-400">Click remove again to confirm deletion.</p>
              )}
            </div>
          )}

          {id === "services" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">Add the services you offer. Each card can include a title, description, optional image, and a link.</p>
              {(config.services?.items ?? []).map((svc, i) => (
                <div key={i} className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Service {i + 1}</span>
                    <button type="button" onClick={() => updateConfig("services", { ...config.services, items: config.services.items.filter((_, j) => j !== i) })} className="text-slate-500 hover:text-red-400 transition-colors"><X className="h-4 w-4" /></button>
                  </div>
                  <input type="text" value={svc.title} onChange={(e) => { const items = [...config.services.items]; items[i] = { ...items[i], title: e.target.value }; updateConfig("services", { ...config.services, items }); }} placeholder="Frontend Development" className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none" />
                  <textarea value={svc.description} onChange={(e) => { const items = [...config.services.items]; items[i] = { ...items[i], description: e.target.value }; updateConfig("services", { ...config.services, items }); }} rows={3} placeholder="Describe what you offer..." className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-slate-100 text-sm resize-none focus:border-amber-500/60 focus:outline-none" />
                  <input type="url" value={svc.imageUrl ?? ""} onChange={(e) => { const items = [...config.services.items]; items[i] = { ...items[i], imageUrl: e.target.value.trim() || undefined }; updateConfig("services", { ...config.services, items }); }} placeholder="Image URL (optional)" className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none" />
                  <input type="url" value={svc.link ?? ""} onChange={(e) => { const items = [...config.services.items]; items[i] = { ...items[i], link: e.target.value.trim() || undefined }; updateConfig("services", { ...config.services, items }); }} placeholder="Link URL (optional)" className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none" />
                </div>
              ))}
              <button
                type="button"
                onClick={() => updateConfig("services", { ...config.services, items: [...(config.services?.items ?? []), { title: "", description: "" }] })}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-600 py-2.5 text-sm font-medium text-slate-400 hover:border-amber-500/50 hover:text-amber-400 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Service
              </button>
            </div>
          )}

          {id === "testimonials" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">Add testimonials from clients or colleagues. They'll appear in a carousel with navigation arrows.</p>
              {(config.testimonials?.items ?? []).map((t, i) => (
                <div key={i} className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Testimonial {i + 1}</span>
                    <button type="button" onClick={() => updateConfig("testimonials", { ...config.testimonials, items: config.testimonials.items.filter((_, j) => j !== i) })} className="text-slate-500 hover:text-red-400 transition-colors"><X className="h-4 w-4" /></button>
                  </div>
                  <textarea value={t.quote} onChange={(e) => { const items = [...config.testimonials.items]; items[i] = { ...items[i], quote: e.target.value }; updateConfig("testimonials", { ...config.testimonials, items }); }} rows={3} placeholder="What they said about you..." className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-slate-100 text-sm resize-none focus:border-amber-500/60 focus:outline-none" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={t.name} onChange={(e) => { const items = [...config.testimonials.items]; items[i] = { ...items[i], name: e.target.value }; updateConfig("testimonials", { ...config.testimonials, items }); }} placeholder="Name" className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none" />
                    <input type="text" value={t.role} onChange={(e) => { const items = [...config.testimonials.items]; items[i] = { ...items[i], role: e.target.value }; updateConfig("testimonials", { ...config.testimonials, items }); }} placeholder="Role" className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none" />
                  </div>
                  <input type="text" value={t.company ?? ""} onChange={(e) => { const items = [...config.testimonials.items]; items[i] = { ...items[i], company: e.target.value || undefined }; updateConfig("testimonials", { ...config.testimonials, items }); }} placeholder="Company (optional)" className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none" />
                  <input type="url" value={t.avatarUrl ?? ""} onChange={(e) => { const items = [...config.testimonials.items]; items[i] = { ...items[i], avatarUrl: e.target.value.trim() || undefined }; updateConfig("testimonials", { ...config.testimonials, items }); }} placeholder="Photo URL (optional)" className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none" />
                </div>
              ))}
              <button
                type="button"
                onClick={() => updateConfig("testimonials", { ...config.testimonials, items: [...(config.testimonials?.items ?? []), { quote: "", name: "", role: "" }] })}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-600 py-2.5 text-sm font-medium text-slate-400 hover:border-amber-500/50 hover:text-amber-400 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Testimonial
              </button>
            </div>
          )}

          {id === "experience" && (
            <div className="space-y-5">
              {config.experience.items.map((entry, i) => (
                <div key={i} className="rounded-xl border border-slate-700/80 bg-slate-900/50 p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Entry {i + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateConfig("experience", {
                          ...config.experience,
                          items: config.experience.items.filter((_, j) => j !== i),
                        })
                      }
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={entry.company}
                    onChange={(e) => {
                      const next = [...config.experience.items];
                      next[i] = { ...entry, company: e.target.value };
                      updateConfig("experience", { ...config.experience, items: next });
                    }}
                    placeholder="Company"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-amber-500/60 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={entry.role}
                    onChange={(e) => {
                      const next = [...config.experience.items];
                      next[i] = { ...entry, role: e.target.value };
                      updateConfig("experience", { ...config.experience, items: next });
                    }}
                    placeholder="Role / Title"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-amber-500/60 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={entry.duration}
                    onChange={(e) => {
                      const next = [...config.experience.items];
                      next[i] = { ...entry, duration: e.target.value };
                      updateConfig("experience", { ...config.experience, items: next });
                    }}
                    placeholder="Duration (e.g. 2020 – Present)"
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-amber-500/60 focus:outline-none"
                  />
                  <textarea
                    value={entry.description}
                    onChange={(e) => {
                      const next = [...config.experience.items];
                      next[i] = { ...entry, description: e.target.value };
                      updateConfig("experience", { ...config.experience, items: next });
                    }}
                    placeholder="Key responsibilities / achievements"
                    rows={3}
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 resize-y focus:border-amber-500/60 focus:outline-none"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  updateConfig("experience", {
                    ...config.experience,
                    items: [...config.experience.items, getEmptyExperienceEntry()],
                  })
                }
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add experience
              </button>
            </div>
          )}

          {id === "contact" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">Customize the wording for your situation — job seeker, freelancer, student, etc.</p>
              <div>
                <label htmlFor="contact-headline" className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Contact headline</label>
                <input
                  id="contact-headline"
                  type="text"
                  value={config.contact.headline ?? ""}
                  onChange={(e) => updateConfig("contact", { ...config.contact, headline: e.target.value.trim() || undefined })}
                  placeholder="e.g. Get in touch / Let's work together"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div>
                <label htmlFor="contact-subtext" className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Subtext</label>
                <input
                  id="contact-subtext"
                  type="text"
                  value={config.contact.subtext ?? ""}
                  onChange={(e) => updateConfig("contact", { ...config.contact, subtext: e.target.value.trim() || undefined })}
                  placeholder="e.g. Open to opportunities / Available for freelance"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div>
                <label htmlFor="contact-cta-label" className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Button label</label>
                <input
                  id="contact-cta-label"
                  type="text"
                  value={config.contact.ctaLabel ?? ""}
                  onChange={(e) => updateConfig("contact", { ...config.contact, ctaLabel: e.target.value.trim() || undefined })}
                  placeholder="e.g. Email me / Say hello"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Email *</label>
                <input
                  id="contact-email"
                  type="email"
                  value={config.contact.email}
                  onChange={(e) => updateConfig("contact", { ...config.contact, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 pt-1">
                {[
                  { key: 'github'   as const, label: 'GitHub URL',      placeholder: 'https://github.com/...' },
                  { key: 'linkedin' as const, label: 'LinkedIn URL',     placeholder: 'https://linkedin.com/in/...' },
                  { key: 'twitter'  as const, label: 'Twitter / X URL',  placeholder: 'https://twitter.com/...' },
                  { key: 'website'  as const, label: 'Website URL',      placeholder: 'https://yoursite.com' },
                  { key: 'medium'   as const, label: 'Medium URL',       placeholder: 'https://medium.com/@...' },
                  { key: 'devto'    as const, label: 'Dev.to URL',       placeholder: 'https://dev.to/...' },
                  { key: 'youtube'  as const, label: 'YouTube URL',      placeholder: 'https://youtube.com/@...' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label htmlFor={`contact-${key}`} className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">{label}</label>
                    <input
                      id={`contact-${key}`}
                      type="url"
                      value={config.contact[key] ?? ""}
                      onChange={(e) => updateConfig("contact", { ...config.contact, [key]: e.target.value.trim() || undefined })}
                      placeholder={placeholder}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 text-sm focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {id === "theme" && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Template</label>
                <div className="space-y-2">
                  {TEMPLATE_OPTIONS.map(({ id, label }) => (
                    <label key={id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      (config.theme?.template ?? "minimal-pro") === id
                        ? "border-amber-500/40 bg-amber-500/8"
                        : "border-slate-700 hover:border-slate-600"
                    }`}>
                      <input
                        type="radio"
                        name="template"
                        checked={(config.theme?.template ?? "minimal-pro") === id}
                        onChange={() => updateConfig("theme", { ...config.theme, template: id })}
                        className="accent-amber-500"
                      />
                      <span className="text-slate-200 text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Mode</label>
                <div className="flex rounded-xl border border-slate-700 overflow-hidden">
                  {(() => {
                    const template = config.theme?.template ?? "minimal-pro";
                    const isLightDefault = template === "clean-minimal";
                    const isDark = isLightDefault
                      ? config.theme?.darkMode === true
                      : config.theme?.darkMode !== false;
                    return (
                      <>
                        <button
                          type="button"
                          onClick={() => updateConfig("theme", { ...config.theme, darkMode: isLightDefault ? undefined : false })}
                          className={`flex-1 py-2 text-sm font-medium transition-colors ${!isDark ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-200"}`}
                        >
                          ☀ Light
                        </button>
                        <button
                          type="button"
                          onClick={() => updateConfig("theme", { ...config.theme, darkMode: isLightDefault ? true : undefined })}
                          className={`flex-1 py-2 text-sm font-medium transition-colors ${isDark ? "bg-slate-800 text-slate-100" : "text-slate-400 hover:text-slate-200"}`}
                        >
                          ☾ Dark
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Color scheme</label>
                <div className="space-y-2">
                  {COLOR_SCHEMES.map((scheme) => (
                    <label
                      key={scheme.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        (config.theme?.colorScheme ?? "navy") === scheme.id
                          ? "border-amber-500/40 bg-amber-500/8"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <input
                        type="radio"
                        name="colorScheme"
                        checked={(config.theme?.colorScheme ?? "navy") === scheme.id}
                        onChange={() =>
                          updateConfig("theme", {
                            ...config.theme,
                            colorScheme: scheme.id,
                            customColors: scheme.id === "custom" ? config.theme?.customColors ?? {
                              primary: "#3b82f6", secondary: "#1e293b", accent: "#3b82f6",
                              background: "#0f172a", text: "#f1f5f9",
                            } : undefined,
                          })
                        }
                        className="accent-amber-500"
                      />
                      <div className="flex gap-1.5">
                        {scheme.swatch.map((c, i) => (
                          <span
                            key={i}
                            className="w-6 h-6 rounded-md border border-slate-600 shrink-0"
                            style={{ backgroundColor: c }}
                            aria-hidden
                          />
                        ))}
                      </div>
                      <span className="text-slate-200 text-sm">{scheme.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {(config.theme?.colorScheme ?? "navy") === "custom" && (
                <div className="rounded-xl border border-slate-700 p-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Custom colors</p>
                  {(["primary", "secondary", "accent", "background", "text"] as const).map((key) => (
                    <div key={key} className="flex items-center gap-3">
                      <label className="text-sm text-slate-400 w-24 capitalize">{key}</label>
                      <input
                        type="color"
                        value={config.theme?.customColors?.[key] ?? "#3b82f6"}
                        onChange={(e) =>
                          updateConfig("theme", {
                            ...config.theme,
                            customColors: {
                              ...(config.theme?.customColors ?? {
                                primary: "#3b82f6", secondary: "#1e293b", accent: "#3b82f6",
                                background: "#0f172a", text: "#f1f5f9",
                              }),
                              [key]: e.target.value,
                            },
                          })
                        }
                        className="w-10 h-10 rounded-lg cursor-pointer border border-slate-600"
                      />
                      <input
                        type="text"
                        value={config.theme?.customColors?.[key] ?? ""}
                        onChange={(e) =>
                          updateConfig("theme", {
                            ...config.theme,
                            customColors: {
                              ...(config.theme?.customColors ?? {
                                primary: "#3b82f6", secondary: "#1e293b", accent: "#3b82f6",
                                background: "#0f172a", text: "#f1f5f9",
                              }),
                              [key]: e.target.value,
                            },
                          })
                        }
                        className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-2 py-1.5 text-slate-100 text-sm font-mono focus:border-amber-500/60 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

              </AccordionSection>
            );
          })}
        </div>
      </div>

      {/* Resize handle — desktop only */}
      <div
        className="hidden md:block w-1 shrink-0 cursor-col-resize bg-slate-800/60 hover:bg-amber-500/50 active:bg-amber-500/70 transition-colors"
        onMouseDown={startPanelResize}
        title="Drag to resize"
      />

      {/* ── Live Preview Panel ── */}
      <div
        data-tour="preview-panel"
        className={`${isMobile && mobileTab !== "preview" ? "hidden" : ""} flex-1 min-w-0 flex flex-col overflow-hidden bg-slate-950`}
      >
        {/* Browser chrome (merged with toolbar) */}
        <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 bg-slate-900/90 border-b border-slate-700/50">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400/50" />
            <div className="h-3 w-3 rounded-full bg-amber-400/50" />
            <div className="h-3 w-3 rounded-full bg-green-400/50" />
          </div>
          <div className="flex-1 rounded-md bg-slate-700/50 px-3 py-1 text-xs text-slate-400 truncate">
            {config.hero.name
              ? `${config.hero.name.toLowerCase().replace(/\s+/g, "")}.portfolio.dev`
              : "your-portfolio.dev"}
          </div>
          <a
            href="/customize/preview"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            ↗
          </a>
        </div>

        {/* Template preview — zoom fills panel width exactly */}
        <div ref={previewRef} className="flex-1 overflow-y-auto overflow-x-hidden">
          <div style={{ zoom: previewZoom, width: "960px" }}>
            <PreviewTemplate config={config} />
          </div>
        </div>
      </div>

      {editingProject && (
        <ProjectEditModal
          project={editingProject}
          onClose={() => setEditingProjectId(null)}
          onSave={handleSaveProject}
        />
      )}

      </div>{/* end three-panel wrapper */}

      {/* Bottom bar — full width on mobile, offset by editor width on desktop */}
      <div
        className="fixed bottom-0 right-0 z-30 border-t border-slate-800 bg-slate-900/95 backdrop-blur"
        style={{ left: isMobile ? 0 : editorW + 2 }}
      >
        <div className="flex items-center justify-between px-4 py-3 gap-3">
          <Link
            href="/dashboard"
            onClick={syncSelectionToDashboard}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <button
            data-tour="export-btn"
            type="button"
            onClick={handleChooseTemplate}
            disabled={!canProceed}
            className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors ${
              canProceed
                ? "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm shadow-amber-500/20"
                : "bg-slate-700 text-slate-400 cursor-not-allowed"
            }`}
          >
            Choose Template →
          </button>
        </div>
      </div>

      {/* Take tour button — hide on mobile to avoid overlap */}
      {!showTour && !isMobile && (
        <button
          type="button"
          onClick={() => setShowTour(true)}
          className="fixed bottom-20 left-4 z-30 flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-400 shadow-lg backdrop-blur hover:border-amber-500/50 hover:text-amber-400 transition-colors"
          aria-label="Take tour"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Tour
        </button>
      )}
    </main>
  );
}
