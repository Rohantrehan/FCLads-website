import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { Logo } from "./components/Logo";
import { StudioProvider } from "./components/StudioProvider";
import { dataset, projectId } from "./env";
import { homeTool } from "./home/HomeTool";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";
import { theme } from "./theme";

const SINGLETONS = new Set(["siteSettings"]);

export default defineConfig({
  name: "default",
  title: "FC Lads",
  icon: Logo,
  projectId,
  dataset,
  theme,
  plugins: [structureTool({ structure, title: "Content" }), visionTool({ defaultApiVersion: "2025-02-19" })],
  studio: { components: { provider: StudioProvider } },

  // Home (big "new post" buttons) opens first. The query tool (Vision) is for admins only.
  tools: (tools, { currentUser }) => {
    const isAdmin = currentUser?.roles.some((role) => role.name === "administrator");
    return [homeTool, ...tools.filter((tool) => isAdmin || tool.name !== "vision")];
  },

  // Keep the Studio simple: no tasks, releases, scheduling, comments, Canvas or "What's new" pop-ups.
  tasks: { enabled: false },
  announcements: { enabled: false },
  apps: { canvas: { enabled: false } },
  releases: { enabled: false },
  scheduledPublishing: { enabled: false },
  scheduledDrafts: { enabled: false },

  schema: {
    types: schemaTypes,
    // Site settings can't be created again from the "+" menu.
    templates: (templates) => templates.filter((template) => !SINGLETONS.has(template.schemaType)),
  },
  document: {
    comments: { enabled: false },
    // Site settings can't be duplicated or deleted.
    actions: (actions, context) =>
      SINGLETONS.has(context.schemaType)
        ? actions.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action))
        : actions,
  },
});
