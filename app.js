const express = require("express");
var cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");
const users = require("./routes/users");
const posts = require("./routes/posts");
const path = require("path");
const fs = require("fs");
const newsApi = require("./util/newsApi");
const { getFileStream } = require("./s3");

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

app.use(cors());
app.use(express.json());

app.get("/uploads/images/:key", (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});
app.use("/api/users", users);
app.use("/api/posts", posts);
app.get("/api/news", newsApi);

app.listen(port, () => {
  console.log(`app is listening at http://localhost:${port}`);
});
