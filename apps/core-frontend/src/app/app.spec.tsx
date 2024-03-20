import { render } from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';

import App from './app';
import { NativeBaseProvider, theme } from '@nrcno/nrc-design-system';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <NativeBaseProvider theme={theme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </NativeBaseProvider>,
    );
    expect(baseElement).toBeTruthy();
  });

  it('should have a greeting as the title', () => {
    const { getByText } = render(
      <NativeBaseProvider theme={theme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </NativeBaseProvider>,
    );
    expect(getByText(/Welcome core-frontend/gi)).toBeTruthy();
  });
});
