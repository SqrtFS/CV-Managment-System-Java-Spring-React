import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let client = null;

export const getStompClient = () => {
  if (client) return client;

  client = new Client({
    webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
    reconnectDelay: 3000,
  });

  client.activate();
  return client;
};