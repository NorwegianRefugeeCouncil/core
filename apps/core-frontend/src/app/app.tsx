import { Outlet } from 'react-router-dom';
import { Grid, GridItem, Container } from '@chakra-ui/react';

import { Navigation, Header } from '../components';
import { useUserContext } from '../contexts';

export const App: React.FC = () => {
  const { me } = useUserContext();

  return (
    <Grid
      templateAreas={`"header header"
                  "menu main"`}
      gridTemplateRows="auto 1fr"
      gridTemplateColumns="auto 1fr"
      h="100%"
      w="100%"
      color="neutrals.500"
      position="fixed"
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
      <GridItem p="2" bg="bgLight" area="menu">
        <Navigation />
      </GridItem>
      <GridItem p="10" area="main" maxW="100%">
        <Container m={0} p={0} minWidth={'100%'}>
          <Outlet />
        </Container>
      </GridItem>
    </Grid>
  );
};
