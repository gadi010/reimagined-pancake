
import express from 'express';
import { createProject, getActiveProjects, getProjectsNearDeadline, getProjectsProgress, projectAnalytics } from '../controller/project.controller.js';
import { projectMiddleware } from '../middleware/project.middleware.js';

const projectrouter = express.Router();

projectrouter.post('/create-project/', projectMiddleware, createProject);
projectrouter.get('/active-projects/', projectMiddleware, getActiveProjects);
projectrouter.get('/analytics/:projectId', projectMiddleware, projectAnalytics);
projectrouter.get('/project-progress', projectMiddleware, getProjectsProgress);
projectrouter.get('/project-deadline', projectMiddleware, getProjectsNearDeadline);

export default projectrouter;
