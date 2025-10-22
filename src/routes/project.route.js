
import express from 'express';
import { createProject, getActiveProjects, projectAnalytics } from '../controller/project.controller.js';
import { projectMiddleware } from '../middleware/project.middleware.js';

const projectrouter = express.Router();

projectrouter.post('/create-project/', projectMiddleware, createProject);
projectrouter.get('/active-projects/', projectMiddleware, getActiveProjects);
projectrouter.get('/analytics/:projectId', projectMiddleware, projectAnalytics);

export default projectrouter;
