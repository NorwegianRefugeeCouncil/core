import * as React from 'react';

export const PrmContext = React.createContext<{}>({});

export const usePrm = () => React.useContext(PrmContext);

export const PrmProvider = PrmContext.Provider;

export const PrmConsumer = PrmContext.Consumer;

export const Prm = ({ children }: { children: React.ReactNode }) => {
  return <PrmProvider value={{}}>{children}</PrmProvider>;
};
