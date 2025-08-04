const { ethers } = require("hardhat")
const fs = require("fs")

async function main() {
  const [deployer] = await ethers.getSigners()
  const network = await ethers.provider.getNetwork()
  const hre = require("hardhat")

  console.log("Deploying EduVision smart contracts...")

  // Get the contract factories
  const EduToken = await ethers.getContractFactory("EduToken")
  const LearningNFT = await ethers.getContractFactory("LearningNFT")
  const EduVisionDAO = await ethers.getContractFactory("EduVisionDAO")

  // Deploy EduToken
  console.log("Deploying EduToken...")
  const eduToken = await EduToken.deploy()
  await eduToken.deployed()
  console.log("EduToken deployed to:", eduToken.address)

  // Deploy LearningNFT
  console.log("Deploying LearningNFT...")
  const learningNFT = await LearningNFT.deploy()
  await learningNFT.deployed()
  console.log("LearningNFT deployed to:", learningNFT.address)

  // Deploy EduVisionDAO
  console.log("Deploying EduVisionDAO...")
  const eduVisionDAO = await EduVisionDAO.deploy(eduToken.address)
  await eduVisionDAO.deployed()
  console.log("EduVisionDAO deployed to:", eduVisionDAO.address)

  // Set up initial configuration
  console.log("Setting up initial configuration...")

  // Grant minter role to DAO for NFTs
  const MINTER_ROLE = await learningNFT.MINTER_ROLE()
  await learningNFT.grantRole(MINTER_ROLE, eduVisionDAO.address)
  console.log("Granted MINTER_ROLE to DAO")

  // Create initial proposal
  const proposalDescription = "Initialize EduVision platform with basic governance structure"
  await eduVisionDAO.createProposal(proposalDescription, 7 * 24 * 60 * 60) // 7 days voting period
  console.log("Created initial governance proposal")

  // Mint some initial tokens for testing
  await eduToken.mint(deployer.address, ethers.utils.parseEther("1000"))
  console.log("Minted 1000 EDU tokens to deployer")

  console.log("\n=== Deployment Summary ===")
  console.log("EduToken:", eduToken.address)
  console.log("LearningNFT:", learningNFT.address)
  console.log("EduVisionDAO:", eduVisionDAO.address)
  console.log("Deployer:", deployer.address)

  // Save deployment addresses to a file
  const deploymentInfo = {
    network: network.name,
    eduToken: eduToken.address,
    learningNFT: learningNFT.address,
    eduVisionDAO: eduVisionDAO.address,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  }

  fs.writeFileSync(`deployments/${network.name}.json`, JSON.stringify(deploymentInfo, null, 2))

  console.log(`Deployment info saved to deployments/${network.name}.json`)

  // Verify contracts on Etherscan (if not local network)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...")
    await eduToken.deployTransaction.wait(6)
    await learningNFT.deployTransaction.wait(6)
    await eduVisionDAO.deployTransaction.wait(6)

    console.log("Verifying contracts on Etherscan...")
    try {
      await hre.run("verify:verify", {
        address: eduToken.address,
        constructorArguments: [],
      })
      console.log("EduToken verified")
    } catch (error) {
      console.log("EduToken verification failed:", error.message)
    }

    try {
      await hre.run("verify:verify", {
        address: learningNFT.address,
        constructorArguments: [],
      })
      console.log("LearningNFT verified")
    } catch (error) {
      console.log("LearningNFT verification failed:", error.message)
    }

    try {
      await hre.run("verify:verify", {
        address: eduVisionDAO.address,
        constructorArguments: [eduToken.address],
      })
      console.log("EduVisionDAO verified")
    } catch (error) {
      console.log("EduVisionDAO verification failed:", error.message)
    }
  }

  console.log("\nDeployment completed successfully!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
