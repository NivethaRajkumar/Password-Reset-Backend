import User from "../Models/userSchema.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import randomstring from "randomstring";
dotenv.config();

// console.log("PASSMAIL:", process.env.PASSMAIL);
// console.log("PASSKEY:", process.env.PASSKEY);

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existuser = await User.findOne({ email });
    if (!existuser) {
      const hashPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, email, password: hashPassword });
      await newUser.save();
      res.status(200).json({ message: "User registered Successfully", result: newUser });
    } else {
      res.status(500).json({ message: "Email already exists" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Registration Failed Internal server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userDetail = await User.findOne({ email });
    if (!userDetail) {
      return res.status(401).json({ message: "User not found" });
    }
    const passwordMatch = await bcrypt.compare(password, userDetail.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    res.status(200).json({ message: "User Logged in Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Login Failed Internal server error" });
  }
};

export const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;
    const userinfo = await User.findOne({ email });
    if (!userinfo) {
      return res.status(401).json({ message: "User not found" });
    }
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.PASSMAIL,
        pass: process.env.PASSKEY,
      },
      logger: true,
      debug: true,
    });
    const ranstring = randomstring.generate();
    userinfo.randomstring = ranstring;
    await userinfo.save();
    const mailOptions = {
      from: process.env.PASSMAIL,
      to: userinfo.email,
      subject: "Password Reset",
      html: `
              <p>Dear ${userinfo.username}</p>
              <p>We received a request to reset your password. 
              <p>Please click the following link to reset your password:</p>
              <a href="https://reset-password-randomstring.netlify.app/resetpassword/${ranstring}">Reset Password</a>
              <p>If you did not make this request, please ignore this email.</p>
              <p>Thank you,</p>
              <p>From Validation</p>
            `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error in forgot password" });
  }
};

export const checkrandomstring = async (req, res) => {
  try {
    const randomstring = req.params.str;
    console.log(randomstring);
    const userres = await User.findOne({ randomstring });
    console.log(userres);

    if (userres) {
      const checkstr = userres.randomstring;
      console.log(checkstr);
      if (randomstring == checkstr) {
        res.status(200).json({ message: "", result: userres });
      } else {
        res.status(404).json({ message: "Kindly provide correct link" });
      }
    } else {
      res.status(404).json({ message: "Already used the link." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error in checkpassword" });
  }
};

export const resetpassword = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const resetuser = await User.findOne({ email });
    const hashnewPassword = await bcrypt.hash(password, 10);
    const results = await User.updateOne({ email: email }, { username, email, password: hashnewPassword, randomstring: '' });
    if (results.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const updateduser = await User.find({ email });
    res.status(200).json({ message: "Password updated successfully", result: updateduser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error in resetpassword" });
  }
};