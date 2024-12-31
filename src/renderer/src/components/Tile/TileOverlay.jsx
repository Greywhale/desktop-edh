import React, { useState } from 'react';
import Username from '../Username/Username';
import './TileOverlay.css';
import { ActionIcon, Tooltip, NumberInput, Grid, Text, Popover  } from '@mantine/core';
import { IconCaretUp, IconCaretDown, IconArrowsShuffle } from '@tabler/icons-react';
import {
useLocalSessionId,
useParticipantProperty,
} from '@daily-co/daily-react';

export default function TileOverlay({ id, isLocal, updateLifeTotal, handleReOrder }) {
  const [changeLifeInput, setChangeLifeInput] = useState();

  const [lifeTotal, userName] = useParticipantProperty(id, ['userData.lifeTotal', 'user_name']);

  const onPlus = () => {
    //Todo strip e out
    if(changeLifeInput){
      updateLifeTotal(parseInt(lifeTotal) + parseInt(changeLifeInput));
      setChangeLifeInput("");
    }
  }

  const onSubtract = () => {
    //Todo strip e out
    if(changeLifeInput){
      updateLifeTotal(parseInt(lifeTotal) - parseInt(changeLifeInput));
      setChangeLifeInput("");
    }
  }

  const onReorder = () => {
    handleReOrder();
  }

  const handleInputChange = (value) => {
    setChangeLifeInput(value);
  };

  let overlayClassName = "overlay";
  if(lifeTotal < 10) {
    overlayClassName += " critical";
  } else if (lifeTotal < 20) {
    overlayClassName += " warning";
  }

  return (
  <div className={overlayClassName}>
  <Popover position="bottom" withArrow shadow="md" disabled={!isLocal} offset={0}>

  <Popover.Target>
  <Grid grow gutter="xs">
  <Grid.Col className="life-total-display" span={2.5}>
  <Text size="lg" ta="center">{userName}</Text>
  </Grid.Col>
  <Grid.Col className="life-total-display" span={2.5}>
  <Text size="lg" ta="center">{lifeTotal}</Text>
  </Grid.Col>
  </Grid>
  </Popover.Target>

  <Popover.Dropdown className="player-options">
  <Grid grow gutter="xs">
  <Grid.Col span={1}>
  <Tooltip label="ReOrder Game">
  <ActionIcon size="md" variant="filled" color="gray" aria-label="Settings">
  <IconArrowsShuffle style={{ width: '70%', height: '70%' }} stroke={1.5} onClick={onReorder} />
  </ActionIcon>
  </Tooltip>
  </Grid.Col>

  <Grid.Col span="auto">
  <NumberInput
  size="xs"
  className="life-total-input"
  onChange={handleInputChange} value={changeLifeInput} defaultValue={""}
  allowNegative={false}
  />
  </Grid.Col>

  <Grid.Col span={3.5}>
  <ActionIcon variant="gradient" gradient={{ from: 'rgba(176, 0, 0, 1)', to: 'red', deg: 90 }} aria-label="Settings">
  <IconCaretDown style={{ width: '70%', height: '70%' }} stroke={1.5} onClick={onSubtract}/>
  </ActionIcon>
  <ActionIcon className="increase-life-button" variant="gradient" gradient={{ from: 'lime', to: 'teal', deg: 90 }} aria-label="Settings">
  <IconCaretUp style={{ width: '70%', height: '70%' }} stroke={1.5} onClick={onPlus}/>
  </ActionIcon>
  </Grid.Col>

  </Grid>
  </Popover.Dropdown>

  </Popover>

  </div>
  );
}
