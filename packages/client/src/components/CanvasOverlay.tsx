import { useEffect, useState } from 'react';
import { OverlayMessage } from '@battle-snakes/shared';
import { OverlayMessageEventBus } from '@service/OverlayMessageEventBus';

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
        <div className="absolute top-0 left-0 flex justify-center items-center w-full h-full z-50 text-white bg-black/30 text-4xl">
          <DisplayMessage overlayMessage={overlayMessage} />
        </div>
      )}
    </>
  );
}

function RoundOverMessage({ overlayMessage }: { overlayMessage: OverlayMessage }) {
  return (
    <div className="flex flex-col text-2xl">
      <span className="normal-text">{overlayMessage.message}</span>
      {overlayMessage.player && (
        <div>
          <span className={`text-${overlayMessage.player.color}`}>{overlayMessage.player.name + ' '}</span> survived!
          <br />
          <span className="text-green-500">+50</span> points!
        </div>
      )}
    </div>
  );
}

function GameOverMessage({ overlayMessage }: { overlayMessage: OverlayMessage }) {
  let messageText = overlayMessage.message ? overlayMessage.message : '';

  return (
    <div className="flex flex-col text-3xl">
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
      toRender = <span className="!text-5xl text-center">{overlayMessage.message}</span>;
      break;
    case 'round_over':
      toRender = <RoundOverMessage overlayMessage={overlayMessage} />;
      break;
    case 'game_over':
      toRender = <GameOverMessage overlayMessage={overlayMessage} />;
      break;
    case 'countdown':
      toRender = <span className="!text-9xl">{overlayMessage.message}</span>;
      break;
    default:
      break;
  }

  return <>{toRender}</>;
}
