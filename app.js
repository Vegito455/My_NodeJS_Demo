require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const app = express();

const bodyParsrer = require("body-parser");
const cookiesParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category")
const productRoutes = require("./routes/product")
// const orderRoutes=require("./routes/order")

// test=========Start

// test=========End

// Database connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => {
    console.log("SUCCESSFULLY CONNECTED TO DATABASE..!");
  })
  .catch(
    console.log("DATABASE NOT CONNECTED SUCCESSFULLY...!!!")
  );

// Middlewares
// parse application/json
app.use(express.json());
app.use(bodyParsrer.json());
app.use(cookiesParser())
app.use(cors())


//testing Route - to check if the server is running properly or not
app.get('/', (req, res) => {

  // Cookies that have not been signed
  console.log('Cookies: ', req.cookies)

  // Cookies that have been signed
  console.log('Signed Cookies: ', req.signedCookies)

  // res.send('Success');
  res.json({
    message: "Success",
    Status: 1
  })
})

// MyRoutes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);


// Server 
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`App is started at ${port}`);
});
