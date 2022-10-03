require("dotenv").config({ path: "./configs/.env" });
const express = require("express"); // done
const path = require("path");
const mongoose = require("mongoose"); // done
const User = require("./model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const Answer = require("./model/answer.js");
const Question = require("./model/question.js");
const Project = require("./model/project.js");
var cors = require("cors");
// var upload = multer({ dest: "uploads/" });
const fs = require("fs");

// const options = {
//   key: fs.readFileSync("key.pem"),
//   cert: fs.readFileSync("cert.pem"),
// };

const JWT_SECRET = process.env.JWT_SECRET;

// mongoose.connect("mongodb://localhost:27017/login-app-db", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useCreateIndex: true,
// });

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) =>
    console.log(`Connected to ${result.connection.host} database`)
  )
  .catch((err) => console.log(err));

// app.listen(4000);

const app = express();
app.use(cors());
app.use("/", express.static(path.join(__dirname, "static")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("hey welcome to ednet backend 😊😊");
});
// --------------------------------vismay end point-------------------------------------------------------

app.post("/AddQuestion", (req, res) => {
  const { id, Title, Que, Author, status, Topic, Cnt } = req.body;
  Question.create({ id, Title, Que, Author, status, Topic, Cnt })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/AddAnswer", (req, res) => {
  //done
  const { id, Author, Comment, status } = req.body;
  Answer.create({ id, Author, Comment, status })
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/AddProject", (req, res) => {
  // done
  const { Author, Title, Description } = req.body;
  Project.create({ Author, Title, Description })
    .then((result) => {
      console.log("result", result, "body", req.body);
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/GetQuestion", (req, res) => {
  //done
  Question.find()
    .then((result) => res.send(result))
    .catch((err) => console.log(err));
});

app.get("/GetAnswer", (req, res) => {
  //done
  Answer.find()
    .then((result) => res.send(result))
    .catch((err) => console.log(err));
});

app.get("/GetProject", (req, res) => {
  // done

  Project.find()
    .then((result) => res.send(result))
    .catch((err) => console.log(err));
});

// ------------ved end point------------------------------------------------

const upload = multer({
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      cb(new Error("Please upload an Image  !!"));
    }
    cb(undefined, true);
  },
});

app.post("/api/change-password", async (req, res) => {
  const { token, newpassword: plainTextPassword } = req.body;

  if (!plainTextPassword || typeof plainTextPassword !== "string") {
    return res.json({ status: "error", error: "Invalid password" });
  }

  if (plainTextPassword.length < 5) {
    return res.json({
      status: "error",
      error: "Password too small. Should be atleast 6 characters",
    });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);

    const _id = user.id;

    const password = await bcrypt.hash(plainTextPassword, 10);

    await User.updateOne(
      { _id },
      {
        $set: { password },
      }
    );
    res.json({ status: "ok" });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: ";))" });
  }
});

app.patch("/api/profile", async (req, res) => {
  let email = req.body.email;
  const user = await User.findOne({ email }).lean();
  console.log(user);
  let arr = [];
  for (let i = 0; i < req.body.interest.length; i++) {
    arr.push(req.body.interest[i]);
  }
  (user.area_interest = arr), await user.save();
  console.log(user);
  return res.user;
});
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).lean();

  if (!user) {
    return res.json({ status: "e1", error: "Invalid email/password" });
  }

  if (await bcrypt.compare(password, user.password)) {
    // the email, password combination is successful

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      JWT_SECRET
    );

    //return res.json({ status: 'ok', data: token })

    let response = {
      token: token,
      user_id: user._id,
      Status: user.isAdmin || user.isProf,
      name: user.firstname + " " + user.lastname,
      email: user.email,
    };
    //  res.status(200).response;
    console.log(response);
    res.send(response);
    return;
  }

  res.json({ status: "error", error: "Invalid email/password" });
});

app.post("/api/register", async (req, res) => {
  const { email, password: plainTextPassword } = req.body;
  const user = new User();
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    JWT_SECRET
  );
  console.log(req.body);

  if (!email || typeof email !== "string") {
    return res.json({ status: "e1", error: "Invalid email" });
  }

  /*if(req.body.admincde === 'John Reese'){
		req.body.isAdmin = true;	
	}

	if(req.body.admincde === 'Harold Finch'){
		req.body.isProf = true;	
	}*/

  if (!plainTextPassword || typeof plainTextPassword !== "string") {
    return res.json({ status: "error", error: "Invalid password" });
  }

  if (plainTextPassword.length < 5) {
    return res.json({
      status: "error",
      error: "Password too small. Should be atleast 6 characters",
    });
  }

  const password = await bcrypt.hash(plainTextPassword, 10);

  try {
    let arr = [];
    for (let i = 0; i < req.body.interest.length; i++) {
      arr.push(req.body.interest[i]);
    }
    const response = await User.create({
      email: email,
      password: password,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      area_interest: arr,
      isAdmin: req.body.Status,
    });
    response.isAdmin = req.body.Status;
    if (req.body.admincode === "John Reese") {
      response.isAdmin = true;
    }
    if (req.body.admincode === "Harold Finch") {
      req.body.isProf = true;
    }
    console.log("User created successfully: ", response);

    // response.profile = await sharp(req.file.buffer)
    //   .resize({ width: 300, height: 300 })
    //   .png()
    //   .toBuffer();
  } catch (error) {
    if (error.code === 11000) {
      // duplicate key
      return res.json({ status: "error", error: "Username already in use" });
    }
    throw error;
  }

  //res.json({ status: 'ok' })
  return res
    .status(200)
    .json({ token: token, user_id: user._id, status: "ok" });
  //res.redirect("/api/profile")
});

var port_number = process.env.PORT || 3000;
app.listen(port_number, () => {
  console.log(`Server up at ${port_number}`);
});

// https
//   .createServer(options, function (req, res) {
//     res.writeHead(200);
//   })
//   .listen(8000);
