import './Tile.css';
import { useDaily, DailyVideo, useParticipantProperty } from '@daily-co/daily-react';
import { Tooltip, ActionIcon } from '@mantine/core';
import { IconReplaceUser } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import TileOverlay from './TileOverlay';
import { ADD_OPERATOR } from './TileConstants';

export default function Tile(props) {
  const {
    id,
    localSessionId,
    turnPlayerId,
    handleDefaultDamageSource,
    handleFindAndSetNextPlayer
  } = props;
  const isLocal = localSessionId === id;
  const [lifeLogTableArray, setLifeLogTableArray] = useState();
  let containerCssClasses = 'tile-video';
  if (turnPlayerId === id) {
    containerCssClasses += ' turn-player';
  }

  const callObject = useDaily();
  const [lifeTotal, lifeLog, userName] = useParticipantProperty(id, [
    'userData.lifeTotal',
    'userData.lifeLog',
    'user_name'
  ]);

  useEffect(() => {
    console.log(lifeLog);
    const lifeTableData = {};
    if (lifeLog) {
      //Create a bucket for all users with their damage #s
      lifeLog.forEach((log) => {
        const existingData = lifeTableData[log.damageSource];
        const damageTakenValue = log.operator === ADD_OPERATOR ? -Math.abs(log.value) : log.value;
        if (existingData !== undefined) {
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

  const updateLifeTotal = (value, damageSource, operator) => {
    //TODO damagesource should prob us an id:username map
    const userData = callObject.participants()['local'].userData;
    let updatedLifeTotal;
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

    //Reset for eventHandler
    handleDefaultDamageSource('');
  };

  const onVideoClick = () => {
    handleDefaultDamageSource(userName);
  };

  const onTurnPass = () => {
    handleFindAndSetNextPlayer();
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
      <DailyVideo
        className="video-screen"
        automirror
        sessionId={id}
        type="video"
        onClick={onVideoClick}
      />
      {turnPlayerId === localSessionId && id === localSessionId && (
        <div className="pass-turn-btn">
          <Tooltip label="Pass Turn">
            <ActionIcon
              size="md"
              variant="filled"
              color="orange"
              aria-label="Settings"
              onClick={onTurnPass}
            >
              <IconReplaceUser style={{ width: '70%', height: '70%' }} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

Tile.propTypes = {
  id: String,
  localSessionId: String,
  turnPlayerId: String,
  handleDefaultDamageSource: Function,
  handleFindAndSetNextPlayer: Function
};
