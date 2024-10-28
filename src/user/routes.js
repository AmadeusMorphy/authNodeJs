const { Router } = require('express');
const controller = require('./controller');
const authenticateToken = require('../../middleware/authenticateToken');

const router = Router();

router.post("/login", controller.loginUser); 
// router.get("/", controller.getUsers);
router.get("/key", controller.getUsersByKey);
router.post("/", controller.addUser);
router.get('/validate-token', authenticateToken, (req, res) => {
    res.status(200).json({ valid: true, user: req.user }); // Return valid status and user info
});
router.get('/:id', authenticateToken, controller.getUserById);
router.put('/:id', authenticateToken, controller.updateUser);
router.post("/add-friend/:id", controller.addFriendToUser);
router.delete("/:id", authenticateToken, controller.deleteUser);













// router.post("/", controller.addStudent);

module.exports = router;