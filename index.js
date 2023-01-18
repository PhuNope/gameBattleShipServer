import io from "./connect.js";
import { config } from "dotenv";
config();

const dataObj = { data: {} };

let clientNo = 0;
let roomNo;
let hostName;
let playerName;
let roomStatus = [];

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

            roomStatus[roomNo] = 0;
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
        roomStatus[data.data.roomName]++;

        if (roomStatus[data.data.roomName] == 1) {
            dataObj.data = { roomName: data.data.roomName, playerName: data.data.playerName };
            io.to(data.data.roomName).emit(process.env.CLIENT_READY, dataObj);
        }

        if (roomStatus[data.data.roomName] == 2) {
            dataObj.data = { roomName: data.data.roomName, status: false };
            io.to(data.data.roomName).emit(process.env.ALL_CLIENTS_ARE_READY, dataObj);
        }
    });

    //gửi và nhận thông tin clients hủy sẳn sàng
    socket.on(process.env.CLIENT_UNREADY, (data) => {
        roomStatus[data.data.roomName]--;

        dataObj.data = { roomName: data.data.roomName, playerName: data.data.playerName };
        io.to(data.data.roomName).emit(process.env.CLIENT_UNREADY, dataObj);
    });

    //nhận thông tin đạn từ client
    socket.on(process.env.CLIENTS_FIRE, (data) => {
        io.to(data.data.roomName).emit(process.env.CLIENTS_FIRE, data);
    });

    //nhận trạng thái bắn trúng
    socket.on(process.env.IS_HIT, (data) => {
        io.to(data.data.roomName).emit(process.env.IS_HIT, data);

        if (!data.data.isHit) {
            //gửi client turn tiếp theo
            dataObj.data = { playerName: data.data.playerName, roomName: data.data.roomName };
            io.to(data.data.roomName).emit(process.env.NEXT_TURN, dataObj);
        }
    });

    //Gửi lên server hết tàu
    socket.on(process.env.DIE_ALL_SHIP, (data) => {
        //gửi thông báo người win
        io.to(data.data.roomName).emit(process.env.WIN_GAME, dataObj);
    });
});