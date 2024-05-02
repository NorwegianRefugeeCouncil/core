import { Flex } from '@chakra-ui/react';

import { Section as SectionType } from '../config';

import { Field } from './Fields';

type Props = {
  section: SectionType;
};

export const Section: React.FC<Props> = ({ section }) => {
  return (
    <Flex direction="column" gap={4}>
      {section.fields.map((field, i) => (
        <Field
          key={`${section.title}_${field.path.join('.')}_${i}`}
          config={field}
        />
      ))}
    </Flex>
  );
};
