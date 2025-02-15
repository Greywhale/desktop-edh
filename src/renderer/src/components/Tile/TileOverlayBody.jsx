import { useState, useEffect } from 'react';
import './TileOverlay.css';
import {
  ActionIcon,
  Tooltip,
  NumberInput,
  Grid,
  Combobox,
  TextInput,
  useCombobox,
  rem,
  Table,
  Switch
} from '@mantine/core';
import {
  IconArrowsShuffle,
  IconRestore,
  IconChevronDown,
  IconMinus,
  IconPlus,
  IconArrowRight,
  IconCrown,
  IconMatchstick
} from '@tabler/icons-react';

export default function TileOverlayBody({
  handleReset,
  handleReOrder,
  handleSubtract,
  handlePlus,
  participantList,
  lifeLogTableArray,
  handleTakeMonarchy,
  handleTakeInitiative,
  isInitiative,
  isMonarch,
  isLocal,
  defaultDamageSource
}) {
  const combobox = useCombobox();
  const [changeLifeAmt, setChangeLifeAmt] = useState(0);
  const [damageSource, setDamageSource] = useState(defaultDamageSource);
  const [isMinusOperator, setIsMinusOperator] = useState(true);

  useEffect(() => {
    setDamageSource(defaultDamageSource);
  }, [defaultDamageSource]);

  //need to fix this to have uuids and usernames
  const shouldFilterOptions = !participantList.some((item) => item.userName === damageSource);
  const filteredOptions = shouldFilterOptions
    ? participantList.filter((item) =>
        item.userName.toLowerCase().includes(damageSource.toLowerCase().trim())
      )
    : participantList;

  const options = filteredOptions.map((item) => (
    <Combobox.Option value={item.userName} key={item.userId}>
      {item.userName}
    </Combobox.Option>
  ));

  const tableData = {
    head: ['Player', 'Taken By'],
    body: lifeLogTableArray
  };

  const onLifeInputChange = (value) => {
    setChangeLifeAmt(value);
  };

  const onEnterLifeChange = () => {
    if (changeLifeAmt > 0) {
      if (isMinusOperator) {
        handleSubtract(changeLifeAmt, damageSource);
      } else {
        handlePlus(changeLifeAmt, damageSource);
      }
      setChangeLifeAmt(0);
      setDamageSource('');
      setIsMinusOperator(true);
    } else {
      //TODO Error state
    }
  };

  const onKeyPress = (e) => {
    //enter key
    if (e.charCode === 13) {
      onEnterLifeChange();
    }
  };

  const chevron = (
    <IconChevronDown
      style={{ width: rem(16), height: rem(16) }}
      stroke={1.5}
      onClick={() => combobox.openDropdown()}
    />
  );
  return (
    <div>
      {isLocal ? (
        <Grid grow gutter="xs" className="dropdown-area">
          <Grid.Col span={1.5}>
            <Tooltip label="Reset Game">
              <ActionIcon size="md" variant="filled" color="gray" aria-label="Settings">
                <IconRestore
                  style={{ width: '70%', height: '70%' }}
                  stroke={1.5}
                  onClick={handleReset}
                />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Re-order Game">
              <ActionIcon
                className="increase-life-button"
                size="md"
                variant="filled"
                color="gray"
                aria-label="Settings"
              >
                <IconArrowsShuffle
                  style={{ width: '70%', height: '70%' }}
                  stroke={1.5}
                  onClick={handleReOrder}
                />
              </ActionIcon>
            </Tooltip>
          </Grid.Col>
          <Grid.Col span={0.5}>
            <Tooltip label="Take Initiative">
              <ActionIcon
                variant={isInitiative ? 'filled' : 'default'}
                onClick={() => handleTakeInitiative()}
                aria-label="Monarchy"
              >
                <IconMatchstick style={{ width: '70%', height: '70%' }} stroke={1.5} />
              </ActionIcon>
            </Tooltip>
          </Grid.Col>
          <Grid.Col span={0.5}>
            <Tooltip label="Take Monarchy">
              <ActionIcon
                variant={isMonarch ? 'filled' : 'default'}
                onClick={() => handleTakeMonarchy()}
                aria-label="Monarchy"
              >
                <IconCrown style={{ width: '70%', height: '70%' }} stroke={1.5} />
              </ActionIcon>
            </Tooltip>
          </Grid.Col>
          <Grid.Col span={0.5}>
            <Switch
              checked={isMinusOperator}
              onChange={() => setIsMinusOperator(!isMinusOperator)}
              size="lg"
              color="dark.4"
              offLabel={<IconPlus size={16} stroke={2.5} color="var(--mantine-color-green-4)" />}
              onLabel={<IconMinus size={16} stroke={2.5} color="var(--mantine-color-red-6)" />}
            />
          </Grid.Col>
          <Grid.Col span={1}>
            <NumberInput
              size="xs"
              className="life-total-input"
              placeholder="##"
              onChange={onLifeInputChange}
              value={changeLifeAmt}
              defaultValue={''}
              allowNegative={false}
              onKeyPress={onKeyPress}
              stepHoldDelay={500}
              stepHoldInterval={100}
            />
          </Grid.Col>

          <Grid.Col span={3}>
            <Combobox
              onOptionSubmit={(optionValue) => {
                setDamageSource(optionValue);
                combobox.closeDropdown();
              }}
              store={combobox}
            >
              <Combobox.Target>
                <TextInput
                  size="xs"
                  placeholder="Damage Source"
                  value={damageSource}
                  rightSection={chevron}
                  onChange={(event) => {
                    setDamageSource(event.currentTarget.value);
                    combobox.openDropdown();
                    combobox.updateSelectedOptionIndex();
                  }}
                  onClick={() => combobox.openDropdown()}
                  onFocus={() => combobox.openDropdown()}
                  onBlur={() => combobox.closeDropdown()}
                  onKeyPress={onKeyPress}
                />
              </Combobox.Target>

              <Combobox.Dropdown>
                <Combobox.Options>
                  {options.length === 0 ? <Combobox.Empty>Nothing found</Combobox.Empty> : options}
                </Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>
          </Grid.Col>

          <Grid.Col span={0.5}>
            <Tooltip label="Enter Life Change">
              <ActionIcon size="md" variant="filled" color="green" aria-label="Settings">
                <IconArrowRight
                  style={{ width: '70%', height: '70%' }}
                  stroke={1.5}
                  onClick={onEnterLifeChange}
                />
              </ActionIcon>
            </Tooltip>
          </Grid.Col>
          <Grid.Col span={10}>
            <Table highlightOnHover withTableBorder withColumnBorders data={tableData} />
          </Grid.Col>
        </Grid>
      ) : (
        <Grid grow gutter="xs" className="dropdown-area">
          <Table highlightOnHover withTableBorder withColumnBorders data={tableData} />
        </Grid>
      )}
    </div>
  );
}

TileOverlayBody.propTypes = {
  handleReset: Function,
  handleReOrder: Function,
  handleSubtract: Function,
  handlePlus: Function,
  participantList: Array,
  lifeLogTableArray: Array,
  handleTakeMonarchy: Function,
  handleTakeInitiative: Function,
  isInitiative: Boolean,
  isMonarch: Boolean,
  isLocal: Boolean,
  defaultDamageSource: String | undefined
};
