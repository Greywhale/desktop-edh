import React, { useState } from 'react';
import Username from '../Username/Username';
import './TileOverlay.css';
import { ActionIcon, Tooltip, NumberInput, Grid, Text, Popover, Collapse, Box  } from '@mantine/core';
import { IconCaretUp, IconCaretDown, IconArrowsShuffle, IconCrown, IconMatchstick } from '@tabler/icons-react';
import {
useLocalSessionId,
useParticipantProperty,
} from '@daily-co/daily-react';
import { useDisclosure } from '@mantine/hooks';
import {ADD_OPERATOR, SUBTRACT_OPERATOR} from './TileConstants';
import TileOverlayBody from './TileOverlayBody'

//TODO Turn lifeTotal into dictionary of userstuff
export default function TileOverlay(props) {
  const { id, updateLifeTotal, participantList, userName, lifeTotal, isMonarch, isInitiative, handleSetMonarchy, handleSetInitiative,  ...rest } = props
  const [changeLifeInput, setChangeLifeInput] = useState();
  const [opened, { toggle }] = useDisclosure(false);

//  const [lifeTotal, userName] = useParticipantProperty(id, ['userData.lifeTotal', 'user_name']);

  const handlePlus = (value, damageSource) => {
    updateLifeTotal(parseInt(value), damageSource, ADD_OPERATOR);
  }

  const handleSubtract = (value, damageSource) => {
    updateLifeTotal(parseInt(value), damageSource, SUBTRACT_OPERATOR);
  }

  const handleTakeMonarchy = () => {
    handleSetMonarchy(id);
  }

  const handleTakeInitiative = () => {
    handleSetInitiative(id);
  }

  let lifeTotalHexCode = "rgba(12, 179, 0, 1)";
  if(lifeTotal < 10) {
    lifeTotalHexCode = "red";
  } else if (lifeTotal < 20) {
    lifeTotalHexCode = " yellow";
  }

  return (
  <div className="overlay" >
  <Grid grow gutter="xs" onClick={toggle}>
  <Grid.Col className="life-total-display" span={2.5}>
  <Text size="lg" ta="center">{userName}</Text>
  </Grid.Col>
  <Grid.Col span={.5}>
  {isMonarch && (<IconCrown size={16} stroke={2.5} color="yellow" />)}

  </Grid.Col>
  <Grid.Col span={.5}>
  {isInitiative && (<IconMatchstick className="visually-hidden" size={16} stroke={2.5} color="red" />)}
  </Grid.Col>
  <Grid.Col className="life-total-display" span={2.5}>
  <Text ta="center" size="lg"
  fw={900}
  c={lifeTotalHexCode}>{lifeTotal}</Text>
  </Grid.Col>
  </Grid>

  <Collapse in={opened}>
  <TileOverlayBody
  handleSubtract={handleSubtract}
  handlePlus={handlePlus}
  handleTakeMonarchy={handleTakeMonarchy}
  handleTakeInitiative={handleTakeInitiative}
isMonarch={isMonarch}
isInitiative={isInitiative}
  {...props}
/>
  </Collapse>


  </div>
  );
}
