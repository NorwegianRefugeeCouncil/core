import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from '@chakra-ui/react';
import { EntityFiltering, EntityType } from '@nrcno/core-models';

import { EntityUIConfig } from '../config';

import { EntityFilterForm } from '.';

type Props = {
  applyFilters: (data: EntityFiltering) => void;
  clearFilters: () => void;
  entityType: EntityType;
  filterConfig: EntityUIConfig['filtering'];
  filters: EntityFiltering | null;
  isOpen: boolean;
  onClose: () => void;
};
export const FilterDrawer: React.FC<Props> = ({
  applyFilters,
  clearFilters,
  entityType,
  filterConfig,
  filters,
  isOpen,
  onClose,
}) => {
  const handleClear = () => {
    clearFilters();
    onClose();
  };
  return (
    <Drawer placement="right" onClose={onClose} isOpen={isOpen} size={'md'}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Search</DrawerHeader>
        <DrawerBody>
          <EntityFilterForm
            config={filterConfig}
            filters={filters}
            id={`${entityType}_filter_form`}
            onClear={handleClear}
            onSubmit={applyFilters}
          />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
