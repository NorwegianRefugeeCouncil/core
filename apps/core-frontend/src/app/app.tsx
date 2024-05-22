import { Outlet } from 'react-router-dom';
import { Grid, GridItem } from '@chakra-ui/react';

import { Navigation, Header } from '../components';
import { useUserContext } from '../contexts';

export const App: React.FC = () => {
  const { me } = useUserContext();

  return (
    <Grid
      templateAreas={`"header header"
                  "menu main"`}
      gridTemplateRows="auto 1fr"
      gridTemplateColumns="8rem 1fr"
      color="neutrals.500"
      height={'100vh'}
    >
      <GridItem
        p="2"
        bg="secondary.500"
        area="header"
        color="white"
        maxW="100vw"
      >
        <Header user={me.data} />
      </GridItem>
      <GridItem p="4" bg="bgLight" area="menu">
        <Navigation />
      </GridItem>
      <GridItem m="4" area="main" overflowY="auto">
        <Outlet />
      </GridItem>
    </Grid>
  );
};
