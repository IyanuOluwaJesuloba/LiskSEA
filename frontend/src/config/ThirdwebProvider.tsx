import React from 'react';
import { ThirdwebProvider as ThirdwebProviderCore } from 'thirdweb/react';

type ThirdwebProviderProps = {
  children: React.ReactNode;
};

export const ThirdwebProvider = ({ children }: ThirdwebProviderProps) => {
  return (
    <ThirdwebProviderCore>
      {children}
    </ThirdwebProviderCore>
  );
};
