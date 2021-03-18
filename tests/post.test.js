const request = require("supertest");
const Post = require("../src/models/post");
const app = require("../src/app");
const {
  userOne,
  userOneId,
  userTwo,
  userTwoId,
  postThree,
  setupDatabase,
} = require("./fixtures/db");

beforeEach(setupDatabase);

test("Should create post for user", async () => {
  const response = await request(app)
    .post("/posts")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("upload", "tests/fixtures/profPic.jpg")
    .field("description", "Haylo")
    .expect(201);

  const post = await Post.findById(response.body._id);

  expect(post).not.toBeNull();
});

test("Should get user one posts", async () => {
  const response = await request(app)
    .get("/posts/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(200);

  const posts = await Post.find({ creator: userOneId });

  expect(posts.length).toEqual(2);
});

test("Should fail to delete other's post", async () => {
  await request(app)
    .delete(`/posts/${postThree._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .expect(404);

    const post = await Post.findById(postThree._id);

    expect(post).not.toBeNull()
});
