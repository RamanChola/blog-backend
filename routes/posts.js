var express = require("express");
var router = express.Router();
const postsController = require("../controllers/posts-controllers");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth")
router.get("/", postsController.getPosts);
router.get("/user/:uid", postsController.getPostsByUserId);
router.get("/:pid", postsController.getPostByPostId)
router.use(checkAuth);
router.post("/", fileUpload.single("image"), postsController.createPost);
router.patch("/:pid", postsController.updatePost);
router.delete("/:pid", postsController.deletePost);
module.exports = router;
