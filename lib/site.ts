export const SITE_URL = "https://skills.velonx.com";
export const ORG = "velonx";
export const SKILLS_REPO = `https://github.com/${ORG}/agent-skills`;
export const WEB_REPO = `https://github.com/${ORG}/skills-web`;
export const SKILLS_RAW = `https://raw.githubusercontent.com/${ORG}/agent-skills/main`;

export const repoFile = (path: string) => `${SKILLS_REPO}/blob/main/${path}`;
export const skillTree = (name: string) => `${SKILLS_REPO}/tree/main/skills/${name}`;
export const skillEditUrl = (path: string) => `${SKILLS_REPO}/edit/main/${path}`;
export const skillIssueUrl = (name: string) =>
  `${SKILLS_REPO}/issues/new?template=bug-report.md&title=${encodeURIComponent(`[Bug] ${name}: `)}`;
export const skillRequestUrl = `${SKILLS_REPO}/issues/new?template=skill-request.md`;
export const CONTRIBUTING = `${SKILLS_REPO}/blob/main/CONTRIBUTING.md`;

export const PLATFORMS: Record<string, string> = {
  generic: "Generic",
  claude: "Claude",
  openai: "OpenAI",
  gemini: "Gemini",
  cursor: "Cursor",
};

export const REQUIREMENTS: Record<string, string> = {
  "web-access": "Web access — search and open pages",
  filesystem: "Read and write local files",
  "code-execution": "Run code (e.g. Python)",
  shell: "Run shell commands",
  git: "git",
  "github-cli": "GitHub CLI (gh), signed in",
  database: "A database connection",
  "email-access": "Access to an email account",
  browser: "A browser the agent can control",
};
