const express = require('express');
const router = express.Router();
const infoController = require('../controllers/infoController');

// Get full info for all students
router.get('/', infoController.getAllStudentsFullInfo);

// Get full info for a student (course, professor, subjects)
router.get('/:id', infoController.getStudentFullInfo);

// Student view (custom POST)
router.post('/:id', infoController.studentView);

// Update student info
router.put('/:id', infoController.updateStudentInfo);

// Delete student info
router.delete('/:id', infoController.deleteStudentInfo);

module.exports = router;