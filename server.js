const express = require('express');
const dotenv = require('dotenv');
// const studentRoutes = require('./routes/studentRoutes.route');
// const coursesRoutes = require('./routes/coursesRoutes.route');
// const studentswithcoursesRoutes = require('./routes/studentswithcoursesRoutes.route');
const professorRoutes = require('./routes/professorRoutes.route');
const subjectRoutes = require('./routes/subjectRoutes.route');
const courseRoutes = require('./routes/courseRoutes.route');
const studentRoutes = require('./routes/studentRoutes.route');
const studentSubjectRoutes = require('./routes/studentSubjectRoutes.route');
const infoRoutes = require('./routes/infoRoutes.route');

dotenv.config();
const app = express();

app.use(express.json());

app.get('/' , (req,res) => {
    res.send ('API is Working')
});

app.use('/students', studentRoutes);
// app.use('/api/courses', coursesRoutes);
// app.use('/api/info', studentswithcoursesRoutes);
app.use('/professors', professorRoutes);
app.use('/subjects', subjectRoutes);
app.use('/courses', courseRoutes);
app.use('/studentSubjects', studentSubjectRoutes);
app.use('/studentsinfo', infoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`Server running at http://localhost:${PORT}`);
});
