const User = require("../models/user");
const express = require("express");
const auth = require("../middleware/auth");
const multer = require("multer");
const router = new express.Router();
// Create user
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
}); 
// Log in with email and password
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});
// remove all tokens from user's tokens array
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send("All sessions expired");
  } catch (error) {
    res.status(500).send();
  }
});
// Get my profile
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

// Search user by email and get back user's created posts
router.get("/users/:email", auth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).send();
    }
    await user.populate("posts").execPopulate();
    res.send({ user, posts: req.user.posts });
  } catch (e) {
    res.status(500).send();
  }
}); 
// Update user information 
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "age", "email", "password"];
  const isValidUpdates = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdates) {
    return res.status(400).send({ error: "Invalid updates" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();

    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
}); 
// Delete user (And posts which created by this user)
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
}); 
module.exports = router;
