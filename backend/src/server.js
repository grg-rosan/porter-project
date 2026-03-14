import http from "http"
import { Server as socketIOServer} from "socket.io"
import app from "./app.js";
import { startOrderConsumer } from "./modules/order/order.consumer.js";
import { initSocketHandlers } from "./infrastructure/socket/socket.handler.js";

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

initSocketHandlers(io)
startOrderConsumer(io)
server.listen(port,()=>{
    console.log(`listening to port ${port}`)
})

export {server, io}