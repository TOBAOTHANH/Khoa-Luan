const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables

const sendMail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMPT_HOST,
        port: process.env.SMPT_PORT,
        secure: process.env.SMPT_PORT == 465, // true for port 465, false for other ports
        auth: {
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.SMPT_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || options.message,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email đã được gửi thành công");
    } catch (error) {
        console.error("Lỗi gửi email:", error);
    }
};

module.exports = sendMail;