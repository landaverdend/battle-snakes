import { useEffect, useRef, useState } from 'react';
import { MessageFeedService } from '@/game/MessageFeedService';
import './message-feed.css';
import { Message } from '@battle-snakes/shared';
import { ScrollView, Window, WindowContent, WindowHeader } from 'react95';

export function MessageFeed() {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Effect to scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      // Scroll to the bottom
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      console.log(scrollRef.current.scrollHeight);
    }
  }, [messages]);

  return (
    <Window>
      <WindowHeader> Message Feed</WindowHeader>
      <WindowContent>
        <ScrollView ref={scrollRef} className="message-feed-scroll-view">
          <div className="message-feed-container">
            {messages.map((message) => (
              <span key={crypto.randomUUID()} className={`message-item ${getMessageStyle(message)}`}>
                {message.message}
              </span>
            ))}
          </div>
        </ScrollView>
      </WindowContent>
    </Window>
  );
}
