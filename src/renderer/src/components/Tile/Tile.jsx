import './Tile.css';
import {
  useDaily,
  useLocalSessionId,
  DailyVideo,
  useParticipantProperty
} from '@daily-co/daily-react';
import React, { useEffect, useState } from 'react';
import TileOverlay from './TileOverlay';
import { ADD_OPERATOR } from './TileConstants';

export default function Tile(props) {
  const { id, isTurnPlayer, ...rest } = props;
  const callObject = useDaily();

  const localSessionId = useLocalSessionId();

  const [lifeTotal, lifeLog, userName] = useParticipantProperty(id, [
    'userData.lifeTotal',
    'userData.lifeLog',
    'user_name'
  ]);
  const [lifeLogTableArray, setLifeLogTableArray] = useState();

  useEffect(() => {
    console.log(lifeLog);
    const lifeTableData = {};
    if (lifeLog) {
      //Create a bucket for all users with their damage #s
      lifeLog.forEach((log) => {
        const existingData = lifeTableData[log.damageSource];
        const damageTakenValue = log.operator === ADD_OPERATOR ? -Math.abs(log.value) : log.value;
        if (existingData !== undefined) {
          console.log(existingData);
          lifeTableData[log.damageSource].damageTaken =
            lifeTableData[log.damageSource].damageTaken + damageTakenValue;
        } else {
          lifeTableData[log.damageSource] = { damageTaken: damageTakenValue };
        }
      });
      const lifeTableDataArray = [];
      for (const [key, value] of Object.entries(lifeTableData)) {
        lifeTableDataArray.push([key, value.damageTaken]);
      }
      setLifeLogTableArray(lifeTableDataArray);
    }
  }, [lifeLog, lifeTotal]);

  const isLocal = localSessionId === id;

  let containerCssClasses = 'tile-video';
  if (isTurnPlayer) {
    containerCssClasses += ' turn-player';
  }

  /* If a participant's video is muted, hide their video and
  add a different background color to their tile. */

  const updateLifeTotal = (value, damageSource, operator) => {
    //TODO damagesource should prob us an id:username map
    const userData = callObject.participants()['local'].userData;
    let updatedLifeTotal;
    console.log(value);
    if (operator === ADD_OPERATOR) {
      updatedLifeTotal = parseInt(lifeTotal) + parseInt(value);
    } else {
      updatedLifeTotal = parseInt(lifeTotal) - parseInt(value);
    }
    const lifeLogEntry = { value: value, damageSource: damageSource, operator: operator };
    const newLifeLog = lifeLog === null ? [] : lifeLog;
    newLifeLog.push(lifeLogEntry);

    const updatedUserData = { ...userData, lifeTotal: updatedLifeTotal, lifeLog: newLifeLog };
    callObject.setUserData(updatedUserData);
  };

  return (
    <div className={containerCssClasses}>
      <TileOverlay
        isLocal={isLocal}
        updateLifeTotal={updateLifeTotal}
        userName={userName}
        lifeTotal={lifeTotal}
        lifeLogTableArray={lifeLogTableArray}
        {...props}
      />
      <DailyVideo className="video-screen" automirror sessionId={id} type="video" />
    </div>
  );
}
