import "dotenv/config";   
import express from 'express';
import http from 'http';
import cors from 'cors';
import {Server} from "socket.io";
import {registerSocketHandlers} from './sockets/index.js';

const app = express();

app.use(cors({origin: process.env.CLIENT_URL }));

app.get('/', (req,res)=>{
  res.send("Watch party server is running");
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {origin: process.env.CLIENT_URL },
});


registerSocketHandlers(io);


const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));


