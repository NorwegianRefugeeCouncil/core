import { VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export const Navigation: React.FC = () => {
  return (
    <VStack>
      <Link to="/prm/individuals">Individuals</Link>
      <Link to="/users">Users</Link>
    </VStack>
  );
};
