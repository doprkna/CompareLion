/**
 * PM2 Ecosystem Configuration (v0.11.3)
 * 
 * Production process management with auto-restart and monitoring.
 */

module.exports = {
  apps: [
    {
      name: "parel-web",
      script: "pnpm",
      args: "start",
      cwd: "./apps/web",
      instances: process.env.PM2_INSTANCES || 2,
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 4000,
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: false,
    },
    {
      name: "parel-worker",
      script: "node",
      args: "dist/worker.js",
      cwd: "./apps/worker",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
      },
      error_file: "./logs/worker-error.log",
      out_file: "./logs/worker-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 4000,
    },
  ],
};










