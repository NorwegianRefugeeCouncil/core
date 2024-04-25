import { Heading } from '@chakra-ui/react';

import { Section } from '../../components/Section.component';
import { useEntityDetailPage } from '../../hooks/useEntityDetailPage.hook';

import styles from './EntityDetailPage.module.scss';

type Props = {
  mode: 'create' | 'read' | 'edit';
};

export const EntityDetailPage: React.FC<Props> = ({ mode }) => {
  const { entityType, config, isLoading, isError, isSuccess, error, onSubmit } =
    useEntityDetailPage(mode);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const target = event.target as HTMLFormElement;
    if (onSubmit) onSubmit(target);
  };

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
