import site from "../site.config.mjs";

// Prefix an internal path ("/posts/x/") with the site's base path
export const link = (path) => `${site.base || ""}${path}`;

// Full public address of an internal path
export const abs = (path) => new URL(link(path), site.url).href;
