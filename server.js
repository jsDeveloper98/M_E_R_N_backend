const express = require("express");
const app = express();
const mongoose = require("mongoose");

require("dotenv").config();

const { PORT, MONGO_URI } = process.env;

app.use(express.json({ extended: true }));

app.use("/api/auth", require("./routes/auth"));

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    app.listen(PORT, () =>
      console.log(`App has been started on port: ${PORT}!`)
    );
  })
  .catch((e) => {
    console.log(`Server error ${e.message}`);
    process.exit();
  });
