import React from 'react'
import {render} from 'react-dom'
import App from './App'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { theme, NativeBaseProvider} from '@nrcno/nrc-design-system';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
  },
]);

const root = document.getElementById('root');
render(
  <React.StrictMode>
    <NativeBaseProvider theme={theme}>
      <RouterProvider router={router} />
    </NativeBaseProvider>
  </React.StrictMode>, root
)
