import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1.0";

let client = null;

export const getStompClient = (getToken) => {
  if (client) return client;

  client = new Client({
    webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
     connectHeaders: {},  
    reconnectDelay: 3000,
     beforeConnect: async () => {
      if (getToken) {
        const token = await getToken();
        client.connectHeaders = { Authorization: `Bearer ${token}` };
      }
    },
  });

  client.activate();
  return client;
};