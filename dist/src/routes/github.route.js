import express from 'express';
import { createGithubRepo, getGithubRepo, handleWebhook } from '../controller/github.controller.js';
import { projectMiddleware } from '../middleware/project.middleware.js';
const githubRouter = express.Router();
githubRouter.get('/repo', projectMiddleware, getGithubRepo);
githubRouter.post('/repo/:projectId', projectMiddleware, createGithubRepo);
githubRouter.post('/webhook', projectMiddleware, handleWebhook);
export default githubRouter;
