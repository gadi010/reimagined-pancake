import express from "express";
import { getProfile, registerUser } from "../controller/auth.controllers.js";
import { projectMiddleware } from "../middleware/project.middleware.js";


const authrouter = express.Router();

authrouter.post("/register", registerUser)
authrouter.get("/profile", projectMiddleware, getProfile);

export default authrouter;