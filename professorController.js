const db = require('../config/db'); // Corrected path to db.js

exports.getAllProfessors = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM professors');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to retrieve professors.' });
    }
};

exports.getProfessorById = async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query('SELECT * FROM professors WHERE id = ?', [id]);
        if (results.length === 0) return res.status(404).json({ message: 'Professor not found' });
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to retrieve professor.' });
    }
};

exports.createProfessor = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    try {
        const [result] = await db.query('INSERT INTO professors (name) VALUES (?)', [name]);
        res.status(201).json({ message: 'Professor created successfully.', id: result.insertId, name });
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to create professor.' });
    }
};

exports.updateProfessor = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const [result] = await db.query('UPDATE professors SET name = ? WHERE id = ?', [name, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Professor not found' });
        res.json({ message: 'Professor updated successfully.', id, name });
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to update professor.' });
    }
};

exports.deleteProfessor = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM professors WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Professor not found' });
        res.json({ message: 'Professor deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to delete professor.' });
    }
};
