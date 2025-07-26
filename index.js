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

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// ✅ Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://jobbers-frontend-heykaranaroras-projects.vercel.app",
  "http://192.168.1.6:5173"
];

// ✅ CORS options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies to be sent
};

// ✅ Apply middleware
app.use(cors(corsOptions));                 // Enable CORS
app.options("*", cors(corsOptions));        // Handle preflight OPTIONS requests
app.use(express.json());                    // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser());                    // Parse cookies

// ✅ Routes
app.get("/", (req, res) => {
  res.send("Welcome to Job Portal API");
});

app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/admin", adminRoute);

// ✅ Start server after DB connection
app.listen(PORT, async () => {
  await connectDB(); // Ensure DB is connected before listening
  console.log(`✅ Server running at port ${PORT}`);
});
