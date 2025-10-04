import { useEffect, useRef, useState } from 'react';
import { MessageFeedObservable } from '@/state/MessageFeedObservable';
import { GameMessage, PlayerMessage } from '@battle-snakes/shared';
import { Button, Frame, TextInput, Window, WindowContent, WindowHeader } from 'react95';
import { ChatService } from '@/game/network/service/ChatService';
import Draggable from 'react-draggable';

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

type MessageFeedProps = {
  isLocalGame: boolean;
};
export function MessageFeed({ isLocalGame }: MessageFeedProps) {
  const [messages, setMessages] = useState<GameMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [playerChat, setPlayerChat] = useState('');

  const getMessageComponent = (message: GameMessage) => {
    let toRender = <></>;
    switch (message.type) {
      case 'chat':
      case 'player':
        toRender = <PlayerMessageComponent key={crypto.randomUUID()} message={message} />;
        break;
      case 'default':
        toRender = <span>{message.message}</span>;
        break;
    }

    return toRender;
  };

  const sendMessage = (message: string = playerChat) => {
    if (message) {
      ChatService.getInstance().sendMessage(message.trim());
      setPlayerChat('');
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
    <Draggable handle=".handle" defaultPosition={{ x: 0, y: 0 }} scale={1}>
      <Window className="h-fit handle">
        <WindowHeader> Message Feed</WindowHeader>
        <WindowContent>
          <Frame variant="field" className="bg-white overflow-y-auto md:h-[300px] !p-2 z-40" ref={scrollRef}>
            <div className="flex flex-col md:w-[400px]">{messages.map((message) => getMessageComponent(message))}</div>
          </Frame>

          {!isLocalGame && (
            <div className="flex flex-row">
              <TextInput
                value={playerChat}
                onChange={(e) => {
                  setPlayerChat(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    sendMessage();
                  }
                }}
                fullWidth
              />
              <Button onClick={() => sendMessage()} style={{ marginLeft: 4 }}>
                Send
              </Button>
            </div>
          )}
        </WindowContent>
      </Window>
    </Draggable>
  );
}
