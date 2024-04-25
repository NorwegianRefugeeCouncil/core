import { Heading } from '@chakra-ui/react';

import { Section } from '../../components/Section.component';
import { useEntityDetailPage } from '../../hooks/useEntityDetailPage.hook';

import styles from './EntityDetailPage.module.scss';

type Props = unknown;

export const EntityDetailPage: React.FC<Props> = () => {
  const {
    entityType,
    config,
    isLoading,
    isError,
    isSuccess,
    error,
    handleSubmit,
  } = useEntityDetailPage();

  return (
    <>
      {isError && <div>{error?.message}</div>}
      {isSuccess && <div>Success</div>}
      <form className={styles['container']} onSubmit={handleSubmit}>
        <Heading>New {entityType}</Heading>
        {config.sections.map((section) => (
          <Section key={section.title} section={section} />
        ))}
        <button type="submit">Save</button>
      </form>
    </>
  );
};
