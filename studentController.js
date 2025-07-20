const db = require('../config/db');

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM students');
        // Optionally, you can join courses to show course info, but for now just return as is
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query('SELECT * FROM students WHERE id = ?', [id]);
        if (results.length === 0) return res.status(404).json({ message: 'Student not found' });
        // If course_id is null, return course as null
        const student = results[0];
        if (student.course_id === null) {
            student.course = null;
        }
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to retrieve student.' });
    }
};

// Create a new student
exports.createStudent = async (req, res) => {
    const { student_id, name, course_id } = req.body;
    if (!student_id || !name) {
        return res.status(400).json({ message: 'student_id and name are required' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO students (student_id, name, course_id) VALUES (?, ?, ?)',
            [student_id, name, course_id || null]
        );
        res.status(201).json({ message: 'Student created successfully.', id: result.insertId, student_id, name, course_id: course_id || null });
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to create student.' });
    }
};

// Update a student
exports.updateStudent = async (req, res) => {
    const { id } = req.params;
    const { student_id, name, course_id } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE students SET student_id = ?, name = ?, course_id = ? WHERE id = ?',
            [student_id, name, course_id || null, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Student not found' });
        res.json({ message: 'Student updated successfully.', id, student_id, name, course_id: course_id || null });
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to update student.' });
    }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM students WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Student not found' });
        res.json({ message: 'Student deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to delete student.' });
    }
};
