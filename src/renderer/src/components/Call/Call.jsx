import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
useDaily,
useParticipantIds,
useScreenShare,
useDailyEvent,
useLocalSessionId,
useMeetingSessionState,
} from '@daily-co/daily-react';

import { Grid, SimpleGrid } from '@mantine/core';

import './Call.css';
import Tile from '../Tile/Tile';
import UserMediaError from '../UserMediaError/UserMediaError';

function compare(x, y) {
  const xOrder = x.userData.order;
  const yOrder = y.userData.order;

  //Attempt to compare Order
  if (xOrder !== null && yOrder !== null && xOrder !== yOrder) {
    if (xOrder < yOrder) {
      return -1;
    }
    if (xOrder > yOrder) {
      return 1;
    }
  } else {
    //Otherwise just compare with joined time
    if (x.joined_at < y.joined_at) {
      return -1;
    }
    if (x.joined_at > y.joined_at) {
      return 1;
    }
  }
}

function shuffle(array) {
  const shuffledArray = array;
  let currentIndex = shuffledArray.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [shuffledArray[currentIndex], shuffledArray[randomIndex]] = [
      shuffledArray[randomIndex], shuffledArray[currentIndex]];
  }
  return shuffledArray;
}

export default function Call() {
  /* If a participant runs into a getUserMedia() error, we need to warn them. */
  const [getUserMediaError, setGetUserMediaError] = useState(false);
  //  const participantIDs = useParticipantIds({sort: compare});
  const participantIDs = useParticipantIds({ sort: 'joined_at' });
  //Default Sort by joined
  //Check if MeetingOrder meeting prarm  exists, if so overwrite here

  const { data } = useMeetingSessionState();
  const renderedParticipantIDs = (data.turnOrderSorted !== undefined) ? data.turnOrderSorted : participantIDs;

  //Provider object to use DailyJS stuff
  const callObject = useDaily();
  const turnPlayerId = participantIDs[data.turnPlayerIndex];


  /* We can use the useDailyEvent() hook to listen for daily-js events. Here's a full list
   * of all events: https://docs.daily.co/reference/daily-js/events */
  useDailyEvent(
    'camera-error',
    useCallback(() => {
      setGetUserMediaError(true);
    }, []),
  );

  /* This is for displaying remote participants: this includes other humans, but also screen shares. */
  const { screens } = useScreenShare();

  const handleSpacePress = (e) => {
    if(document.activeElement.tagName.toLowerCase() !== 'input' && e.key === ' ') {
      console.log("CURRENT " + data.turnPlayerIndex);
      const turnPlayerIndex = data.turnPlayerIndex !== undefined ? data.turnPlayerIndex : 0;
      console.log("Variable " + turnPlayerIndex);
      if(participantIDs.length > 1){
        const nextPlayer = (turnPlayerIndex + 1 >= participantIDs.length) ? 0 : turnPlayerIndex + 1;
        console.log("TODO Next Player: " + nextPlayer)
        callObject.setMeetingSessionData({ turnPlayerIndex: nextPlayer }, 'shallow-merge');
      }
    }
  };

  const handleReOrder = () => {
    const participants = callObject.participants();
    const participantsList = [];
    for (let key in participants) {
      participantsList.push(participants[key].user_id);
    }
    const newOrderArray = shuffle(participantsList);
    callObject.setMeetingSessionData({ turnOrderSorted: newOrderArray }, 'shallow-merge');
  }

  useEffect(() => {
    document.addEventListener("keydown", handleSpacePress, false);
    return () => {
      document.removeEventListener("keydown", handleSpacePress, false);
    };
  }, [data.turnPlayerIndex, participantIDs]);

  console.log(window.location.href);



  const renderCallScreen = () => (
  <div className={screens.length > 0 ? 'is-screenshare' : 'call'}>
  <SimpleGrid className="call-grid" cols={renderedParticipantIDs.length <= 4 ? 2:Math.ceil(renderedParticipantIDs.length/2)} spacing="xs" verticalSpacing="xs">
  {renderedParticipantIDs.map((id) => (

  <Tile key={id} id={id} isTurnPlayer={id === turnPlayerId} handleReOrder={handleReOrder}/>

  ))}
  </SimpleGrid>

</div>
);

return getUserMediaError ? <UserMediaError /> : renderCallScreen();
}
