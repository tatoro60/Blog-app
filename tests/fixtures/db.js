const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user');
const Post = require('../../src/models/post');


const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: "Alex Tsatryan",
  email: "tsatryan.alex@mail.ru",
  password: "alex2010",
  age: 11,
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: "Sasha Tsatryan",
  email: "tsatryan.sasha@mail.ru",
  password: "sasha2001",
  age: 19,
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),
    },
  ],
};


const postOne = {
  _id : new mongoose.Types.ObjectId(),
  description : "First post",
  creator : userOneId
}

const postTwo = {
  _id : new mongoose.Types.ObjectId(),
  description : "Second post",
  creator : userOneId
}

const postThree = {
  _id : new mongoose.Types.ObjectId(),
  description : "Third post",
  creator : userTwoId
}

const setupDatabase = async()=>{
    await User.deleteMany();
    await Post.deleteMany();

    await new User(userOne).save();
    await new User(userTwo).save();
    
    await new Post(postOne).save();
    await new Post(postTwo).save();
    await new Post(postThree).save();
    
}

module.exports = {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    postOne,
    postTwo,
    postThree,
    setupDatabase
}