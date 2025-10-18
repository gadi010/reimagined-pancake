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
