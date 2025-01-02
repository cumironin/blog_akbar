import http from "node:http";
import app from "./app.js";
import config from "./config/index.js";
const server = http.createServer(app);

app.get("/api/health/liveness", (_, res) => {
	res.status(200).json({ status: "ok" });
});

app.use((req, res, next) => {
	if (req.path === "/api/health/liveness") {
		return next();
	}
	// Your existing auth middleware logic here
});

server.listen(config.port, () => {
	console.log(`Server is running at http://localhost:${config.port}`);
});
