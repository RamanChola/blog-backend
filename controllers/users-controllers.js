const bcrypt = require("bcrypt");
const User = require("../models/User");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { uploadFile, deleteFile } = require("../s3");
const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    res.status(500).json("Fetching users failed, please try again");
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const getUserById = async (req, res) => {
  let user;
  let userId = req.params.uid;
  try {
    user = await User.findById(userId, "-password");
  } catch (err) {
    res.status(500).json("Fetching user failed, please try again");
  }
  res.status(200).json(user);
};
const profilePhoto = async (req, res) => {
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    return res.status("500").json(err);
  }

  if (userId !== req.userData.userId) {
    return res.status(401).json("You are not authorized to change picture");
  }

  if (!user) {
    return res.status("404").json("Could not find user for provided id");
  }
  // deletes the old profile pic
  console.log(user.profilePic);
  if (user.profilePic !== "") {
    const pic = user.profilePic;
    try {
      await deleteFile(pic);
    } catch (error) {
      console.log(error);
    }
  }

  // sets new profile pic
  if (req.file) {
    try {
      const result = await uploadFile(req.file);
      user.profilePic = result.Key;
      // important to delete from our server as we are hosting on amazon
      fs.unlink(req.file.path, (err) => {
        console.log(err);
      });
    } catch (error) {
      console.log(error);
    }
  }

  try {
    user.save();
  } catch (error) {
    res.status(500).json(error);
  }
  res.status(200).json(user);
};
const signup = async (req, res) => {
  const { username, lastname, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    res.status(500).json(err);
  }
  if (existingUser) {
    return res.status(422).json("User exists already, please login instead");
  }
  let EncPass;
  try {
    EncPass = await bcrypt.hash(password, 12);
  } catch (err) {
    console.log(err);
  }
  const createdUser = new User({
    username,
    lastname,
    email,
    password: EncPass,
  });
  try {
    await createdUser.save();
  } catch (err) {
    res.status(500).json(err);
  }
  let token;
  try {
    token = jwt.sign(
      {
        userId: createdUser.id,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (error) {
    res.status(500).json(error);
  }
  res.status(201).json({ userId: createdUser.id, token: token });
};
const login = async (req, res) => {
  let existingUser;
  try {
    existingUser = await User.findOne({ email: req.body.email });
    if (!existingUser) {
      return res.status(400).json("wrong credentials");
    }

    const validated = await bcrypt.compare(
      req.body.password,
      existingUser.password
    );
    if (!validated) {
      return res.status(400).json("wrong credentials");
    }

    let token;
    try {
      token = jwt.sign(
        {
          userId: existingUser.id,
        },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );
    } catch (error) {
      res.status(500).json(error);
    }
    res.json({ userId: existingUser.id, token: token });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.profilePhoto = profilePhoto;
exports.getUserById = getUserById;
exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
