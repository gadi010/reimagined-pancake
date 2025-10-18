import express from 'express';
import { createWork, deleteWork, getWorks, getWorkStats, updateWork } from '../controller/work.controller.js';
import { projectMiddleware } from '../middleware/project.middleware.js';

const workRouter = express.Router();

workRouter.post('/:projectId/create-work',projectMiddleware, createWork);
workRouter.get('/:projectId', getWorks)
workRouter.get('/:projectId/stats-card', getWorkStats)
workRouter.patch('/:projectId/update-work/:workId', updateWork)
workRouter.delete('/:workId', deleteWork)

export default workRouter;