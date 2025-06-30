import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Web3AuthProvider } from "@web3auth/modal/react";
import web3AuthContextConfig from "./pages/web3authContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "@web3auth/modal/react/wagmi";
const queryClient = new QueryClient();


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <Web3AuthProvider config={web3AuthContextConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider>
          <App />
        </WagmiProvider>
      </QueryClientProvider>
    </Web3AuthProvider>
  );