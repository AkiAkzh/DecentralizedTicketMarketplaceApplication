const hre = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup accounts & variables
  const [deployer] = await ethers.getSigners()
  const NAME = "TicketChain"
  const SYMBOL = "TC"

  // Deploy contract
  const TicketChain = await ethers.getContractFactory("TicketChain")
  const ticketChain = await TicketChain.deploy(NAME, SYMBOL)
  await ticketChain.deployed()

  console.log(`Deployed TicketChain Contract at: ${ticketChain.address}\n`)

  // List 6 events
  const occasions = [
    {
      name: "Kairat Nurtas",
      cost: tokens(0.004),
      tickets: 300,
      date: "Nov 29",
      time: "19:00",
      location: "Astana, Kazakhstan"
    },
    {
      name: "AC/DC",
      cost: tokens(0.005),
      tickets: 450,
      date: "Jan 2",
      time: "20:00",
      location: "Shymkent, Kazakhstan"
    },
    {
      name: "Blockhain Hackathon",
      cost: tokens(0.002),
      tickets: 0,
      date: "Dec 9",
      time: "11:00",
      location: "Aktau, Kazakhstan"
    },
    {
      name: "Blockchain Life",
      cost: tokens(0.003),
      tickets: 100,
      date: "Apr 15",
      time: "12:00",
      location: "Dubai, United Arab Emirates"
    },
    {
      name: "Ne Prosto Orchestra",
      cost: tokens(0.0025),
      tickets: 150,
      date: "Dec 15",
      time: "18:00",
      location: "Taraz, Kazakhstan"
    }
  ]

  // create events with loops by connecting to smart contract and calling the list() function
  for (var i = 0; i < 5; i++) {
    const transaction = await ticketChain.connect(deployer).list(
      occasions[i].name,
      occasions[i].cost,
      occasions[i].tickets,
      occasions[i].date,
      occasions[i].time,
      occasions[i].location,
    )

    await transaction.wait()

    console.log(`Listed Event ${i + 1}: ${occasions[i].name}`)
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});