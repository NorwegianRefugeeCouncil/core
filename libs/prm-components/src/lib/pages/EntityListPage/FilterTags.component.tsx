import {
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
} from '@chakra-ui/react';
import { EntityFiltering } from '@nrcno/core-models';

type Props = {
  filters: EntityFiltering;
  deleteFilter: (filter: string) => void;
};

export const FilterTags: React.FC<Props> = ({ filters, deleteFilter }) => {
  const formatting = (filter: any) =>
    filter.toLocaleDateString ? filter.toLocaleDateString() : filter.toString();
  return (
    <Wrap>
      {Object.keys(filters).map((filter: string) => (
        <WrapItem key={filter}>
          <Tag
            key={filters[filter as keyof EntityFiltering]?.toString()}
            borderRadius="4"
            variant="solid"
            colorScheme="neutrals"
          >
            <TagLabel>
              {filter}: {formatting(filters[filter as keyof EntityFiltering])}
            </TagLabel>
            <TagCloseButton
              data-testid="close-button"
              onClick={() => deleteFilter(filter)}
            />
          </Tag>
        </WrapItem>
      ))}
    </Wrap>
  );
};
