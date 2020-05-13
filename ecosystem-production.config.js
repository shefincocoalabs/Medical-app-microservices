module.exports = {
    apps : [
    {
      name: 'Accounts- Medical App Microservices | Production',
      script: 'accounts.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'production',
        port : 8082
      }
    },
    {
      name: 'Contact - Medical App Microservices | Production',
      script: 'contacts.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'production',
        port : 8083
      }
    },
    {
      name: 'Subject - Medical App Microservices | Production',
      script: 'subjects.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'production',
        port : 8084
      }
    },
    {
      name: 'Video - Medical App Microservices | Production',
      script: 'videos.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'production',
        port : 8085
      }
    }
    ]
  };