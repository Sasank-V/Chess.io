import nodemailer, { Transporter } from "nodemailer";
import { MailOptions } from "nodemailer/lib/sendmail-transport";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.email",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.MAILER_AUTH_USER,
    pass: process.env.MAILER_AUTH_PASS,
  },
});

export const getOTPMailOptions = (otp: string, recvEmail: string): MailOptions => {
  return {
    from: {
      name: "Chess.io Password Assistance",
      address: process.env.MAILER_AUTH_USER as string,
    },
    to: [recvEmail],
    subject: "Your OTP for Resetting Your Chess.io Account Password",
    text: "",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #333333; border-radius: 8px; background: linear-gradient(to bottom right, #1f2937, #374151); color: #e5e7eb;">
        <h2 style="color: #10b981; text-align: center;">Chess.io Account Assistance</h2>
        <p style="font-size: 16px; text-align: center;">
          You requested a One-Time Password (OTP) to reset your Chess.io account password.
        </p>
        <div style="margin: 20px auto; text-align: center;">
          <span style="font-size: 32px; font-weight: bold; color: #10b981; padding: 10px 20px; border: 2px solid #10b981; border-radius: 8px; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; text-align: center; color: #9ca3af;">
          If you did not request this OTP, please ignore this email or contact our support team immediately.
        </p>
        <p style="font-size: 14px; text-align: center; color: #9ca3af;">
          <strong>Note:</strong> This OTP will expire in 10 minutes.
        </p>
        <hr style="border: none; border-top: 1px solid #444444; margin: 20px 20px;">
        <p style="font-size: 12px; text-align: center; color: #6b7280;">
          © 2024 Chess.io. All rights reserved.
        </p>
      </div>
    `,
  };
};


export const getWelcomeMailOptions = (username: string, recvEmail: string) => {
  return {
    from: {
      name: "Welcome to Chess.io",
      address: process.env.MAILER_AUTH_USER as string,
    },
    to: [recvEmail],
    subject: "Enter into the world of Chess",
    text: "",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #333333; border-radius: 8px; background: linear-gradient(to bottom right, #1f2937, #374151); color: #e5e7eb;">
        <h2 style="color: #10b981; text-align: center;">Welcome to Chess.io, ${username}!</h2>
        <p style="font-size: 16px; text-align: center;">
          We are thrilled to have you join our community of chess enthusiasts! Chess.io offers the ultimate platform to play chess with friends while enjoying video and audio chat.
        </p>
        <div style="margin: 20px auto; text-align: center;">
          <img src="https://imgs.search.brave.com/q9K14zS4jzxWPtsUAFI2_cND1VQIeirLFa5ocNW5pHE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTU1/MzcxODg2L3Bob3Rv/L3doaXRlLWNoZXNz/LWtpbmctYW1vbmct/bHlpbmctZG93bi1i/bGFjay1wYXducy1v/bi1jaGVzc2JvYXJk/LmpwZz9zPTYxMng2/MTImdz0wJms9MjAm/Yz1pWG1rUzVuQ2Rx/STJVc2k2QVBuVUZ1/RnBwRXRUTGNyUHRK/VE13Y1d4dEM4PQ" alt="Welcome" style="max-width: 100%; border-radius: 8px;">
        </div>
        <p style="font-size: 16px; text-align: center; margin-top: 20px;">
          Dive into an exciting world of chess battles, improve your skills, and connect with others who share your passion.
        </p>
        <p style="font-size: 16px; text-align: center; margin-top: 20px;">
          <a href="https://chess-io-swart.vercel.app/" style="font-size: 16px; color: #ffffff; text-decoration: none; background-color: #10b981; padding: 10px 20px; border-radius: 8px; display: inline-block;">Start Playing Now</a>
        </p>
        <hr style="border: none; border-top: 1px solid #444444; margin: 20px 20px;">
        <p style="font-size: 14px; text-align: center;">
          If you have any questions or need assistance, feel free to reach out to our support team.
        </p>
        <p style="font-size: 12px; text-align: center;">
          © 2024 Chess.io. All rights reserved.
        </p>
      </div>
    `,
  };
};

export const sendMail = async (mailOptions:MailOptions) => {
    try{
        const info = await transporter.sendMail(mailOptions);
        console.log("Mail Sent");
    }catch(error){
        console.log("Error while sending email: ", error);
    }
};

// const options = getOTPMailOptions("123456","sasank.v.16@gmail.com");
// sendMail(options);

