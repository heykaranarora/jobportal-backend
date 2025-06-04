import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';
import { User } from '../models/user.model.js';
import Company from '../models/company.model.js';
import nodemailer from 'nodemailer';
import {Job} from '../models/job.model.js';
import Application from '../models/application.model.js';

let otpCache = {}; 
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender's email
    to: email, 
    subject: 'Your OTP for Admin Login',
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending OTP email:', error);
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000); 

    otpCache[admin._id] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    const email = process.env.adminemail;
    await sendOtpEmail(email, otp);
    const tokenData = { id: admin._id };
    const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

    return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' }).json({
      message: `Welcome back ${admin.username}`,
      admin,
      success: true,
  });
  } catch (error) {
    console.error("Error during admin login:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body; 

    const admin = await Admin.findOne({}); 
    if (!admin) {
      return res.status(400).json({ message: 'Admin not found' });
    }

    const otpRecord = otpCache[admin._id];

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP not generated or expired.' });
    }


    if (Date.now() > otpRecord.expiresAt) {
      delete otpCache[admin._id]; 
      return res.status(400).json({ message: 'OTP expired.' });
    }

    if (String(otpRecord.otp) === String(otp)) {
      delete otpCache[admin._id]; 

      const tokenData = { id: admin._id };
      const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

      return res.status(200).cookie('token', token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' }).json({
        message: 'OTP verified successfully. Welcome back!',
        success: true,
      });
    } else {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}); 
    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Admin Logout Route
export const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0, httpOnly: true }).json({
      message: "Logged out successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({
      message: "Logout failed.",
      success: false,
      error: error.message
    });
  }
};

// Delete User Route
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Block User Route
export const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndUpdate(id, { Blocked: true });
    res.status(200).json({ success: true, message: 'User blocked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Unblock User Route
export const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndUpdate(id, { Blocked: false });
    res.status(200).json({ success: true, message: 'User unblocked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get All Companies Route
export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json({ success: true, companies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const jobs = await Job.find({ company: id });

    for (const job of jobs) {
      await Application.deleteMany({ job: job._id });
    }

    const result = await Job.deleteMany({ company: id });

    await Company.findByIdAndDelete(id);

    res.status(200).json({ 
      success: true, 
      message: `Company, ${result.deletedCount} job(s), and all associated applications have been deleted successfully` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};





export const loginData= async (req, res) => {
  try {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10); // Get date 10 days ago

    // Fetch counts for students and recruiters who logged in during the last 10 days
    const [studentCount, recruiterCount] = await Promise.all([
      User.countDocuments({
        role: 'student',
        lastLogin: { $gte: tenDaysAgo }, // Filter for lastLogin within the last 10 days
      }),
      User.countDocuments({
        role: 'recruiter',
        lastLogin: { $gte: tenDaysAgo }, // Filter for lastLogin within the last 10 days
      }),
    ]);

    // Respond with the counts
    res.status(200).json({
      success: true,
      message: 'Count of users logged in the last 10 days',
      data: {
        studentCount,
        recruiterCount,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user counts',
      error: error.message,
    });
  }
};
  