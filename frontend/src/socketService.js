// socketService.js
import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (serverUrl, userId) => {
    socket = io(serverUrl, {
        query: { userId:userId },
        transports: ['websocket'],
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
