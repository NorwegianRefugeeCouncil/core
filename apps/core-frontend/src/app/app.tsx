import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ZodError } from 'zod';
import { Grid, GridItem } from '@chakra-ui/react';

import { User } from '@nrcno/core-models';

import { Navigation, Header } from '../components';
import { useApi } from '../hooks';

export const App: React.FC = () => {
  const [user, setUser] = useState<User>();
  const api = useApi();

  useEffect(() => {
    (async () => {
      if (api) {
        try {
          const me = await api.users.getMe();
          setUser(me);
        } catch (e: any) {
          if (e instanceof ZodError) {
            console.log('Unexpected user schema');
          }
        }
      }
    })();
  }, [api, api?.users]);

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
        <Header user={user} />
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
