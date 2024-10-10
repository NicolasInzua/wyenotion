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
  pushMessage: (event: string, payload: unknown) => void;
}

interface UseChannelOptions {
  username: string;
  onJoin: (payload: string) => void;
  onError?: (error: string) => void;
}

export function useChannel(
  topic: string,
  {
    username,
    onJoin,
    onError = () => console.error('Channel not initialized'),
  }: UseChannelOptions
): Channel {
  const [channel, setChannel] = useState<PhoenixChannel | null>(null);

  useEffect(() => {
    const socket = getSocket();

    const channel = socket.channel(topic, { username });
    channel.join().receive('ok', onJoin).receive('error', onError);

    setChannel(channel);
    return () => {
      channel.leave();
    };
  }, [topic, username, onJoin, onError]);

  const pushMessage = (event: string, payload: unknown) => {
    if (channel && payload) {
      channel.push(event, payload);
    } else {
      throw 'Channel not initialized';
    }
  };

  return { pushMessage };
}
