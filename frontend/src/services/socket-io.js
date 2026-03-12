import openSocket from "socket.io-client";
import { getBackendUrl } from "../config";

function connectToSocket() {
    let token = localStorage.getItem("token");
    if (token) {
        try {
            token = JSON.parse(token);
        } catch (e) {
            // Se não for JSON, o token é a própria string (eyJ...)
        }
    }

    if (token === "null" || token === "undefined" || token === null) {
        token = "";
    }

    return openSocket(getBackendUrl(), {
      transports: ["websocket", "polling", "flashsocket"],
      query: {
        token,
      },
    });
}

export default connectToSocket;