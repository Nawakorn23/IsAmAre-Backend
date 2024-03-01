const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit=require('express-rate-limit');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const hpp = require('hpp');
const cors=require('cors');

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to database
connectDB();

// Route files
const coworkings = require("./routes/coworkings");
const auth = require("./routes/auth");
const reservations = require("./routes/reservations");

const app = express();
// Body parser
app.use(express.json());
//Rate Limiting
const limiter = rateLimit({
   windowsMs: 10*60*1000, //10 mins
   max: 100
   });
app.use(limiter);

const swaggerOptions={
  swaggerDefinition:{
     openapi: '3.0.0',
     info: {
        title: 'Library API',
        version: '1.0.0',
        description: 'A simple Epress VacQ API'
     },
     servers: [
        {
           url: 'http://localhost:5000/api/project'
        }
     ],
  },
  apis:['./routes/*.js'],
};

const swaggerDocs=swaggerJsDoc(swaggerOptions);
app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDocs));

//Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//Enable CORS
app.use(cors());

//Prevent http param pollutions
app.use(hpp());

// Cookie parser
app.use(cookieParser());

app.use("/api/project/coworkings", coworkings);
app.use("/api/project/auth", auth);
app.use("/api/project/reservations", reservations);

const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(`Server runing in`, process.env.NODE_ENV, `mode on port`, PORT)
);

// Handle unhandle promise rejections
process.on(`unhandledRejection`, (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Colse server & exit process
  server.close(() => process.exit(1));
});

/*
{
    "name":"Samyan CO-OP",
    "address":"2nd Floor Samyan Mitrtown",
    "district":"Pathumwan",
    "province":"Bangkok",
    "postalcode":"10330",
    "telephone":"02-2196999",
    "region":"กรุงเทพมหานคร (Bangkok)"
}
*/
