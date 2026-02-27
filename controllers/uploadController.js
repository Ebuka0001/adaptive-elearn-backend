// controllers/uploadController.js
const Lesson = require('../models/Lesson');
const path = require('path');

// POST /api/upload/lesson/:lessonId
exports.uploadLessonFile = async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // req.file is populated by multer
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Construct URL (assuming server serves static files from /uploads)
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    // Add file info to lesson.files
    lesson.files.push({
      filename: req.file.originalname,
      url: fileUrl
    });

    await lesson.save();

    res.json({
      message: 'File uploaded successfully',
      file: lesson.files[lesson.files.length - 1]
    });
  } catch (err) {
    console.error('uploadLessonFile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};