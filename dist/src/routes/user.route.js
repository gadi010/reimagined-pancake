import express from "express";
import { addUser, getUsersByProjectId, searchProjectUser } from "../controller/user.controller.js";
const userrouter = express.Router();
userrouter.post('/adduser', addUser);
userrouter.get('/:projectId', getUsersByProjectId);
userrouter.get('/:projectId/search', searchProjectUser);
export default userrouter;
