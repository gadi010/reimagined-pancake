
import express from 'express';
import { createProject, getActiveProjects } from '../controller/project.controller.js';
import { projectMiddleware } from '../middleware/project.middleware.js';

const projectrouter = express.Router();

projectrouter.post('/create-project/', projectMiddleware, createProject);
projectrouter.get('/active-projects/', projectMiddleware, getActiveProjects);


export default projectrouter;
