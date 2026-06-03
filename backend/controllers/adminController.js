import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";

const addDoctor = async (req, res) => {
  try {
    console.log("FILES =>", req.files);
    console.log("BODY =>", req.body);

    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;

    const imageFile = req.files?.[0];

    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res.json({
        success: false,
        message: "Missing Details",
      });
    }

    if (!imageFile) {
      return res.json({
        success: false,
        message: "Please upload doctor image",
      });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Debugging
    console.log("IMAGE FILE =>", imageFile);
    console.log("IMAGE PATH =>", imageFile.path);
    console.log("STARTING CLOUDINARY UPLOAD...");

    const imageUpload = await cloudinary.uploader.upload(
  imageFile.path,
  {
    folder: "doctors",
    resource_type: "image"
  }
);
    console.log("CLOUDINARY RESPONSE =>", imageUpload);

    const imageUrl = imageUpload.secure_url;

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorData);

    await newDoctor.save();

    res.json({
      success: true,
      message: "Doctor Added Successfully",
    });

  } catch (error) {
    console.error("FULL ERROR =>", error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

export { addDoctor };