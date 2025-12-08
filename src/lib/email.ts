import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.EMAIL_PASS_KEY,
    },
    tls: {
        rejectUnauthorized: false // <--- This is the bypass
    }

});
export const sendEmail = async (to: string, subject: string, text: string) => {
    console.log(process.env.USER_EMAIL, process.env.EMAIL_PASS_KEY);

    const mailOptions = {
        from: process.env.USER_EMAIL,
        to,
        subject,
        html: text,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}