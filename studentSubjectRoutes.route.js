const express = require('express');
const router = express.Router();
const studentSubjectController = require('../controllers/studentSubjectController');

// Get all student_subjects
router.get('/', studentSubjectController.getAllStudentSubjects);

// Get a specific student_subject by id
router.get('/:id', studentSubjectController.getStudentSubjectById);

// Bulk add subjects to a student
router.post('/bulk', studentSubjectController.addSubjectsToStudent);

// Create a new student_subject
router.post('/', studentSubjectController.createStudentSubject);

// Update a student_subject (change subject_id for a student_subjects row by id)
router.put('/:id', studentSubjectController.updateStudentSubject);

// Delete a student_subject by id
router.delete('/:id', studentSubjectController.deleteStudentSubject);

module.exports = router;
