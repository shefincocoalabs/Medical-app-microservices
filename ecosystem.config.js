module.exports = {
    apps : [
    {
      name: 'Accounts- Medical App Microservices',
      script: 'accounts.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'development',
        port : 9001
      }
    },
    {
      name: 'Contact - Medical App Microservices',
      script: 'contacts.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'development',
        port : 9002
      }
    },
    {
      name: 'Subject - Medical App Microservices',
      script: 'subjects.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'development',
        port : 9003
      }
    },
    {
      name: 'Video - Medical App Microservices',
      script: 'videos.service.js',
      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      //cron_restart
      env: {
        NODE_ENV: 'development',
        port : 9004
      }
    }
    ]
  };