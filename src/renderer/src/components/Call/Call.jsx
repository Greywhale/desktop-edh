import { useEffect, useState, useCallback } from 'react';
import {
  useDaily,
  useParticipantIds,
  useDailyEvent,
  useLocalSessionId,
  useMeetingSessionState
} from '@daily-co/daily-react';

import { SimpleGrid } from '@mantine/core';

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
      shuffledArray[randomIndex],
      shuffledArray[currentIndex]
    ];
  }
  return shuffledArray;
}

// Believe that monarch + init have to be global
// const initGlobalMechanicsState = {
//   monarch: false,
//   initiative: false,
//   dead: false
// };

const defaultGlobalState = {
  monarchUUID: undefined,
  initiativeUUID: undefined
};

export default function Call() {
  /* If a participant runs into a getUserMedia() error, we need to warn them. */
  const [getUserMediaError, setGetUserMediaError] = useState(false);

  const [participantList, setParticipantList] = useState([]);
  const [orderedParticipantIds, setOrderedParticipantIds] = useState([]);
  const [renderedParticipantIds, setRenderedParticipantIds] = useState([]);

  // const [mechanicStates, setMechanicStates] = useState(initMechanicState);
  const [monarchPlayer, setMonarchPlayer] = useState();
  const [initiativePlayer, setInitiativePlayer] = useState();
  const [defaultDamageSource, setDefaultDamageSource] = useState('');

  //Provider object to use DailyJS stuff
  const callObject = useDaily();
  const participantIds = useParticipantIds({ sort: 'joined_at' });
  const localSessionId = useLocalSessionId();
  const { globalGameNumber, monarchUUID, initiativeUUID, turnOrderSorted, turnPlayerIndex } =
    useMeetingSessionState().data;

  
  const turnPlayerId = orderedParticipantIds[turnPlayerIndex];

  // -- Turn Order
  useEffect(() => {
    if (turnOrderSorted !== undefined) {
      setOrderedParticipantIds([...turnOrderSorted]);
    }
  }, [turnOrderSorted]);

  useEffect(() => {
    setInitiativePlayer(initiativeUUID);
  }, [initiativeUUID]);

  useEffect(() => {
    setMonarchPlayer(monarchUUID);
  }, [monarchUUID]);

  useEffect(() => {
    console.log('Ordered Participants Changed');
    let renderedArray = orderedParticipantIds;
    if (orderedParticipantIds.length > 3) {
      const half_length = Math.ceil(orderedParticipantIds.length / 2);
      const secondHalf = orderedParticipantIds
        .slice(half_length, orderedParticipantIds.length)
        .reverse();
      renderedArray = orderedParticipantIds.slice(0, half_length).concat(secondHalf);
    }

    setRenderedParticipantIds([...renderedArray]);
  }, [orderedParticipantIds]);

  /* We can use the useDailyEvent() hook to listen for daily-js events. Here's a full list
   * of all events: https://docs.daily.co/reference/daily-js/events */
  useDailyEvent(
    'camera-error',
    useCallback(() => {
      setGetUserMediaError(true);
    }, [])
  );

  // -- Effect to handle User Name Array
  useEffect(() => {
    console.log('Participants Changed');

    const newParticipantList = [];
    participantIds.forEach((id) => {
      const playerId = id === localSessionId ? 'local' : id;
      const fullParticipantObj = callObject.participants()[playerId];
      newParticipantList.push({
        userName: fullParticipantObj.user_name,
        userId: fullParticipantObj.user_id
      });
    });
    setParticipantList(newParticipantList);
    console.log('PARTICIPANTS UPDATED');

    if (orderedParticipantIds.length !== participantIds.length) {
      const updatedOrderedParticipantIds =
        turnOrderSorted !== undefined ? turnOrderSorted : orderedParticipantIds;
      for (let i = 0; i < participantIds.length; i++) {
        if (!updatedOrderedParticipantIds.includes(participantIds[i])) {
          updatedOrderedParticipantIds.push(participantIds[i]);
        }
      }
      setOrderedParticipantIds([...updatedOrderedParticipantIds]);
    } else if (orderedParticipantIds.length === 0) {
      setOrderedParticipantIds([...participantIds]);
    }
  }, [participantIds]);

  const handleFindAndSetNextPlayer = () => {
    if (orderedParticipantIds.length > 1) {
      const currentTurnPlayerIndex = turnPlayerIndex !== undefined ? turnPlayerIndex : 0;
      const nextPlayerIndex =
        currentTurnPlayerIndex + 1 >= orderedParticipantIds.length ? 0 : currentTurnPlayerIndex + 1;
      const nextPlayerUUID = orderedParticipantIds[nextPlayerIndex];
      console.log('Next Player index: ' + nextPlayerIndex);
      console.log('Next Player should be: ' + nextPlayerUUID);
      callObject.setMeetingSessionData({ turnPlayerIndex: nextPlayerIndex }, 'shallow-merge');
    }
  };

  // --Handle keydown events
  const handleKeydownEvent = (e) => {
    if (document.activeElement.tagName.toLowerCase() !== 'input' && e.key === ' ') {
      handleFindAndSetNextPlayer();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeydownEvent, false);
    return () => {
      document.removeEventListener('keydown', handleKeydownEvent, false);
    };
  }, [turnPlayerIndex, participantIds]);
  // --

  /**
   * Per User State reset
   */
  useEffect(() => {
    const userData = callObject.participants()['local'].userData;
    if (globalGameNumber !== undefined && userData.gameNumber !== globalGameNumber) {
      const updatedUserData = {
        ...userData,
        gameNumber: globalGameNumber,
        lifeTotal: 40,
        lifeLog: [],
        initiativeUUID: undefined,
        monarchUUID: undefined
      };
      callObject.setUserData(updatedUserData);
    }
  }, [globalGameNumber]);

  /**
   * Resets game setting global state trackers back to init and
   * incrememting the global game number which kicks off all clientside effects to handle user defaults
   */
  const handleReset = () => {
    const { globalGameNumber } = callObject.meetingSessionState().data;
    let newGlobalGameNumber = 0;
    if (globalGameNumber !== undefined) {
      newGlobalGameNumber = globalGameNumber + 1;
    }
    //Set turn player to player 1
    callObject.setMeetingSessionData(
      { globalGameNumber: newGlobalGameNumber, ...defaultGlobalState },
      'shallow-merge'
    );
  };

  const handleReOrder = () => {
    const participants = callObject.participants();
    const participantsList = [];
    for (let key in participants) {
      participantsList.push(participants[key].user_id);
    }
    const newOrderArray = shuffle(participantsList);
    console.log('---new order bellow---');
    console.log(newOrderArray);
    callObject.setMeetingSessionData({ turnOrderSorted: [...newOrderArray] }, 'shallow-merge');
  };

  const handleSetMonarchy = (uuid) => {
    const newMonarchUUID = monarchUUID === uuid ? undefined : uuid;
    callObject.setMeetingSessionData({ monarchUUID: newMonarchUUID }, 'shallow-merge');
  };

  const handleSetInitiative = (uuid) => {
    const newInitiativeUUID = initiativeUUID === uuid ? undefined : uuid;
    callObject.setMeetingSessionData({ initiativeUUID: newInitiativeUUID }, 'shallow-merge');
  };

  const handleDefaultDamageSource = (userName) => {
    setDefaultDamageSource(userName);
  };

  const renderCallScreen = () => (
    <div className="call">
      <SimpleGrid
        className="call-grid"
        cols={renderedParticipantIds.length <= 4 ? 2 : Math.ceil(renderedParticipantIds.length / 2)}
        spacing="xs"
        verticalSpacing="xs"
      >
        {renderedParticipantIds.map((id) => (
          <Tile
            key={id}
            id={id}
            localSessionId={localSessionId}
            isTurnPlayer={id === turnPlayerId}
            isMonarch={id === monarchPlayer}
            isInitiative={id === initiativePlayer}
            participantList={participantList}
            handleReOrder={handleReOrder}
            handleReset={handleReset}
            handleSetMonarchy={handleSetMonarchy}
            handleSetInitiative={handleSetInitiative}
            defaultDamageSource={defaultDamageSource}
            handleDefaultDamageSource={handleDefaultDamageSource}
            handleFindAndSetNextPlayer={handleFindAndSetNextPlayer}
          />
        ))}
      </SimpleGrid>
    </div>
  );

  return getUserMediaError ? <UserMediaError /> : renderCallScreen();
}
