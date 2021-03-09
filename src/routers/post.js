const express = require("express");
const Post = require("../models/post");
const auth = require("../middleware/auth");
const router = new express.Router();
const multer = require("multer");
const sharp = require("sharp");
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("File must be an image!"));
    }
    cb(undefined, true);
  },
});
// Get all posts without auth
router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find();

    res.send(posts);
  } catch (e) {
    res.status(500).send();
  }
});
// Crete post  
router.post("/posts", auth, upload.array("upload", 10), async (req, res) => {
  const post = new Post({
    ...req.body,
    creator: req.user._id,
  });
  try {
    for (let i = 0; i < req.files.length; i++) {
      const buffer = await sharp(req.files[i].buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer();
      post.images.push({ image: buffer });
    }
    await post.save();
    res.status(201).send(post);
  } catch (e) {
    res.status(400).send(e);
  }
});
// Add images into post
router.post("/posts/:id/images" , upload.array("images",3), async (req,res)=>{
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      creator: req.user._id,
    });
    if(!post){
        return res.status(404).send();
    }
    for (let i = 0; i < req.files.length; i++) {
      const buffer = await sharp(req.files[i].buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer();
      post.images.push({ image: buffer });
    }
    await post.save();
    res.send();
  } catch (error) {
    res.status(500).send()
  }
},(error,req,res,next)=>{
  res.status(400).send({error : error.message})
})
// Update images and description in post
router.patch("/posts/:id", auth, upload.single('upload'), async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      creator: req.user._id,
    });
    if (!post) {
      return res.status(404).send();
    }
    if(req.body.description){
      post.description = req.body.description;
    }
    if(req.query.index){
      if(req.query.index>=post.images.length || req.query.index < 0){
        return res.status(404).send();
      }

    const buffer = await sharp(req.file.buffer)
    .resize({ width: 250, height: 250 })
    .png()
    .toBuffer();
    post.images[req.query.index] = {image : buffer}
    }
    await post.save();
    res.send(post);
  } catch (error) {
    res.status(400).send(error.message);
  }
}
);
// Delete images from post
router.delete("/posts/:id/:index", auth, async (req, res) => {
  try {
    console.log(12)
    const post = await Post.findOne({
      _id: req.params.id,
      creator: req.user._id,
    });
    console.log(89)
    if(!post || (req.params.index>=post.images.length || req.params.index < 0)){
        return res.status(404).send();
    }
    console.log(45)
    post.images.splice(req.params.index, 1);
    await post.save();
    console.log(65)
    res.send();
  } catch (error) {
    res.status(500).send()
  }
});
// Get top recently created posts by query limit
router.get("/posts/top", auth,async (req, res) => {
  try {
    const posts = await  Post.find();
    const recently =[];
    for(let i = posts.length-1; i >= posts.length-req.query.limit || 0 ; i--){
      recently.push(posts[i]);
    }
    res.send(recently);
  } catch (e) {
    res.status(500).send();
  }
});
// Get my posts  + sorting pagination
router.get("/posts/me", auth, async (req, res) => {
  const sort = {};
  if (req.query.sortBy) {
    const part = req.query.sortBy.split(":");
    sort[part[0]] = part[1] === "asc" ? 1 : -1;
  }
  try {
    await req.user
      .populate({
        path: "posts",
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.posts);
  } catch (e) {
    res.status(500).send();
  }
});
// Search by description
router.get("/posts/me", auth, async (req, res) => {
  try {
    const posts = Post.find({ creator : req.user._id});
    if(req.query.search){
      posts.filter((post)=>{
        if(post.description.includes(req.query.search)){
          return true;
        }
        return false;
      })
    }
    res.send(posts)

  } catch (e) {
    res.status(500).send();
  }
});
// Get Individual post
router.get("/posts/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const post = await Post.findOne({ _id });

    if (!post) {
      return res.status(404).send();
    }
    res.send(post);
  } catch (e) {
    res.status(500).send();
  }
});
// Delete post
router.delete("/posts/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      creator: req.user._id,
    });
    if (!post) {
      return res.status(404).send();
    }
    res.send(post);
  } catch (error) {
    res.status(500).send(error);
  }
});
module.exports = router;
