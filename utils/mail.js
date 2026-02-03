import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

export const sendOtpMail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject: "Your One-Time Password (OTP)",
    html: `

<h3>Hi there,</h3>

<h3>Your one-time password (OTP) is:</h3>

<b>${otp}</b>

<p>This code will expire in 5 minutes. Please do not share this with anyone.</p><br>

<p>If you didn't request this code, you can safely ignore this email.</p><br>

<p>Thanks,</p><br>
<p>The  Team</p>`
  })
}