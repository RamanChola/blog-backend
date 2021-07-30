const User = require("../models/User");
const Post = require("../models/Post");
const mongoose = require("mongoose");
const { uploadFile, deleteFile } = require("../s3");
const fs = require("fs");
const getPosts = async (req, res) => {
  let posts;
  try {
    posts = await Post.find({});
  } catch (err) {
    res.status(500).json("Fetching posts failed, please try again");
  }
  res.json({ posts: posts.map((post) => post) });
};

const getPostsByUserId = async (req, res) => {
  let posts;
  let creatorId = req.params.uid;
  try {
    posts = await Post.find({ creator: creatorId });
  } catch (error) {
    res.status(500).json("Fetching posts failed, please try again");
  }
  res.status(200).json(posts);
};

const getPostByPostId = async (req, res) => {
  let post;
  let postId = req.params.pid;
  try {
    post = await Post.findById(postId);
  } catch (error) {
    res.status(500).json("Fetching posts failed, please try again");
  }
  res.status(200).json(post);
};

const createPost = async (req, res) => {
  const { title, content } = req.body;
  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    return res.status("500").json(err);
  }
  if (!user) {
    return res.status("404").json("Could not find user for provided id");
  }
  if (req.file) {
    try {
      await uploadFile(req.file);
      fs.unlink(req.file.path, (err) => {
        console.log(err);
      });
    } catch (error) {
      console.log(error);
    }
  }

  const post = new Post({
    title,
    content,
    image: req.file.filename,
    creator: req.userData.userId,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await post.save({ session: sess });
    user.blogs.push(post);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return console.log(err);
  }
  return res.status(201).json({ post });
};

const updatePost = async (req, res) => {
  let postId = req.params.pid;
  const { title, content } = req.body;
  let post;
  try {
    post = await Post.findById(postId);
  } catch (error) {
    res.status(500).json(error);
  }
  if (!post) {
    return res.status(404).json("Could not find post!");
  }

  if (post.creator.toString() !== req.userData.userId) {
    return res.status(401).json("You are not authorized to edit this place");
  }

  post.title = title;
  post.content = content;
  try {
    post.save();
  } catch (error) {
    res.status(500).json(error);
  }
  res.status(200).json({ post });
};

const deletePost = async (req, res) => {
  let postId = req.params.pid;
  let post;
  try {
    post = await Post.findById(postId).populate("creator");
  } catch (error) {
    res.status(500).json(error);
  }
  if (!post) {
    return res.status(404).json("Could not find post!");
  }
  if (post.creator.id !== req.userData.userId) {
    return res.status(401).json("You are not authorized to delete this place");
  }
  try {
    await deleteFile(post.image);
  } catch (error) {
    console.log(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await post.deleteOne({ session: sess });
    post.creator.blogs.pull(postId);
    await post.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    return res.status(500).json(error);
  }
  res.status(200).json("deleted place");
};

exports.createPost = createPost;
exports.getPosts = getPosts;
exports.getPostsByUserId = getPostsByUserId;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
exports.getPostByPostId = getPostByPostId;
