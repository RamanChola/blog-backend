var express = require('express')
var router = express.Router()
const usersController = require("../controllers/users-controllers")
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth")
router.get("/",usersController.getUsers)
router.get("/:uid", usersController.getUserById)
router.post("/signup",usersController.signup)
router.post("/login",usersController.login)
router.use(checkAuth);
router.patch("/:uid", fileUpload.single("profilepic"), usersController.profilePhoto);

module.exports = router;