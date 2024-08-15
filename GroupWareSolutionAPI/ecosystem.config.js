module.exports = {
    apps: [
        {
            name: "GroupWareSolutionAPI",
            cwd: "",
            script: "./api_server.js",
            watch: ["./api_server.js"],
            ignore_watch: ["node_modules"],
            watch_options: {
                "followSymlinks": false
            },
            env: {
                "NODE_ENV": "development",
            },
            env_production: {
                "NODE_ENV": "production"
            }
        },
        {
            name: "WebSockets",
            cwd: "",
            script: "./ws_server.js",
            watch: ["./ws_server.js"],
            env: {
                "NODE_ENV": "development",
            },
            env_production: {
                "NODE_ENV": "production"
            }
        },
    ]
}
