/**
 * ecosystem.config.js — PM2 production configuration.
 * Runs API in cluster mode using all available CPU cores.
 * Zero-downtime reload: pm2 reload funpals-api
 */
module.exports = {
  apps: [{
    name:              'funpals-api',
    script:            './apps/api/dist/app.js',
    instances:         'max',
    exec_mode:         'cluster',
    watch:             false,
    max_memory_restart:'512M',
    env_production: {
      NODE_ENV: 'production',
      PORT:     '3000',
    },
    error_file:      'logs/api-error.log',
    out_file:        'logs/api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }],
};
