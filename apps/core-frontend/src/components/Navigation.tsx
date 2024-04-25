import { HStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export const Navigation: React.FC = () => {
  return (
    <HStack>
      <Link to="/prm/participants">Participants</Link>
    </HStack>
  );
};