import Company from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const registerCompany = async (req, res) => {
  try {
    const { companyName } = req.body;
    if (!companyName) {
      return res
        .status(400)
        .json({ message: "Company name is required.", success: false });
    }

    let company = await Company.findOne({ companyName });
    if (company) {
      return res
        .status(400)
        .json({ message: "Company already exists", success: false });
    }

    company = await Company.create({
      companyName,
      userId: req.id,
    });

    return res.status(201).json({
      message: "Company registered successfully",
      success: true,
      company,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const getCompany = async (req, res) => {
  try {
      const userId = req.id; // logged in user id
      const companies = await Company.find({ userId });
      if (!companies) {
          return res.status(404).json({
              message: "Companies not found.",
              success: false
          })
      }
      return res.status(200).json({
          companies,
          success:true
      })
  } catch (error) {
      console.log(error);
  }
}

export const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await Company.findById(companyId);
    if (!company) {
      return res
        .status(404)
        .json({ message: "Company not found", success: false });
    }

    return res.status(200).json({ company, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { companyName, description, website, location } = req.body;
    const file = req.file;  

    let logo = null;
    if (file) {
      const fileUri = getDataUri(file);
      const cloudinaryResponse = await cloudinary.uploader.upload(fileUri.content);
      logo = cloudinaryResponse.secure_url;
    }

    const updateData = { companyName, description, website, location };
    
    if (logo) {
      updateData.logo = logo;
    }

    const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!company) {
      return res.status(404).json({ message: "Company not found", success: false });
    }

    return res.status(200).json({
      message: "Company updated successfully",
      success: true,
      company,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
