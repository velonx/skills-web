export const SITE_URL = "https://skills.velonx.com";
export const ORG = "velonx";
export const SKILLS_REPO = `https://github.com/${ORG}/agent-skills`;
export const WEB_REPO = `https://github.com/${ORG}/skills-web`;
export const SKILLS_RAW = `https://raw.githubusercontent.com/${ORG}/agent-skills/main`;

export const repoFile = (path: string) => `${SKILLS_REPO}/blob/main/${path}`;
export const skillTree = (name: string) => `${SKILLS_REPO}/tree/main/skills/${name}`;
