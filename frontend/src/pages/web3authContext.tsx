
import { WEB3AUTH_NETWORK } from "@web3auth/modal";
import { type Web3AuthContextConfig } from "@web3auth/modal/react";

const clientId = "BKS0KOCmnNA-F2FFYGzOiKCX3iFbEwjsPlUuWdZD68iCksDI1cOMrNAc56_cRx1OFgfIIQGRtNwb2BGh1289Wvc"; 
const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  }
};


export default web3AuthContextConfig;