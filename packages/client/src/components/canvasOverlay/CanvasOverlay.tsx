import './canvas-overlay.css';
import { useEffect, useState } from 'react';
import { OverlayMessage } from '@battle-snakes/shared';
import { OverlayMessageEventBus } from '@/service/OverlayMessageEventBus';

export function CanvasOverlay() {
  const [shouldDisplay, setShouldDisplay] = useState<boolean>(false);
  const [overlayMessage, setOverlayMessage] = useState<OverlayMessage | null>(null);

  function handleOverlayMessage(message: OverlayMessage) {
    if (message.type === 'clear') {
      setShouldDisplay(false);
    } else {
      setShouldDisplay(true);
    }

    setOverlayMessage(message);
  }

  useEffect(() => {
    const overlayMessageBus = OverlayMessageEventBus.getInstance();

    overlayMessageBus.subscribe(handleOverlayMessage);

    return () => {
      overlayMessageBus.unsubscribe(handleOverlayMessage);
    };
  }, []);

  return (
    <>
      {shouldDisplay && (
        <div className="canvas-overlay-container">
          <DisplayMessage overlayMessage={overlayMessage} />
        </div>
      )}
    </>
  );
}

function RoundOverMessage({ overlayMessage }: { overlayMessage: OverlayMessage }) {
  return (
    <div className="message-container">
      <span className="normal-text">{overlayMessage.message}</span>
      {overlayMessage.player && (
        <div>
          <span style={{ color: overlayMessage.player.color }}>{overlayMessage.player.name + ' '}</span> survived!
          <br />
          <span style={{ color: 'green' }}>+50</span> points!
        </div>
      )}
    </div>
  );
}

function GameOverMessage({ overlayMessage }: { overlayMessage: OverlayMessage }) {
  let messageText = overlayMessage.message ? overlayMessage.message : '';

  return (
    <div className="message-container">
      <span className="normal-text">Game Over! {' ' + messageText}</span>
      {overlayMessage.player && (
        <div>
          <span style={{ color: overlayMessage.player.color }}>{overlayMessage.player.name}</span> wins!!
        </div>
      )}
    </div>
  );
}

type DMProps = {
  overlayMessage: OverlayMessage | null;
};
function DisplayMessage({ overlayMessage }: DMProps) {
  let toRender = <></>;

  switch (overlayMessage?.type) {
    case 'waiting':
      toRender = <span className="waiting-message">{overlayMessage.message}</span>;
      break;
    case 'round_over':
      toRender = <RoundOverMessage overlayMessage={overlayMessage} />;
      break;
    case 'game_over':
      toRender = <GameOverMessage overlayMessage={overlayMessage} />;
      break;
    case 'countdown':
      toRender = <span style={{ fontSize: '6rem' }}>{overlayMessage.message}</span>;
      break;
    default:
      break;
  }

  return <span>{toRender}</span>;
}
