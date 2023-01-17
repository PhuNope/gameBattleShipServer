import io from "./connect.js";
import { config } from "dotenv";
config();

const dataObj = { data: {} };

let clientNo = 0;
let roomNo;
let hostName;
let playerName;
let clientReady = 0;

io.on("connection", (socket) => {
    //server thông báo cho clients vừa join
    data.data = { notify: "system online" };
    socket.emit(process.env.SERVER_HELLO_CLIENT, data);

    //server nhận tên client
    socket.on(process.env.CLIENT_REGISTER_NAME, (data) => {
        playerName = data.data.playerName;
        clientNo++;
        if (clientNo % 2 != 0) {
            roomNo = socket.id;
            hostName = dataObj.data.playerName;

            socket.join(roomNo);
            data.data = { roomName: roomNo };
            //server gửi thông báo room host cho clients
            socket.emit(process.env.YOU_ARE_HOST, data);
        } else {
            socket.join(roomNo);

            dataObj.data = { hostName: hostName, playerName, roomName: roomNo };
            //server gửi thông tin phòng cho người chơi
            io.to(roomNo).emit(process.env.ALL_CLIENTS_IN_ROOM, dataObj);
        }
    });

    //nhận thông báo sẵn sàng của clients
    socket.on(process.env.CLIENT_READY, (data) => {
        clientReady++;
        if (clientReady == 1) {
            dataObj.data = { roomName: data.data.roomName, status: false };
            io.to(data.data.roomName).emit(process.env.ALL_CLIENTS_ARE_READY, dataObj);
        }

        if (clientReady == 2) {
            clientReady = 0;
            dataObj.data = { roomName: data.data.roomName, status: false };
            io.to(data.data.roomName).emit(process.env.ALL_CLIENTS_ARE_READY, dataObj);
        }
    });
});