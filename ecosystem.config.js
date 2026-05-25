module.exports = {
  apps: [{
    name: "fayda",
    script: "server.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "200M",
    env: {
      PORT: 5500,
      HOST: "0.0.0.0"
    }
  }]
};
