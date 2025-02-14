import React, { useEffect, useState, useCallback, useMemo, useRef} from 'react';
import {
useDaily,
useParticipantIds,
useDailyEvent,
useLocalSessionId,
useMeetingSessionState,
} from '@daily-co/daily-react';

import { Grid, SimpleGrid } from '@mantine/core';

import './Call.css';
import Tile from '../Tile/Tile';
import UserMediaError from '../UserMediaError/UserMediaError';

//function compare(x, y) {
//  const xOrder = x.userData.order;
//  const yOrder = y.userData.order;
//
//  //Attempt to compare Order
//  if (xOrder !== null && yOrder !== null && xOrder !== yOrder) {
//    if (xOrder < yOrder) {
//      return -1;
//    }
//    if (xOrder > yOrder) {
//      return 1;
//    }
//  } else {
//    //Otherwise just compare with joined time
//    if (x.joined_at < y.joined_at) {
//      return -1;
//    }
//    if (x.joined_at > y.joined_at) {
//      return 1;
//    }
//  }
//}

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

const initMechanicState = {
  monarch: false,
  initiative: false
}

export default function Call() {
  /* If a participant runs into a getUserMedia() error, we need to warn them. */
  const [getUserMediaError, setGetUserMediaError] = useState(false);

  const [participantList, setParticipantList] = useState([]);
  const [orderedParticipantIds, setOrderedParticipantIds] = useState([]);
  const [renderedParticipantIds, setRenderedParticipantIds] = useState([]);

  const [mechanicStates, setMechanicStates] = useState(initMechanicState)
  const [monarchPlayer, setMonarchPlayer] = useState();
  const [initiativePlayer, setInitiativePlayer] = useState();


  //  const participantIds = useParticipantIds({sort: compare});
  const participantIds = useParticipantIds({ sort: 'joined_at' });

  const localSessionId = useLocalSessionId();

  const {data} = useMeetingSessionState();
  const { globalGameNumber } = useMeetingSessionState().data;

  // -- Turn Order
  useEffect(() => {
    if(data.turnOrderSorted !== undefined) {
      setOrderedParticipantIds([...data.turnOrderSorted])
    }
  }, [data.turnOrderSorted]);

  useEffect(() => {
    console.log("Init or Monarch UUID updated");
    setMonarchPlayer(data.monarchUUID);
    setInitiativePlayer(data.initiativeUUID);
  }, [data.monarchUUID, data.initiativeUUID]);

  useEffect(() => {
    console.log("Ordered Participants Changed")
    let renderedArray = orderedParticipantIds;
    if(orderedParticipantIds.length > 3) {
      const half_length = Math.ceil(orderedParticipantIds.length / 2);
      const secondHalf = orderedParticipantIds.slice(half_length, orderedParticipantIds.length).reverse();
      renderedArray = orderedParticipantIds.slice(0, half_length).concat(secondHalf);
    }

    setRenderedParticipantIds([...renderedArray]);
  }, [orderedParticipantIds]);


  //Provider object to use DailyJS stuff
  const callObject = useDaily();
  const turnPlayerId = orderedParticipantIds[data.turnPlayerIndex];

  /* We can use the useDailyEvent() hook to listen for daily-js events. Here's a full list
   * of all events: https://docs.daily.co/reference/daily-js/events */
  useDailyEvent(
    'camera-error',
    useCallback(() => {
      setGetUserMediaError(true);
    }, []),
  );

  // -- Effect to handle User Name Array
  useEffect(() => {
    console.log("Participants Changed")

    const newParticipantList = [];
    participantIds.forEach( id => {
      const playerId = (id === localSessionId) ? 'local' : id;
      const fullParticipantObj = callObject.participants()[playerId];
      newParticipantList.push({userName: fullParticipantObj.user_name, userId: fullParticipantObj.user_id});

    });
    console.log(newParticipantList);
    setParticipantList(newParticipantList);
    console.log("PARTICIPANTS UPDATED");

    if(orderedParticipantIds.length !== participantIds.length ) {
      const updatedOrderedParticipantIds = (data.turnOrderSorted !== undefined) ? data.turnOrderSorted : orderedParticipantIds;
      for(let i = 0; i<participantIds.length; i++) {
        if(!updatedOrderedParticipantIds.includes(participantIds[i])) {
          updatedOrderedParticipantIds.push(participantIds[i]);
        }
      }
      setOrderedParticipantIds([...updatedOrderedParticipantIds]);
    } else if (orderedParticipantIds.length === 0) {
      setOrderedParticipantIds([...participantIds])
    }

  }, [participantIds]);


  const findAndSetNextPlayer = () => {
    const turnPlayerIndex = data.turnPlayerIndex !== undefined ? data.turnPlayerIndex : 0;
    if(orderedParticipantIds.length > 1) {
      const nextPlayerIndex = (turnPlayerIndex + 1 >= orderedParticipantIds.length) ? 0 : turnPlayerIndex + 1;
      console.log(orderedParticipantIds);
      console.log(renderedParticipantIds);
      const nextPlayerUUID = orderedParticipantIds[nextPlayerIndex];
      console.log("Next Player index: " + nextPlayerIndex);
      console.log("Next Player should be: " + nextPlayerUUID);
      callObject.setMeetingSessionData({ turnPlayerIndex: nextPlayerIndex }, 'shallow-merge');
    }
  }

  // --Handle keydown events
  const handleKeydownEvent = (e) => {
    if(document.activeElement.tagName.toLowerCase() !== 'input' && e.key === ' ') {
      findAndSetNextPlayer();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeydownEvent, false);
    return () => {
      document.removeEventListener("keydown", handleKeydownEvent, false);
    };
  }, [data.turnPlayerIndex, participantIds]);
  // --

  //-- Reset Effect
  useEffect(() => {
    const userData = callObject.participants()['local'].userData;
    if(globalGameNumber !== undefined && userData.gameNumber !== globalGameNumber) {
      const updatedUserData = {...userData, gameNumber: globalGameNumber, lifeTotal: 40, lifeLog: []};
      callObject.setUserData(updatedUserData)
    }
  }, [globalGameNumber]);

  const handleReset = () => {
    const { globalGameNumber } = callObject.meetingSessionState().data;
    let newGlobalGameNumber = 0;
    if (globalGameNumber !== undefined){
      newGlobalGameNumber = globalGameNumber + 1;
    }
    //Set turn player to player 1
    callObject.setMeetingSessionData({ globalGameNumber: newGlobalGameNumber }, 'shallow-merge');
  }

  const handleReOrder = () => {
    const participants = callObject.participants();
    const participantsList = [];
    for (let key in participants) {
      participantsList.push(participants[key].user_id);
    }
    const newOrderArray = shuffle(participantsList);
    console.log("---new order bellow---");
    console.log(newOrderArray);
    callObject.setMeetingSessionData({ turnOrderSorted: [...newOrderArray] }, 'shallow-merge');
  }

  const handleSetMonarchy = (uuid) => {
    callObject.setMeetingSessionData({ monarchUUID: uuid }, 'shallow-merge');
  }

  const handleSetInitiative = (uuid) => {
    callObject.setMeetingSessionData({ initiativeUUID: uuid }, 'shallow-merge');
  }

  //Debuging to connect new robot users
//  console.log(window.location.href);

  const renderCallScreen = () => (
  <div className='call'>
  <SimpleGrid className="call-grid" cols={renderedParticipantIds.length <= 4 ? 2:Math.ceil(renderedParticipantIds.length/2)} spacing="xs" verticalSpacing="xs">
  {renderedParticipantIds.map((id) => (

  <Tile key={id} id={id} isTurnPlayer={id === turnPlayerId}
  isMonarch={id === monarchPlayer}
  isInitiative={id === initiativePlayer}
  participantList={participantList}
  handleReOrder={handleReOrder}
  handleReset={handleReset}
  handleSetMonarchy={handleSetMonarchy}
  handleSetInitiative={handleSetInitiative}
  />

  ))}
  </SimpleGrid>

</div>
);

return getUserMediaError ? <UserMediaError /> : renderCallScreen();
}
