export interface CustomizedProject {
  id: string;
  originalName: string;
  customTitle: string;
  originalDescription: string | null;
  customDescription: string;
  tags: string[];
  imageUrl?: string;
  demoUrl?: string;
  githubUrl: string;
  language: string | null;
  stars: number;
  showGithubLink: boolean;
  order: number;
}

/** Dashboard: persist selected repo IDs when user returns from customize */
export const DASHBOARD_SELECTION_KEY = "dashboardSelection";
/** Pass full repo array from dashboard to customize when clicking Create Portfolio */
export const SELECTED_REPOS_KEY = "selectedRepos";
/** Pass customized projects from customize to templates */
export const CUSTOMIZED_PROJECTS_KEY = "customizedProjects";

/** @deprecated Use SELECTED_REPOS_KEY for new flow; kept for backward compat */
export const CUSTOMIZE_STORAGE_KEY = "autoport_selected_repos";
