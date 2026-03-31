// PM2 Configuration for Hostinger
module.exports = {
  apps: [{
    name: 'sabbirahsan-website',
    script: 'node_modules/.bin/next',
    args: 'start -p 3000',
    cwd: '/home/u123456789/domains/sabbirahsan.com/public_html',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
  }],
}
