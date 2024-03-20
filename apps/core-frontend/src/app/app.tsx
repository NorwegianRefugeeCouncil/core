import { Logo, Text, Box } from '@nrcno/nrc-design-system';
import { Logos } from '@nrcno/nrc-design-system/lib/esm/types/icons';
import { Route, Routes, Link } from 'react-router-dom';

export function App() {
  return (
    <div>
      <Box>
        <a href="https://www.nrc.no" target="_blank" rel="noreferrer">
          <Logo height="80px" name={Logos.Horizontal} />
        </a>
      </Box>
      <Text variant="heading">CORE</Text>
      <br />
      <div role="navigation">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/page-2">Page 2</Link>
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
          path="/page-2"
          element={
            <div>
              <Link to="/">Click here to go back to root page.</Link>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
