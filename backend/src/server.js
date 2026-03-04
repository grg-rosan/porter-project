import http from "http"
import { Server as socketIOServer} from "socket.io"
import app from "./app.js";

const port = 3000;

//create raw http server from express
const server = http.createServer(app);

//initilize socket io
const io = new socketIOServer(server, {
    cors:{
        origin:"http://localhost:5173",
        credentials:true
    }
})

//listen for connection
io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    socket.on("disconnect",()=>{
        console.log("user disconnected", socket.id)
    })
})
app.listen(port,()=>{
    console.log(`listening to port ${port}`)
})

export {server, io}