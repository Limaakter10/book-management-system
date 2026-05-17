const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    if (file.mimetype === "application/pdf") {
      cb(null, "uploads/pdfs/");
    } else {
      cb(null, "uploads/covers/");
    }

  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

module.exports = upload;