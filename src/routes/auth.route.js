import express from "express";
import { registerUser } from "../controller/auth.controllers.js";


const authrouter = express.Router();

authrouter.post("/register", registerUser)


export default authrouter;