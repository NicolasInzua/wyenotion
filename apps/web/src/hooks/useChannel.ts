import { useEffect, useState } from 'react';
import { Socket, Channel as PhoenixChannel } from 'phoenix';

if (!process.env.NEXT_PUBLIC_SOCKET_URL)
  throw new Error('SOCKET_URL is not defined');
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = new Socket(`${SOCKET_URL}/socket`);
    socket.connect();
  }

  return socket;
}

interface Channel {
  pushMessage: (event: string, payload: any) => void;
}

export function useChannel(topic: string): Channel {
  const [channel, setChannel] = useState<PhoenixChannel | null>(null);

  useEffect(() => {
    const socket = getSocket();

    const channel = socket.channel(topic);
    channel.join();

    setChannel(channel);
    return () => {
      channel.leave();
    };
  }, [topic]);

  const pushMessage = (event: string, payload: any) => {
    if (channel) {
      channel.push(event, payload);
    } else {
      throw 'Channel not initialized';
    }
  };

  return { pushMessage };
}
