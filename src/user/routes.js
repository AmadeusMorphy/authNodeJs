const { Router } = require('express');
const controller = require('./controller');
const authenticateToken = require('../../middleware/authenticateToken');

const router = Router();

router.post("/login", controller.loginUser); 
router.get("/", controller.getUsers);
router.post("/", controller.addUser);

router.get('/:id', authenticateToken, controller.getUserById);
router.put('/:id', authenticateToken, controller.updateUser);
router.delete("/:id", authenticateToken, controller.deleteUser);













// router.post("/", controller.addStudent);

module.exports = router;