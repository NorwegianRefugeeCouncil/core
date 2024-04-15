import { Route, Routes, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Layout, Menu, Flex, Typography, Image, App as AntApp } from 'antd';

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
        const response = await api.users.getMe();
        console.log('RESPONSE, APP tsx', response);
        // if (response.data) {
        //   setUser(response.data);
        // } else {
        //   setUser(null);
        // }
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
          <Flex justify="flex-start" align="center" flex={'1rem 1'}>
            <Image
              src="/nrcLogo.svg"
              alt="NRC Logo"
              preview={false}
              width="2rem"
            />
            <Typography.Title style={{ color: 'white', margin: '0 0 0 1rem' }}>
              CORE
            </Typography.Title>
            <div className="test">sdfjlds</div>
          </Flex>
        </Header>
        <Layout style={{ height: '100%' }}>
          <Content style={{ height: '100%' }}>
            <Flex style={{ height: '100%' }}>
              <Sider width="10rem" style={{ height: '100%' }}>
                <Menu
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
                  path="/"
                  element={<div>This is the generated root route. </div>}
                />
                <Route
                  path="/user"
                  element={
                    <div>
                      UserInfo
                      <br />
                      {user && <UserInfo {...user} />}
                    </div>
                  }
                />
              </Routes>
            </Flex>
          </Content>
        </Layout>
      </Layout>
    </AntApp>
  );
};
