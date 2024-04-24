import { Heading } from '@chakra-ui/react';
import { useLoaderData } from 'react-router-dom';

import { Section } from '../../components/Section.component';

import styles from './EntityDetailPage.module.scss';
import { CreateEntityLoaderData } from './EntityDetailPage.loader';

type Props = unknown;

export const EntityDetailPage: React.FC<Props> = () => {
  // This typing is bad but seems to be the way to use react router
  const { entityType, config } = useLoaderData() as CreateEntityLoaderData;

  return (
    <form className={styles['container']}>
      <Heading>New {entityType}</Heading>
      {config.sections.map((section) => (
        <Section key={section.title} section={section} />
      ))}
      <button type="submit">Save</button>
    </form>
  );
};
