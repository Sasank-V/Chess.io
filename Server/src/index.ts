import { WebSocketServer } from 'ws';
import { GameManager } from './GameFiles/Manager';

//Websocket Server
const wss = new WebSocketServer({ port: 8080 });
console.log("WebSocket Server is listening on port 8080");

const gameManager = new GameManager();

wss.on('connection', function connection(ws) {
    console.log("User Connected");
    gameManager.addUser(ws);

    // Handle client disconnection
    ws.on('close', () => {
        console.log("User Disconnected");
        gameManager.removeUser(ws);
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        gameManager.removeUser(ws);
    });
});


//Express Server
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import { connectToDB } from './database';

import {default as authRouter} from './REST/routes/auth';
import {default as userRouter} from "./REST/routes/user";
import {default as gameRouter} from "./REST/routes/game";
// import { verifyJWT } from './REST/middleware/auth';


const app = express();
connectToDB();
dotenv.config();

// console.log(process.env.CLIENT_URL);
app.use(cors({
    origin: process.env.CLIENT_URL, // Ensure this matches exactly with the frontend URL
    credentials: true, // Allow credentials
    methods: 'GET,POST,PUT,DELETE', // Allow necessary HTTP methods
    allowedHeaders: 'Content-Type,Authorization', // Specify allowed headers
}));
app.options("*", cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use("/api/auth",authRouter);
// app.use("/api/user",verifyJWT,userRouter);
app.use("/api/game",gameRouter);


app.get("/",(req,res) =>{
    res.send("Hello, I am groot !");
});

app.use("*",(req,res)=>{
    res.status(404).json({
        success: false,
        message:"404 Route not found"
    });
})

app.listen(3000,()=>{
    console.log("Express Server is listening on port 3000");    
});
