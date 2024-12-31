import './Tile.css';
import { useDaily, useLocalSessionId, DailyVideo, useVideoTrack, useParticipantProperty, } from '@daily-co/daily-react';
import TileOverlay from './TileOverlay'

export default function Tile({ id, isScreenShare, isTurnPlayer, handleReOrder }) {
  const videoState = useVideoTrack(id);
  const localSessionId = useLocalSessionId();

  let containerCssClasses = isScreenShare ? 'tile-screenshare' : 'tile-video';
  const isLocal = localSessionId === id;
  const callObject = useDaily();

  console.log(id + ", isTurn?: " + isTurnPlayer);
  if (isTurnPlayer) {
    containerCssClasses += ' turn-player';
  }

  /* If a participant's video is muted, hide their video and
  add a different background color to their tile. */
  if (videoState.isOff) {
    containerCssClasses += ' no-video';
  }

  const updateLifeTotal = (total) => {
    const userData = callObject.participants()['local'].userData;
    const updatedUserData = {...userData, lifeTotal: total};
    callObject.setUserData(updatedUserData)
  };

  return (
    <div className={containerCssClasses}>
      <TileOverlay id={id} isLocal={isLocal} updateLifeTotal={updateLifeTotal} handleReOrder={handleReOrder}/>
      <DailyVideo automirror sessionId={id} type={isScreenShare ? 'screenVideo' : 'video'} />
      {!isScreenShare && <Username id={id} isLocal={isLocal} />}
    </div>
  );
}
