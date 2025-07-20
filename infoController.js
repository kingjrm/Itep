const db = require('../config/db'); // Add this if not already present


// Get all data for all students, their courses, professors, and subjects
exports.getAllStudentsFullInfo = async (req, res) => {
    const sql = `
        SELECT 
            s.id AS student_id,
            s.student_id AS student_number,
            s.name AS student_name,
            c.id AS course_id,
            c.course_code,
            c.name AS course_name,
            subj.id AS subject_id,
            subj.subject_code,
            subj.name AS subject_name,
            p.id AS professor_id,
            p.name AS professor_name
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN student_subjects ss ON ss.student_id = s.id
        LEFT JOIN subjects subj ON subj.id = ss.subject_id
        LEFT JOIN professors p ON subj.professor_id = p.id
        ORDER BY s.id
    `;
    try {
        const [results] = await db.query(sql);
        if (!results || results.length === 0) return res.status(404).json({ message: 'No students found' });

        // Group by student
        const studentsMap = {};
        results.forEach(row => {
            if (!studentsMap[row.student_id]) {
                studentsMap[row.student_id] = {
                    id: row.student_id,
                    student_number: row.student_number,
                    name: row.student_name,
                    course: row.course_id ? {
                        id: row.course_id,
                        course_code: row.course_code,
                        name: row.course_name
                    } : null,
                    subjects: []
                };
            }
            if (row.subject_id && row.subject_code && row.subject_name) {
                studentsMap[row.student_id].subjects.push({
                    id: row.subject_id,
                    subject_code: row.subject_code,
                    name: row.subject_name,
                    professor: row.professor_id && row.professor_name ? {
                        id: row.professor_id,
                        name: row.professor_name
                    } : null
                });
            }
        });

        res.json(Object.values(studentsMap));
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to retrieve students info.' });
    }
};

// Get all data from a student, his course, and all the subjects he's taking (with professor per subject)
exports.getStudentFullInfo = async (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT 
            s.id AS student_id,
            s.student_id AS student_number,
            s.name AS student_name,
            c.id AS course_id,
            c.course_code,
            c.name AS course_name,
            subj.id AS subject_id,
            subj.subject_code,
            subj.name AS subject_name,
            p.id AS professor_id,
            p.name AS professor_name
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN student_subjects ss ON ss.student_id = s.id
        LEFT JOIN subjects subj ON subj.id = ss.subject_id
        LEFT JOIN professors p ON subj.professor_id = p.id
        WHERE s.id = ?
    `;
    try {
        const [results] = await db.query(sql, [id]);
        if (!results || results.length === 0) return res.status(404).json({ message: 'Student not found' });

        // Build the response object
        const student = {
            id: results[0].student_id,
            student_number: results[0].student_number,
            name: results[0].student_name,
            course: results[0].course_id ? {
                id: results[0].course_id,
                course_code: results[0].course_code,
                name: results[0].course_name
            } : null,
            subjects: []
        };

        results.forEach(row => {
            if (row.subject_id && row.subject_code && row.subject_name) {
                student.subjects.push({
                    id: row.subject_id,
                    subject_code: row.subject_code,
                    name: row.subject_name,
                    professor: row.professor_id && row.professor_name ? {
                        id: row.professor_id,
                        name: row.professor_name
                    } : null
                });
            }
        });

        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to retrieve student info.' });
    }
};

exports.studentView = async (req, res) => {
  const { id, subjects } = req.body; // ✅ get 'id' instead of 'student_id'

  try {
    // Get student basic info
    const [student] = await db.query('SELECT * FROM students WHERE id = ?', [id]);
    if (!student || student.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get student's course
    const [course] = await db.query('SELECT * FROM courses WHERE id = ?', [student[0].course_id]);

    // Get subject IDs the student is actually enrolled in
    const [enrolledSubjects] = await db.query(
      'SELECT subject_id FROM student_subjects WHERE student_id = ?',
      [id]
    );
    const enrolledSubjectIds = enrolledSubjects.map(row => row.subject_id);

    // Filter requested subjects to those the student is enrolled in
    const validSubjectIds = subjects.filter(subId => enrolledSubjectIds.includes(subId));
    const invalidSubjectIds = subjects.filter(subId => !enrolledSubjectIds.includes(subId));

    let fullSubjects = [];

    if (validSubjectIds.length > 0) {
      const placeholders = validSubjectIds.map(() => '?').join(',');
      const [subjectList] = await db.query(`
        SELECT s.id, s.subject_code, s.name, 
               p.id AS professor_id, p.name AS professor_name
        FROM subjects s
        JOIN professors p ON s.professor_id = p.id
        WHERE s.id IN (${placeholders})
      `, validSubjectIds);

      fullSubjects = subjectList.map(sub => ({
        id: sub.id,
        subject_code: sub.subject_code,
        name: sub.name,
        professor: {
          id: sub.professor_id,
          name: sub.professor_name
        }
      }));
    }

    // Add messages for subjects the student is not enrolled in
    invalidSubjectIds.forEach(subId => {
      fullSubjects.push({
        id: subId,
        message: 'Student is not enrolled to this subject'
      });
    });

    res.json({
      id: student[0].id,
      student_number: student[0].student_id,
      name: student[0].name,
      course: {
        id: course[0].id,
        course_code: course[0].course_code,
        name: course[0].name
      },
      subjects: fullSubjects
    });
  } catch (err) {
    res.status(500).json({ error: err.message, message: 'Failed to retrieve student view.' });
  }
};

// Update student info (basic info only)
exports.updateStudentInfo = async (req, res) => {
    const { id } = req.params;
    const { student_id, name, course_id } = req.body;
    if (!student_id || !name || !course_id) {
        return res.status(400).json({ message: 'student_id, name, and course_id are required' });
    }
    try {
        const [result] = await db.query(
            'UPDATE students SET student_id = ?, name = ?, course_id = ? WHERE id = ?',
            [student_id, name, course_id, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Student not found' });
        res.json({ message: 'Student info updated successfully.', id, student_id, name, course_id });
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to update student info.' });
    }
};

// Delete student info
exports.deleteStudentInfo = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM students WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Student not found' });
        res.json({ message: 'Student deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message, message: 'Failed to delete student.' });
    }
};
