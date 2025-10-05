const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round.apply(Math.random() * 1e9);
        const filename = file.originalname.split(' .'[0]);
        cb(null, filename + "-" + uniqueSuffix + ".png");
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Giới hạn 50MB
  });
exports.upload = multer({ storage: storage });