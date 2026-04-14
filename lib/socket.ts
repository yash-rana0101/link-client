import { io, type Socket } from "socket.io-client";
import type { Message } from "@/types/messaging";
import type { NotificationItem } from "@/types/notification";

interface SendMessageAckSuccess {
  success: true;
  data: Message;
}

interface SendMessageAckFailure {
  success: false;
  statusCode?: number;
  message: string;
}

export type SendMessageAck = SendMessageAckSuccess | SendMessageAckFailure;

type ServerToClientEvents = {
  receive_message: (message: Message) => void;
  message_received: (message: Message) => void;
  notification: (notification: NotificationItem) => void;
  notification_received: (notification: NotificationItem) => void;
  message_error: (error: { message: string }) => void;
};

type ClientToServerEvents = {
  send_message: (
    payload: { receiverId: string; content: string },
    ack: (response: SendMessageAck) => void,
  ) => void;
  join_room: (room: string) => void;
};

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:4000";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
let activeToken: string | null = null;

export const connectSocket = (
  token: string,
  userId?: string,
): Socket<ServerToClientEvents, ClientToServerEvents> | null => {
  if (typeof window === "undefined") {
    return null;
  }

  if (socket && activeToken === token) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  activeToken = token;
  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: {
      token: `Bearer ${token}`,
    },
  });

  socket.on("connect", () => {
    if (userId) {
      socket?.emit("join_room", `user:${userId}`);
    }
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  activeToken = null;

  if (!socket) {
    return;
  }

  socket.disconnect();
  socket = null;
};
