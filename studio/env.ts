// Set in studio/.env (see .env.example). The Studio can't start without a project ID.
export const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? "";
export const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";
