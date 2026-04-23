const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const {cloud_name , api_key , api_secret} = require("../config").getConfig().cloudinary;

// Cloudinary config
cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
});

// Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => ({
    folder: "spacelens/zones",
    allowed_formats: ["jpg", "jpeg", "png"],
    public_id: `zone_${Date.now()}`,
  }),
});

const upload = multer({ storage });

// Upload single file
const mwHandleUploadSingle = (req, res, next) => {

  upload.single("url_img")(req, res, (err) => {
    if (err) {
      req.messageErrorUpload = err.message;
      return next();
    }
    if (req.file) {
      req.body.urlImg = req.file.path; 
    }else{
      req.body.urlImg = req.body.urlImg || null;
    }
    next();
  });
};

module.exports = { mwHandleUploadSingle };
