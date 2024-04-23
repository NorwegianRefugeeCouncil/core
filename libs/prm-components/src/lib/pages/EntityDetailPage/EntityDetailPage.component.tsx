import { Heading } from '@chakra-ui/react';

import styles from './EntityDetailPage.module.scss';

type Props = unknown;

export const EntityDetailPage: React.FC<Props> = () => {
  return (
    <div className={styles['container']}>
      <Heading>EntityDetailPage</Heading>
    </div>
  );
};
