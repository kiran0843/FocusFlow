const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Multer config for avatar upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, req.user._id + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|png|gif|webp)/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  }
});

// Avatar upload endpoint
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();
    res.json({ success: true, avatarUrl: user.avatar });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

module.exports = router;
