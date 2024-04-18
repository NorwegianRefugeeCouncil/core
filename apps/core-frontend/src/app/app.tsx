import { Route, Routes, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Layout, Menu, Flex, Typography, Image, App as AntApp } from 'antd';
import { ZodError } from 'zod';

import { User } from '@nrcno/core-models';

import { UserInfo } from '../components';
import { useApi } from '../hooks';

import appStyle from './app.module.scss';

export const App: React.FC = () => {
  const { Header, Sider, Content } = Layout;

  const [user, setUser] = useState<User | null>();
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
    <AntApp>
      <Layout style={appStyle}>
        <Header
          style={{
            paddingInline: '2rem',
          }}
        >
          <Flex>
            <Flex justify="flex-start" align="center" flex={'1rem 1'}>
              <Image
                src="/nrcLogo.svg"
                alt="NRC Logo"
                preview={false}
                width="2rem"
              />
              <Typography.Title
                style={{ color: 'white', margin: '0 0 0 1rem' }}
              >
                CORE
              </Typography.Title>
            </Flex>
            {user && <UserInfo {...user} />}
          </Flex>
        </Header>
        <Layout>
          <Content>
            <Flex>
              <Sider width="10rem">
                <Menu
                  rootClassName="test"
                  items={[
                    {
                      key: 'participants',
                      label: <Link to="/participants">Participants</Link>,
                    },
                    { key: 'user', label: <Link to="/user">Users</Link> },
                  ]}
                />
              </Sider>
              <Routes>
                <Route
                  path="/participants"
                  element={<div className="test">Participants </div>}
                />
                <Route path="/user" element={<div>Users</div>} />
              </Routes>
            </Flex>
          </Content>
        </Layout>
      </Layout>
    </AntApp>
  );
};
