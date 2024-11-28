import '@rainbow-me/rainbowkit/styles.css';
import './index.css';
import React from 'react';



import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';



import { WagmiProvider } from 'wagmi';
import { AuthenticationProvider } from "./adapter/authenticationAdapter"


import App from './App';
import { config } from './wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';


const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);


root.render(
  <React.StrictMode>
    <WagmiProvider config={config} >
      <QueryClientProvider client={queryClient}>
        <AuthenticationProvider>
          <RainbowKitProvider>
            <App />
          </RainbowKitProvider>
        </AuthenticationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
