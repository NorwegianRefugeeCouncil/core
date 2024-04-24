import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { Grid, GridItem } from '@chakra-ui/react';

import { Navigation, Header } from '../components';
import { useUserContext } from '../contexts';

export const App: React.FC = () => {
  const { me } = useUserContext();

  useEffect(() => {
    (async () => {
      if (me) {
        await me.getMe();
      }
    })();
  }, [Boolean(me)]);

  return (
    <Grid
      templateAreas={`"header header"
                  "nav main"`}
      gridTemplateRows="50px 1fr"
      gridTemplateColumns="150px 1fr"
      h="100vh"
      color="neutrals.500"
      fontWeight="bold"
    >
      <GridItem pl="2" bg="secondary.500" area="header" color="white">
        <Header user={me.data} />
      </GridItem>
      <GridItem pl="2" bg="bgLight" area="nav">
        <Navigation />
      </GridItem>
      <GridItem pl="2" area="main">
        <Outlet />
      </GridItem>
    </Grid>
  );
};
