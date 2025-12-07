import { v2 as cloudinary } from "cloudinary";
import { ExternalServiceError } from "../utils/errorHandler.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {String} filePath - Local file path
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<Object>} - Upload result with URL and public_id
 */
export const uploadToCloudinary = async (filePath, folder = "task-manager") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto", // Automatically detect file type
      allowed_formats: ["jpg", "jpeg", "png", "pdf", "doc", "docx", "xls", "xlsx"],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new ExternalServiceError("Failed to upload file to cloud storage");
  }
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public_id
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    throw new ExternalServiceError("Failed to delete file from cloud storage");
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array} filePaths - Array of local file paths
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<Array>} - Array of upload results
 */
export const uploadMultipleToCloudinary = async (filePaths, folder = "task-manager") => {
  try {
    const uploadPromises = filePaths.map((filePath) =>
      uploadToCloudinary(filePath, folder)
    );
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error("Cloudinary multiple upload error:", error);
    throw new ExternalServiceError("Failed to upload files to cloud storage");
  }
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadMultipleToCloudinary,
};
