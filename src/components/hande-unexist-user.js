import { invitationEmailHTML } from "../email/user-email-constant.js";
import { generateToken } from "../lib/jwt.js"

export const userDoenstExist = async (email, projectId, role) => {
    const encrypted = generateToken({ email, projectId, role });

    const link = `app.${process.env.CLIENT_URL}/sign-in?invite=${encrypted}`;

    const htmlContent = invitationEmailHTML(link, email);

    const { sendEmail } = await import("../lib/email.js");
    await sendEmail(email, "You're Invited to Join Our Project Platform!", htmlContent);
}