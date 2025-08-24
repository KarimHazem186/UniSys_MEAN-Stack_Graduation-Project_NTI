const nodemailer = require('nodemailer');
const appError = require('./appError');
require('dotenv').config();

async function sendEmail(to,subject,html) {
    try {
        // Create transporter
        const transporter = nodemailer.createTransport({
            service:"gmail",
            auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.EMAIL_PASS,
            },
        });

        // Email options 
        const mailOptions = {
            from: `"The University Support" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        };

        // Send email 
        await transporter.sendMail(mailOptions)
        console.log("Email sent to:",to);
    } catch(error){
        console.error("Email sending failed:",error.message);
        // throw new Error("Failed to send email");
        appError.create("Failed to send email")
    }
}

module.exports = {sendEmail}