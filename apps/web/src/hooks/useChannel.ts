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
  pushChannelEvent: (event: string, payload: unknown) => void;
}

interface ChannelOptions {
  username: string;
  onJoin?: (payload: string) => void;
  onError?: (error: ChannelError) => void;
  onMessage?: (event: string, payload: unknown) => void;
}

type ChannelError = {
  reason: string;
};

const defaultOnJoin = () => console.log('Channel joined');
const defaultOnError = (err: ChannelError) =>
  console.error('Channel error:', err.reason);

export function useChannel(
  topic: string,
  {
    username,
    onJoin = defaultOnJoin,
    onError = defaultOnError,
    onMessage,
  }: ChannelOptions
): Channel {
  const [channel, setChannel] = useState<PhoenixChannel | null>(null);

  useEffect(() => {
    const socket = getSocket();

    const channel = socket.channel(topic, { username });
    channel.join().receive('ok', onJoin).receive('error', onError);

    if (onMessage)
      channel.onMessage = (event, payload) => {
        onMessage(event, payload);
        return payload;
      };

    setChannel(channel);
    return () => {
      channel.leave();
    };
  }, [topic, username, onJoin, onError, onMessage]);

  const pushChannelEvent = (event: string, payload: unknown) => {
    if (channel && payload) {
      channel.push(event, payload);
    }
  };

  return { pushChannelEvent };
}
