import { ArrowDownIcon, ArrowUpIcon, HamburgerIcon } from '@chakra-ui/icons';
import { IconButton } from '@chakra-ui/react';
import { Sorting, SortingDirection } from '@nrcno/core-models';

type Props = {
  direction: SortingDirection;
  field: Sorting['sort'];
  isActive: boolean;
  handleClick: (sorting: Sorting) => void;
};

export const SortIcon: React.FC<Props> = ({
  direction,
  field,
  handleClick,
  isActive,
}) => {
  const iconMap = {
    [SortingDirection.Asc]: <ArrowUpIcon />,
    [SortingDirection.Desc]: <ArrowDownIcon />,
    [SortingDirection.None]: <HamburgerIcon />,
  };

  return (
    <IconButton
      variant="outline"
      aria-label={`Sort ${field}`}
      onClick={() => handleClick({ sort: field, direction })}
      icon={iconMap[isActive ? direction : SortingDirection.None]}
      size="xs"
    />
  );
};
