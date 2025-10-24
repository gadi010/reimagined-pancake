import express from 'express';
import { createGithubRepo, getGithubRepo } from '../controller/github.controller.js';
import { projectMiddleware } from '../middleware/project.middleware.js';

const githubRouter = express.Router();

githubRouter.get('/repo', projectMiddleware ,getGithubRepo)
githubRouter.post('/repo/:projectId', projectMiddleware , createGithubRepo);

export default githubRouter;