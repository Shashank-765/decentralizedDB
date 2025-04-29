import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre from "hardhat";
  import fs from 'fs'
  import path from 'path'

  describe("Document Deploy", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployOneYearLockFixture() {
     
  
      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await hre.ethers.getSigners();
  
      const Document = await hre.ethers.getContractFactory("DocumentVerification");
      let documentContract = await Document.deploy();
        let documentContractAddress =  await documentContract.getAddress()
    //   console.log('documentContract', )
    //   console.log('address', owner.address)
      
      console.log('balance',hre.ethers.formatEther((await  hre.ethers.provider.getBalance(owner.address)).toString()))
  
      return { documentContractAddress,  owner, otherAccount };
    }


    describe("Deployment", function () {
        it("Deploy Document Contract address", async function () {
            const { documentContractAddress, owner, otherAccount } = await loadFixture(deployOneYearLockFixture);
    
            // Define the config file path
            const configFilePath: string = path.join(__dirname, "../frontend/config.json");
    
            // Define a TypeScript interface for the config file structure
            interface Config {
                contractAddress: string;
            }
    
            let config: Config = { contractAddress: "" };
    
            // Read existing config if available
            if (fs.existsSync(configFilePath)) {
                const rawData: string = fs.readFileSync(configFilePath, "utf-8");
                config = JSON.parse(rawData) as Config;
            }
    
            // Update or create config
            config.contractAddress = documentContractAddress;
    
            // Write updated config back to file
            fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
    
            console.log("✅ Contract address saved in config.json:", documentContractAddress);
        });
    });

})