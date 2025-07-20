const db = require('../config/db');

// Get all student_subjects
exports.getAllStudentSubjects = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM student_subjects');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to retrieve student_subjects.' });
    }
};

// Get a student_subject by id
exports.getStudentSubjectById = async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query('SELECT * FROM student_subjects WHERE id = ?', [id]);
        if (results.length === 0) return res.status(404).json({ message: 'Student_subject not found' });
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to retrieve student_subject.' });
    }
};

// Create a new student_subject (accepts single subject_id or array)
exports.createStudentSubject = async (req, res) => {
    const { student_id, subject_id } = req.body;
    if (!student_id || (!subject_id && subject_id !== 0)) {
        return res.status(400).json({ message: 'student_id and subject_id are required' });
    }
    // If subject_id is an array, do bulk insert
    if (Array.isArray(subject_id)) {
        if (subject_id.length === 0) {
            return res.status(400).json({ message: 'subject_id[] cannot be empty' });
        }
        const values = subject_id.map(id => [student_id, id || null]);
        try {
            const [result] = await db.query(
                'INSERT INTO student_subjects (student_id, subject_id) VALUES ?',
                [values]
            );
            return res.status(201).json({ message: 'Subjects added', inserted: result.affectedRows });
        } catch (err) {
            return res.status(500).json({ error: err.message, message: 'Failed to create student_subject.' });
        }
    }
    // Otherwise, insert a single row
    try {
        const [result] = await db.query(
            'INSERT INTO student_subjects (student_id, subject_id) VALUES (?, ?)',
            [student_id, subject_id || null]
        );
        res.status(201).json({ message: 'Student_subject created successfully.', id: result.insertId, student_id, subject_id: subject_id || null });
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to create student_subject.' });
    }
};

// Update a student_subject (change subject_id for a student_subjects row by id)
exports.updateStudentSubject = async (req, res) => {
    const { id } = req.params;
    const { subject_id } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE student_subjects SET subject_id = ? WHERE id = ?',
            [subject_id || null, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Student_subject not found' });
        res.json({ message: 'Student_subject updated successfully.', id, subject_id: subject_id || null });
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to update student_subject.' });
    }
};

// Delete a student_subject by id
exports.deleteStudentSubject = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM student_subjects WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Student_subject not found' });
        res.json({ message: 'Student_subject deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to delete student_subject.' });
    }
};

// Bulk add subjects to a student
exports.addSubjectsToStudent = async (req, res) => {
    const { student_id, subject_id } = req.body;
    if (!student_id || !Array.isArray(subject_id)) {
        return res.status(400).json({ error: 'student_id and subject_id[] are required' });
    }
    if (subject_id.length === 0) {
        return res.status(400).json({ error: 'subject_id[] cannot be empty' });
    }
    const values = subject_id.map(id => [student_id, id || null]);
    try {
        const [result] = await db.query(
            'INSERT INTO student_subjects (student_id, subject_id) VALUES ?',
            [values]
        );
        res.status(201).json({ message: 'Subjects added', inserted: result.affectedRows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
