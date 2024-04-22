import { Section as SectionType } from '../config';

import { Field } from './Fields';

type Props = {
  section: SectionType;
};

export const Section: React.FC<Props> = ({ section }) => (
  <div>
    <h2>{section.title}</h2>
    {section.fields.map((field) => (
      <Field key={field.path.join('.')} field={field} />
    ))}
  </div>
);
