import { Heading } from '@chakra-ui/react';
import { EntityType } from '@nrcno/core-models';

import { config } from '../../config';
import { Section } from '../../components/Section.component';

import styles from './EntityDetailPage.module.scss';

type Props = unknown;

export const EntityDetailPage: React.FC<Props> = () => {
  const entityType: EntityType = EntityType.Participant;
  const entityUIConfig = config[entityType].detail;

  return (
    <form className={styles['container']}>
      <Heading>EntityDetailPage</Heading>
      {entityUIConfig.sections.map((section) => (
        <Section key={section.title} section={section} />
      ))}
      <button type="submit">Save</button>
    </form>
  );
};
