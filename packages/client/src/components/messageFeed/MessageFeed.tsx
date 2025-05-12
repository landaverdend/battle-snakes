import { useEffect, useRef, useState } from 'react';
import { MessageFeedObservable } from '@/state/MessageFeedObservable';
import './message-feed.css';
import { GameMessage, PlayerMessage } from '@battle-snakes/shared';
import { Button, Frame, TextInput, Window, WindowContent, WindowHeader } from 'react95';

type MCProps = {
  message: PlayerMessage;
};
function PlayerMessageComponent({ message }: MCProps) {
  const { playerData, otherPlayerData } = message;

  const playerName = playerData?.name as string;
  const playerColor = playerData?.color as string;
  const otherPlayerName = otherPlayerData?.name;
  const otherPlayerColor = otherPlayerData?.color;

  // Split the message by the placeholders
  const parts = message.message.split(/(\{playerName\}|\{otherPlayerName\})/);

  return (
    <div key={crypto.randomUUID()}>
      {parts.map((part, index) => {
        if (part === '{playerName}') {
          return (
            <span key={index} style={{ color: playerColor }}>
              {playerName}
            </span>
          );
        }
        if (part === '{otherPlayerName}' && otherPlayerName && otherPlayerColor) {
          return (
            <span key={index} style={{ color: otherPlayerColor }}>
              {otherPlayerName}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}

export function MessageFeed() {
  const [messages, setMessages] = useState<GameMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [playerChat, setPlayerChat] = useState('');

  const getMessageComponent = (message: GameMessage) => {
    let toRender = <></>;
    switch (message.type) {
      case 'player':
        toRender = <PlayerMessageComponent key={crypto.randomUUID()} message={message} />;
        break;
      case 'default':
        toRender = <>{message.message}</>;
        break;
    }

    return toRender;
  };

  const sendMessage = (message: string = playerChat) => {
    if (message.trim()) {
    }
  };
  useEffect(() => {
    const handleActionUpdate = (newActions: GameMessage[]) => {
      setMessages(newActions);
    };

    // Subscribe to updates
    MessageFeedObservable.getInstance().subscribe(handleActionUpdate);

    // Initial state
    setMessages(MessageFeedObservable.getInstance().getState());

    // Cleanup
    return () => {
      MessageFeedObservable.getInstance().unsubscribe(handleActionUpdate);
    };
  }, []);

  // Effect to scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      // Scroll to the bottom
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Window>
      <WindowHeader> Message Feed</WindowHeader>
      <WindowContent>
        <Frame variant="field" className="message-feed-scroll-view" ref={scrollRef}>
          <div className="message-feed-container">{messages.map((message) => getMessageComponent(message))}</div>
        </Frame>

        <div style={{ display: 'flex' }}>
          <TextInput
            value={playerChat}
            onChange={(e) => {
              setPlayerChat(e.target.value);
            }}
            fullWidth
          />
          <Button onClick={() => sendMessage()} style={{ marginLeft: 4 }}>
            Send
          </Button>
        </div>
      </WindowContent>
    </Window>
  );
}
