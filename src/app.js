import express from "express";
import cors  from "cors";
import authrouter from "./routes/auth.route.js";
import projectrouter from "./routes/project.route.js";
import 'dotenv/config'
import workRouter from "./routes/work.route.js";
import userrouter from "./routes/user.route.js";
import testrouter from "./routes/test.route.js";
const app = express();


app.use(cors());
app.use(express.json());

app.use((req, _, next) => {
  console.log(`Incoming: ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/v1/auth', authrouter)
app.use('/api/v1/project', projectrouter)
app.use('/api/v1/work', workRouter)
app.use('/api/v1/user', userrouter)
app.use('/api/v1/test', testrouter)


export default app;