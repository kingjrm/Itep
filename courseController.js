const db = require('../config/db');

// Get all courses
exports.getAllCourses = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM courses');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to retrieve courses.' });
    }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
        if (results.length === 0) return res.status(404).json({ message: 'Course not found' });
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to retrieve course.' });
    }
};

// Create a new course
exports.createCourse = async (req, res) => {
    const { course_code, name } = req.body;
    if (!course_code || !name) {
        return res.status(400).json({ message: 'course_code and name are required' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO courses (course_code, name) VALUES (?, ?)', 
            [course_code, name]
        );
        res.status(201).json({ message: 'Course created successfully.', id: result.insertId, course_code, name });
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to create course.' });
    }
};

// Update a course
exports.updateCourse = async (req, res) => {
    const { id } = req.params;
    const { course_code, name } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE courses SET course_code = ?, name = ? WHERE id = ?',
            [course_code, name, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Course not found' });
        res.json({ message: 'Course updated successfully.', id, course_code, name });
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to update course.' });
    }
};

// Delete a course
exports.deleteCourse = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM courses WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Course not found' });
        res.json({ message: 'Course deleted successfully.' });
    } catch (err) {
        // MySQL error code 1451: Cannot delete or update a parent row: a foreign key constraint fails
        if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
            return res.status(400).json({
                error: err.message,
                message: 'Cannot delete course: students are still enrolled in this course.'
            });
        }
        res.status(500).json({ error: err.message, message: 'Failed to delete course.' });
    }
};
