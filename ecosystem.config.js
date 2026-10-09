module.exports = {
  apps: [
    { name: "dream-gadgets-api", script: "dist/main.js", cwd: "./apps/api", env: { NODE_ENV: "production", PORT: "3000" }, instances: 1, exec_mode: "fork", max_memory_restart: "1G", error_file: "../../logs/api-error.log", out_file: "../../logs/api-out.log", time: true },
    { name: "dream-gadgets-web", script: "node_modules/.bin/next", args: "start -p 3001", cwd: "./apps/web", env: { NODE_ENV: "production", PORT: "3001", HOSTNAME: "0.0.0.0" }, instances: 1, exec_mode: "fork", max_memory_restart: "1G", error_file: "../../logs/web-error.log", out_file: "../../logs/web-out.log", time: true },
    { name: "dream-gadgets-admin", script: "node_modules/.bin/next", args: "start -p 3002", cwd: "./apps/admin", env: { NODE_ENV: "production", PORT: "3002", HOSTNAME: "0.0.0.0" }, instances: 1, exec_mode: "fork", max_memory_restart: "1G", error_file: "../../logs/admin-error.log", out_file: "../../logs/admin-out.log", time: true },
  ],
};
