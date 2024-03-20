import { Route, Routes, Link } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <div>
      <div>
        <a href="https://www.nrc.no" target="_blank" rel="noreferrer">
          <img height="80px" src="/nrcLogo.svg" alt="NRC Logo" />
        </a>
      </div>
      <h1>CORE</h1>
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
};

export default App;
