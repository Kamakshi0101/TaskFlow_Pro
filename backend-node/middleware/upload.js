import multer from "multer";
import path from "path";
import fs from "fs";
import { ValidationError } from "../utils/errorHandler.js";
import { FILE_UPLOAD } from "../constants/index.js";
import { uploadToCloudinary, uploadMultipleToCloudinary } from "../services/cloudinaryService.js";

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (FILE_UPLOAD.ALLOWED_FORMATS.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new ValidationError(
        `Invalid file format. Allowed formats: ${FILE_UPLOAD.ALLOWED_FORMATS.join(", ")}`
      ),
      false
    );
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_UPLOAD.MAX_FILE_SIZE,
  },
});

// Middleware to upload single file and move to Cloudinary
export const uploadSingle = [
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return next();
      }

      // Upload to Cloudinary
      const result = await uploadToCloudinary(req.file.path, "task-attachments");
      
      // Update file object with Cloudinary data
      req.file.path = result.secure_url;
      req.file.cloudinaryId = result.public_id;

      // Delete local file
      fs.unlinkSync(req.file.destination + req.file.filename);

      next();
    } catch (error) {
      // Clean up local file on error
      if (req.file) {
        try {
          fs.unlinkSync(req.file.destination + req.file.filename);
        } catch (unlinkError) {
          console.error("Error deleting temp file:", unlinkError);
        }
      }
      next(error);
    }
  },
];

// Middleware to upload multiple files and move to Cloudinary
export const uploadMultiple = [
  upload.array("files", 5),
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return next();
      }

      // Upload all files to Cloudinary
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.path, "task-attachments")
      );
      
      const results = await Promise.all(uploadPromises);

      // Update files array with Cloudinary data
      req.files = req.files.map((file, index) => ({
        ...file,
        path: results[index].secure_url,
        cloudinaryId: results[index].public_id,
      }));

      // Delete local files
      req.files.forEach((file) => {
        try {
          fs.unlinkSync(file.destination + file.filename);
        } catch (error) {
          console.error("Error deleting temp file:", error);
        }
      });

      next();
    } catch (error) {
      // Clean up local files on error
      if (req.files) {
        req.files.forEach((file) => {
          try {
            fs.unlinkSync(file.destination + file.filename);
          } catch (unlinkError) {
            console.error("Error deleting temp file:", unlinkError);
          }
        });
      }
      next(error);
    }
  },
];

export default { uploadSingle, uploadMultiple };
