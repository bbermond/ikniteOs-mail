import { defineRailway, project, service, volume } from "railway/iac";

// This repo owns only the mail service inside the shared ikniteos-com Railway
// project. The marketing site (service ikniteos-com) is managed from its own
// repo, so keep `partial` here or a plan will try to manage that service too.
export const partial = "ikniteos-mail";

export default defineRailway(() => {
  // Uploaded portraits, logos, banners and the leads log live here. Wiping it
  // breaks every signature already sent.
  const uploads = volume("ikniteos-mail-volume", { region: "us-west2", sizeMB: 50000 });

  const mail = service("ikniteos-mail", {
    build: { builder: "RAILPACK" },
    // package.json `start` does the same thing; stating it here keeps the
    // service correct even if someone changes that script.
    start: "node .next/standalone/server.js",
    healthcheck: "/",
    healthcheckTimeout: 100,
    deploy: {
      restartPolicyType: "ON_FAILURE",
      restartPolicyMaxRetries: 10,
    },
    variables: {
      // Absolute base for image URLs inside signatures. Baked in at build time.
      NEXT_PUBLIC_SITE_URL: "https://mail.ikniteos.com",
      UPLOAD_DIR: "/data/uploads",
      // Next.js standalone binds to HOSTNAME; the container default is not routable.
      HOSTNAME: "0.0.0.0",
      NODE_ENV: "production",
    },
    volumeMounts: { "/data": uploads },
  });

  return project("ikniteos-com", { resources: [uploads, mail] });
});
