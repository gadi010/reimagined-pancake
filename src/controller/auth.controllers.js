import { getResponse } from "../lib/get-response.js";
import prisma from "../lib/prisma.js";
import { generateToken } from "../lib/jwt.js";

export const registerUser = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) return res.status(400).json({ error: "Missing code" });

    const { email, avatar, name } = await getResponse(code);

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          avatar,
        },
      });
    }

    const access_token = generateToken({ userId: user.id, email: user.email });

    return res.json({ access_token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};


export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatar: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    const userProjects = await prisma.project.count({
      where: {
        members: {
          some: { userId: userId },
        }
      },
    });
    user.userProjects = userProjects;
    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};