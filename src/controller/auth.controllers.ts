import { getResponse } from "../lib/get-response.js";
import prisma from "../lib/prisma.js";
import { generateToken } from "../lib/jwt.js";
import { Request, Response } from "express";
import { IUserProfile } from "../types/common.js";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Missing code" });

    const { email, avatar, name, accessToken } = await getResponse(code);

    let user = await prisma.user.findUnique({
      where: { email },
      include: { providers: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          avatar,
          providers: {
            create: {
              name: "github",
              accessToken,
              email,
            },
          },
        },
        include: { providers: true },
      });
      console.log('|| New user created ||', user);
    } else {
      const hasGithubProvider = user.providers.some(p => p.name === "github");
      if (!hasGithubProvider) {
        const provider = await prisma.provider.create({
          data: {
            name: "github",
            accessToken,
            email,
            user: {
              connect: { id: user.id }
            },
          },
        });
        console.log('|| Provider added for existing user ||', provider);
      } else {
        const updatingProvider = await prisma.provider.update({
          where: {
            email: user.email
          },
          data: {
            accessToken
          }
        })

        console.log('|| Provider updated for existing user ||', updatingProvider);

      }
    }

    const access_token = generateToken({ userId: user.id, email: user.email });

    return res.json({
      access_token,
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};


export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user.userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatar: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const userProjects = await prisma.project.count({
      where: {
        members: { some: { userId } },
      },
    });

    const response: IUserProfile = {
      ...user,
      userProjects,
    };

    return res.json({ user: response });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
