import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import serverless from 'serverless-http'; /
// import DbConnection from "./config/db.js";
import  "./config/db.js";
import adminCombinedRoutes from "./routes/adminCombinedRoutes/adminCombinedRoutes.js";
import userCombinedRoutes from "./routes/userCombinedRoutes/userCombinedRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import UserRouter from "./routes/UserRouter.js";
import courseRoutes from "./routes/courseRoutes.js";
import courseAssignedRoutes from "./routes/courseAssignedRoutes.js";
import learnerAttendanceRoutes from './routes/learnerAttendanceRoutes.js';
import instructorAttendanceRoutes from './routes/instructorAttendanceRoutes.js';
import paymentRoutes from "./routes/paymentRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import {sendSMS} from "./util/otp-service.js";
import staffAttendanceRoutes from './routes/staffAttendanceRoutes.js';
import staffRouter from './routes/staffRouter.js';
// import uploadRoutes from "./routes/uploadRoutes.js";
import axios from "axios";
// import adminRoutes from "./routes/"; 
import helmet from "helmet";
import imageProxyRoutes from './routes/imageProxyRoutes.js';



dotenv.config();

const app = express();



// Middleware
app.use(express.json()); // For JSON requests
app.use(express.urlencoded({ extended: true })); // For Form-Data requests
app.use(cors());

// Add the new route

// Routes
app.get("/", (req, res) => res.send("Server running"));
app.use("/api/image-proxy", imageProxyRoutes);

//
// app.use("/api/upload", uploadRoutes);
// app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminCombinedRoutes);
app.use("/api/user", userCombinedRoutes);
// app.use("/api/user", UserRouter);
// app.use("/api/auth", adminRoutes);
app.use('/api/courses', courseRoutes); 
app.use('/api/course-assigned', courseAssignedRoutes);
app.use('/api/learner-attendance', learnerAttendanceRoutes);
app.use('/api/instructor-attendance', instructorAttendanceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/tests", testRoutes);
app.use('/api/staff', staffRouter);
app.use('/api/staff-attendance', staffAttendanceRoutes);

// Connect to Database
// DbConnection.once("open", () => {
//   console.log("Database connected successfully");
// });




const handler = serverless(app);
export default handler;
// sendSMS(otpCode, phoneList).catch(console.error);
// export default app;
