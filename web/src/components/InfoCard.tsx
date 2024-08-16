import React from 'react';
import { Text } from '@mantine/core';
import { IconBriefcase, IconBuildingBank, IconCalendarEvent, IconCashBanknote, IconFlag, IconGenderBigender } from '@tabler/icons-react';

interface Props {
  icon: string;
  label: string;
}

const iconMap: { [key: string]: JSX.Element } = {
  gender: <IconGenderBigender />,
  birthdate: <IconCalendarEvent />,
  nationality: <IconFlag />,
  bank: <IconBuildingBank />,
  cash: <IconCashBanknote />,
  job: <IconBriefcase />
};

const InfoCard: React.FC<Props> = (props) => {
  const icon = iconMap[props.icon];

  return (
    <div className='character-card-charinfo'>
      {icon}
      <Text size="sm">{props.label}</Text>
    </div>
  );
};

export default InfoCard;