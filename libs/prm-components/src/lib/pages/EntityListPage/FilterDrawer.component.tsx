import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
} from '@chakra-ui/react';
import { EntityFiltering, EntityType } from '@nrcno/core-models';

import { EntityFilterForm } from '../../components';
import { EntityUIConfig } from '../../config';

type Props = {
  entityType: EntityType;
  filterConfig: EntityUIConfig['filtering'];
  filters: EntityFiltering;
  isOpen: boolean;
  onClose: () => void;
  parseFilters: (data: EntityFiltering) => void;
};
export const FilterDrawer: React.FC<Props> = ({
  entityType,
  filterConfig,
  filters,
  isOpen,
  onClose,
  parseFilters,
}) => (
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
          onCancel={onClose}
          onSubmit={parseFilters}
        />
      </DrawerBody>
    </DrawerContent>
  </Drawer>
);
