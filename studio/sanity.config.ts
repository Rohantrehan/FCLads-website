import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { dataset, projectId } from "./env";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

const SINGLETONS = new Set(["siteSettings"]);

export default defineConfig({
  name: "default",
  title: "FC Lads",
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: "2025-02-19" })],
  schema: {
    types: schemaTypes,
    // Site settings can't be created again from the "+" menu.
    templates: (templates) => templates.filter((template) => !SINGLETONS.has(template.schemaType)),
  },
  document: {
    // Site settings can't be duplicated or deleted.
    actions: (actions, context) =>
      SINGLETONS.has(context.schemaType)
        ? actions.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action))
        : actions,
  },
});
