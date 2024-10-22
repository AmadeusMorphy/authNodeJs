const { Router } = require('express');
const controller = require('./controller');
const authenticateToken = require('../../middleware/authenticateToken');

const router = Router();

router.post("/login", controller.loginStudent); 
router.get("/", authenticateToken, controller.getStudents);
router.post("/", controller.addStudent);

router.get('/:id', authenticateToken, controller.getStudentById);
router.put('/:id', authenticateToken, controller.updateStudent);
router.delete("/:id", authenticateToken, controller.deleteStudent);













// router.post("/", controller.addStudent);

module.exports = router;