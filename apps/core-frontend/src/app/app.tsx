import { Route, Routes, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { User } from '@nrcno/core-models';

import { UserInfo } from '../components';
import { useApi } from '../hooks';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>();
  const api = useApi();

  useEffect(() => {
    (async () => {
      if (api) {
        const response = await api.scim.getUser({ id: 'test' });
        if (response.data) {
          setUser(response.data);
        } else {
          setUser(null);
        }
      }
    })();
  }, [api, api?.scim]);

  return (
    <div>
      <div>
        <a href="https://www.nrc.no" target="_blank" rel="noreferrer">
          <img height="80px" src="/nrcLogo.svg" alt="NRC Logo" />
        </a>
      </div>
      <h1>CORE</h1>
      <div role="navigation">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/userinfo">User info</Link>
          </li>
        </ul>
      </div>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              This is the generated root route.{' '}
              <Link to="/page-2">Click here for page 2.</Link>
            </div>
          }
        />
        <Route
          path="/userinfo"
          element={
            <div>
              UserInfo
              {user && <UserInfo {...user} />}
              <Link to="/">Click here to go back to root page.</Link>
            </div>
          }
        />
      </Routes>
    </div>
  );
};
