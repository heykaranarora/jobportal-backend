import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import adminRoute from "./routes/admin.route.js";

dotenv.config({});

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

// const corsOptions = {
//     origin:'https://jobbers-frontend-heykaranaroras-projects.vercel.app',
//     credentials:true
// }

// app.use(cors({
//     origin: 'https://jobbers-frontend-heykaranaroras-projects.vercel.app', 
//     credentials: true, 
//   }));

const allowedOrigins = [
  "https://jobbers-frontend-heykaranaroras-projects.vercel.app",
    "http://localhost:5173",
    "http://192.168.1.6:5173"
];


const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, 
};


const PORT = process.env.PORT;

app.get("/",(req,res)=>{
    res.send("Welcome to Job Portal API");
})

// api's
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/admin", adminRoute);



app.listen(PORT,()=>{
    connectDB();
    console.log(`Server running at port ${PORT}`);
})
