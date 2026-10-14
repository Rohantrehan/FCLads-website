import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./env";

export default defineCliConfig({
  api: { projectId, dataset },
  // Hosted at https://<studioHost>.sanity.studio after `npm run deploy`.
  studioHost: "fclads",
  deployment: { autoUpdates: true },
});
