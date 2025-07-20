const db = require('../config/db');

exports.getAllSubjects = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM subjects');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to retrieve subjects.' });
    }
};

exports.getSubjectById = async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query('SELECT * FROM subjects WHERE id = ?', [id]);
        if (results.length === 0) return res.status(404).json({ message: 'Subject not found' });
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to retrieve subject.' });
    }
};

exports.createSubject = async (req, res) => {
    const { subject_code, name, professor_id } = req.body;
    if (!subject_code || !name || !professor_id) {
        return res.status(400).json({ message: 'subject_code, name, and professor_id are required' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO subjects (subject_code, name, professor_id) VALUES (?, ?, ?)',
            [subject_code, name, professor_id]
        );
        res.status(201).json({ message: 'Subject created successfully.', id: result.insertId, subject_code, name, professor_id });
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to create subject.' });
    }
};

exports.updateSubject = async (req, res) => {
    const { id } = req.params;
    const { subject_code, name, professor_id } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE subjects SET subject_code = ?, name = ?, professor_id = ? WHERE id = ?',
            [subject_code, name, professor_id, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Subject not found' });
        res.json({ message: 'Subject updated successfully.', id, subject_code, name, professor_id });
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to update subject.' });
    }
};

exports.deleteSubject = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM subjects WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Subject not found' });
        res.json({ message: 'Subject deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to delete subject.' });
    }
};
