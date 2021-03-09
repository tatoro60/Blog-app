const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    images: [
      {
        image: {
          type: Buffer,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

postSchema.methods.toJSON = function () {
  const post = this;
  const postObject = post.toObject();
  return postObject;
};
const Post = mongoose.model("Post", postSchema);

module.exports = Post;
