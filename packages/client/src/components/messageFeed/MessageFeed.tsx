import { useEffect, useState } from 'react';
import { MessageFeedService } from '@/game/MessageFeedService';
import './message-feed.css';
import { Message } from '@battle-snakes/shared';
import { Window, WindowHeader } from 'react95';

export function MessageFeed() {
  const [message, setMessages] = useState<Message[]>([]);

  const getMessageStyle = (message: Message) => {
    let toRet = '';

    switch (message.type) {
      case 'collision':
        toRet = 'collision';
        break;
      case 'player_exit':
        toRet = 'player-exit';
        break;
      case 'player_join':
        toRet = 'player-join';
        break;
      default:
        toRet = 'default';
        break;
    }

    return toRet;
  };

  useEffect(() => {
    const handleActionUpdate = (newActions: Message[]) => {
      setMessages(newActions);
    };

    // Subscribe to updates
    MessageFeedService.getInstance().addListener(handleActionUpdate);

    // Initial state
    setMessages(MessageFeedService.getInstance().getActions());

    // Cleanup
    return () => {
      MessageFeedService.getInstance().removeListener(handleActionUpdate);
    };
  }, []);

  return (
    <Window>
      <WindowHeader> Message Feed</WindowHeader>

      <div className="message-feed-container">
        {message.map((message) => (
          <span key={crypto.randomUUID()} className={`message-item ${getMessageStyle(message)}`}>
            {message.message}
          </span>
        ))}
      </div>
    </Window>
  );
}
