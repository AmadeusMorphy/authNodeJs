const getStudents = "SELECT * FROM students";
const addStudent = "INSERT INTO students (name, email, age, dob, password) VALUES ($1, $2, $3, $4, $5)";
const getStudentById = "SELECT * FROM students WHERE id = $1";
const checkEmailExists = "SELECT s FROM students s WHERE s.email = $1";
const updateStudent = "UPDATE students SET name = $1, email = $2 WHERE id = $3";
const deleteStudent = "DELETE FROM students WHERE id = $1";
const getStudentByEmail = "SELECT * FROM students WHERE email = $1";


module.exports = {
    getStudents,
    addStudent,
    getStudentById,
    checkEmailExists,
    updateStudent,
    getStudentByEmail,
    deleteStudent,
};