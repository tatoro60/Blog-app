const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const { userOne, userOneId, setupDatabase } = require("./fixtures/db");

beforeEach(setupDatabase);

test("Should signup a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Sasha Tsatryan",
      email: "tsatryan.sasha.01@mail.ru",
      password: "sasha2001",
      age: 19,
    })
    .expect(201);

  const user = await User.findById(response.body.user._id);

  expect(user).not.toBeNull();

  expect(response.body).toMatchObject({
    user: {
      name: "Sasha Tsatryan",
      email: "tsatryan.sasha.01@mail.ru",
      age: 19,
    },
    token: user.tokens[0].token,
  });

  expect(user.password).not.toBe("sasha2001");
});

test("Should not signup user with invalid name/email/password", async () => {
  await request(app)
    .post("/users")
    .send({
      name: "Sasha Tsatryan",
      email: "tsatryan.sasha.0mail.ru",
      password: "sasha2001",
      age: 19,
    })
    .expect(400);

  await request(app)
    .post("/users")
    .send({
      name: "Sasha Tsatryan",
      email: "tsatryan.sasha.01@mail.ru",
      password: "sasha2001",
      age: -2,
    })
    .expect(400);
});

test("Should login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const user = await User.findById(userOneId);

  expect(response.body.token).toBe(user.tokens[1].token);
});

test("Should not login nonexisting user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: userOne.email,
      password: "asdlkxcvlkxcv",
    })
    .expect(400);
});

test("Should get profile for user", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not get profile for unauthenticated user", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("Should upload avatar image", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/profPic.jpg")
    .expect(200);

  const user = await User.findById(userOneId);

  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Should update valid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "Sasha",
      age: 19,
    })
    .expect(200);

  const user = await User.findById(userOneId);

  expect(user).toMatchObject({
    name: "Sasha",
    age: 19,
  });
});

test("Should not update user with invalid name/email/password", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: "Sasha",
      age: -2,
    })
    .expect(400);

  const user = await User.findById(userOneId);

  expect(user).toMatchObject({
    age: userOne.age,
  });
});

test("Should not update invalid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      sex: "male",
    })
    .expect(400);
});

test("Should not update user if unauthenticated", async () => {
  await request(app)
    .patch("/users/me")
    .send({
      name: "Sasha",
      age: 19,
    })
    .expect(401);
});

test("Should not delete account for unauthenticated user", async () => {
  await request(app).delete("/users/me").send().expect(401);
});

test("Should delete account for user", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);

  expect(user).toBeNull();
});
