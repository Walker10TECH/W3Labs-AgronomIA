/*
 * Runtime configuration template.
 * Local dev: server.js reads .env and serves these values automatically.
 * Static hosting: replace this file during deployment with your public Firebase config.
 * Never place Groq/private server keys here.
 */
window.W3LABS_ENV = window.W3LABS_ENV || {
  FIREBASE_API_KEY: "",
  FIREBASE_AUTH_DOMAIN: "",
  FIREBASE_PROJECT_ID: "",
  FIREBASE_STORAGE_BUCKET: "",
  FIREBASE_MESSAGING_SENDER_ID: "",
  FIREBASE_APP_ID: "",
  FIREBASE_MEASUREMENT_ID: "",
  AI_PROXY_URL: "/api/groq"
};
