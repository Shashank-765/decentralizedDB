
import { WEB3AUTH_NETWORK } from "@web3auth/base";
import { type Web3AuthContextConfig } from "@web3auth/modal/react";
const clientId = "BCrX2uO-aJl2PofqIQ8QCJNnX9xckcGetOzMy8Gu93lx5y8VOL0gRB9ibGzSRaIV2FCsQVLNb3obv4mSVOUhJ0c";

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  }
};


export default web3AuthContextConfig;