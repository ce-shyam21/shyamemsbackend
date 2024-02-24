import express from "express";
import cors from 'cors';
import { adminRouter } from "./Routes/AdminRoute.js";
import { EmployeeRouter } from "./Routes/EmployeeRoute.js";
import Jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv'; // Import dotenv for loading environment variables

// Load environment variables
dotenv.config();

const app = express();

// Access environment variable for BASE_URL
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

app.use(cors({
    origin: [BASE_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use('/auth', adminRouter);
app.use('/employee', EmployeeRouter);
// Serve static files
app.use(express.static('Public'));

// Middleware for verifying user
const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if(token) {
        Jwt.verify(token, "jwt_secret_key", (err ,decoded) => {
            if(err) return res.json({Status: false, Error: "Wrong Token"})
            req.id = decoded.id;
            req.role = decoded.role;
            next();
        });
    } else {
        return res.json({Status: false, Error: "Not authenticated"});
    }
};

app.get('/verify', verifyUser, (req, res)=> {
    return res.json({Status: true, role: req.role, id: req.id});
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
