const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

console.log(`[Server] Starting ${dev ? "development" : "production"} server...`);

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            const { pathname, query } = parsedUrl;

            // Log requests in development for debugging
            if (dev && req.url && !req.url.startsWith("/_next")) {
                console.log(`[Request] ${req.method} ${req.url}`);
            }

            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error(`[Error] Failed to handle request for ${req.url}:`, err);
            res.statusCode = 500;
            res.setHeader("Content-Type", "text/plain");
            res.end("Internal server error");
        }
    });

    const io = new Server(server, {
        cors: {
            origin: dev ? "*" : `http://${hostname}:${port}`,
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log(`[Socket.IO] Client connected - ID: ${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`[Socket.IO] Client disconnected - ID: ${socket.id}`);
        });

        socket.on("error", (error) => {
            console.error(`[Socket.IO] Socket error for ${socket.id}:`, error);
        });
    });

    // Make io accessible globally for API routes to emit events
    global.io = io;

    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`\n✓ Server ready`);
        console.log(`  - Local:            http://${hostname}:${port}`);
        console.log(`  - Environment:      ${dev ? "development" : "production"}`);
        console.log(`  - Socket.IO:        enabled\n`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
        console.log("\n[Server] SIGTERM received, shutting down gracefully...");
        server.close(() => {
            console.log("[Server] Server closed");
            process.exit(0);
        });
    });
}).catch((err) => {
    console.error("[Server] Failed to start:", err);
    process.exit(1);
});
