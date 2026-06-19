import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  cloudflare: {
    deployment: {
      strategy: "pages",
    },
  },
});
