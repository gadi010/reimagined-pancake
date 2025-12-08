import 'dotenv/config';

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import swaggerUi from "swagger-ui-express";

import authrouter from "./routes/auth.route.js";
import projectrouter from "./routes/project.route.js";
import workRouter from "./routes/work.route.js";
import userrouter from "./routes/user.route.js";
import testrouter from "./routes/test.route.js";
import githubRouter from "./routes/github.route.js";

const swaggerFile = path.join(process.cwd(), "src/swagger/swagger.json");
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerFile, "utf-8"));

const app = express();


app.use(cors());
app.use(express.json());

app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, _, next) => {
  console.log(`Incoming: ${req.method} ${req.originalUrl}`);
  next();
});

/**
 * @openapi
 * /api/v1/test/hello:
 *   get:
 *     summary: Hello test route
 *     responses:
 *       200:
 *         description: OK
 */
app.get("/hello", (_, res) => res.send("Hello"));


app.use('/api/v1/auth', authrouter)
app.use('/api/v1/project', projectrouter)
app.use('/api/v1/work', workRouter)
app.use('/api/v1/user', userrouter)
app.use('/api/v1/test', testrouter)
app.use('/api/v1/github', githubRouter)

export default app;