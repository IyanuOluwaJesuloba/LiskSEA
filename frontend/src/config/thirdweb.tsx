import { ReactNode } from 'react';
import { ThirdwebProvider as ThirdwebProviderCore } from 'thirdweb/react';
import { client, liskSepolia } from './thirdweb';

type ThirdwebProviderProps = {
  children: ReactNode;
};

export const ThirdwebProvider = ({ children }: ThirdwebProviderProps) => (
  <ThirdwebProviderCore
    client={client}
    activeChain={liskSepolia}
    supportedChains={[liskSepolia]}
  >
    {children}
  </ThirdwebProviderCore>
);