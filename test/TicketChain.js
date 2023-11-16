const { expect } = require("chai")
const { ethers } = require("hardhat")

const NAME = "TicketChain"
const SYMBOL = "TC"

//test occasion variables
const occasionName = "Kairat Nurtas"
const occasionCost = ethers.utils.parseUnits('1', 'ether')
const occasionMaxTickets = 100
const occasionDate = "Nov 17"
const occasionTime = "20:00"
const occasionLocation = "Astana, Kazakhstan"


describe("TicketChain", () => {
  let TicketChain
  let deployer, buyer
  
  // we use beforeEach in order to create some variables, arrays that we'll need in furhter tests
  beforeEach(async () => {
    [deployer, buyer] = await ethers.getSigners() //setup deployer's and buyer's test accounts 

    const TicketChain = await ethers.getContractFactory("TicketChain") // get the contract from the "contracts" folder
    ticketChain = await TicketChain.deploy(NAME, SYMBOL) // deploys the contract and assigns the name and symbol

    // connects to contract through deployer account in order to use list function to create an Occasion
    const transaction = await ticketChain.connect(deployer).list( 
      occasionName,
      occasionCost,
      occasionMaxTickets,
      occasionDate,
      occasionTime,
      occasionLocation
    )

    // wait for the transaction to be included into the blockchain before we start test
    await transaction.wait() 
  })
  
  describe("Deployment of contract", () => {
    it("Sets the name of contract", async () => {
      expect(await ticketChain.name()).to.equal(NAME)
    })

    it("Sets the symbol of contract", async () =>{
      expect(await ticketChain.symbol()).to.equal(SYMBOL)
    })

    it("Sets the owner of the contract", async () =>{
      expect(await ticketChain.owner()).to.equal(deployer.address)
    })


  })

  describe("Occasions creation", () => {
    it("Updates occasions count (id)", async () => {
      const totalOccasions = await ticketChain.totalOccasions() //take the occassion id (totalOccasion) from the contract
      expect(totalOccasions).to.be.equal(1) // checks if it is equal to 1
    })

    // checking occasion's other attributes
    it("Returns occasions attributes", async () => {
      const occasion = await ticketChain.getOccasion(1)
      expect(occasion.id).to.be.equal(1)
      expect(occasion.name).to.be.equal(occasionName)
      expect(occasion.cost).to.be.equal(occasionCost)
      expect(occasion.tickets).to.be.equal(occasionMaxTickets)
      expect(occasion.date).to.be.equal(occasionDate)
      expect(occasion.time).to.be.equal(occasionTime)
      expect(occasion.location).to.be.equal(occasionLocation)
    })
  })

  describe("Minting tickets", () => {
    const occasionId = 1 //1st occasion
    const seatNum = 60 // seat number
    const ticketCost = ethers.utils.parseUnits('1', 'ether')

    beforeEach(async () => {

      // connect to the contract through the buyer's address to call mint() function
      const transaction = await ticketChain.connect(buyer).mint(occasionId, seatNum, {value: ticketCost})
      await transaction.wait()
    })

    //checks if the occasion's total number of tickets has changed
    it("Updates the ticket amount", async () => {
      const occasion = await ticketChain.getOccasion(1)
      expect(occasion.tickets).to.be.equal(occasionMaxTickets - 1)
    })

    //checks if the buying status was updated
    it("Updates buying status", async () => {
      const buyingStatus = await ticketChain.hasBought(occasionId, buyer.address)
      expect(buyingStatus).to.be.equal(true)
    })

    // checks if seat is attached to buyer's address
    it("Update seat status", async () => {
      const seatStatus = await ticketChain.seatTaken(occasionId, seatNum)
      expect(seatStatus).to.be.equal(buyer.address)
    })

    // checks the status of bought tickets  
    it("Updates overall seating status", async () => {
      const seats = await ticketChain.getSeatsTaken(occasionId)
      expect(seats.length).to.equal(1)
      expect(seats[0]).to.equal(seatNum)
    })

    // checks the contract balance updates
    it("Updates contract balance", async () => {
      const balance = await ethers.provider.getBalance(ticketChain.address)
      expect(balance).to.be.equal(ticketCost)
    })
  })

  describe("Withdraw", () => {
    const occasionId = 1
    const seatNum = 50
    const ticketCost = ethers.utils.parseUnits("1", 'ether')
    let balanceBefore

    beforeEach(async () => {
      // make a snapshot of deployer balance before buying tickets
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      // buy ticket and make transcation 
      let transaction = await ticketChain.connect(buyer).mint(occasionId, seatNum, { value: ticketCost })
      await transaction.wait()

      // deployer calls withdraw function from smart contract
      transaction = await ticketChain.connect(deployer).withdraw()
      await transaction.wait()
    })

    // deployer's balance after should be greater than balance before
    it('Updates the owner balance', async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })

    // the contracts balance should be equal to 0 after withdrawing
    it('Updates the contract balance', async () => {
      const balance = await ethers.provider.getBalance(ticketChain.address)
      expect(balance).to.equal(0)
    })
  })


  // let ticketChain
  // let deployer, buyer

  // beforeEach(async () => {
  //   // Setup accounts
  //   [deployer, buyer] = await ethers.getSigners()

  //   // Deploy contract
  //   const TicketChain = await ethers.getContractFactory("TicketChain")
  //   ticketChain = await TicketChain.deploy(NAME, SYMBOL)

  //   const transaction = await ticketChain.connect(deployer).list(
  //     occasionName,
  //     occasionCost,
  //     occasionMaxTickets,
  //     occasionDate,
  //     occasionTime,
  //     occasionLocation
  //   )

  //   await transaction.wait()
  // })

  // describe("Deployment", () => {
  //   it("Sets the name", async () => {
  //     expect(await ticketChain.name()).to.equal(NAME)
  //   })

  //   it("Sets the symbol", async () => {
  //     expect(await ticketChain.symbol()).to.equal(SYMBOL)
  //   })

  //   it("Sets the owner", async () => {
  //     expect(await ticketChain.owner()).to.equal(deployer.address)
  //   })
  // })

  // describe("Occasions", () => {
  //   it('Returns occasions attributes', async () => {
  //     const occasion = await ticketChain.getOccasion(1)
  //     expect(occasion.id).to.be.equal(1)
  //     expect(occasion.name).to.be.equal(occasionName)
  //     expect(occasion.cost).to.be.equal(occasionCost)
  //     expect(occasion.tickets).to.be.equal(occasionMaxTickets)
  //     expect(occasion.date).to.be.equal(occasionDate)
  //     expect(occasion.time).to.be.equal(occasionTime)
  //     expect(occasion.location).to.be.equal(occasionLocation)
  //   })

  //   it('Updates occasions count', async () => {
  //     const totalOccasions = await ticketChain.totalOccasions()
  //     expect(totalOccasions).to.be.equal(1)
  //   })
  // })

  // describe("Minting", () => {
  //   const ID = 1
  //   const SEAT = 50
  //   const AMOUNT = ethers.utils.parseUnits('1', 'ether')

  //   beforeEach(async () => {
  //     const transaction = await ticketChain.connect(buyer).mint(ID, SEAT, { value: AMOUNT })
  //     await transaction.wait()
  //   })

  //   it('Updates ticket count', async () => {
  //     const occasion = await ticketChain.getOccasion(1)
  //     expect(occasion.tickets).to.be.equal(occasionMaxTickets - 1)
  //   })

  //   it('Updates buying status', async () => {
  //     const status = await ticketChain.hasBought(ID, buyer.address)
  //     expect(status).to.be.equal(true)
  //   })

  //   it('Updates seat status', async () => {
  //     const owner = await ticketChain.seatTaken(ID, SEAT)
  //     expect(owner).to.equal(buyer.address)
  //   })

  //   it('Updates overall seating status', async () => {
  //     const seats = await ticketChain.getSeatsTaken(ID)
  //     expect(seats.length).to.equal(1)
  //     expect(seats[0]).to.equal(SEAT)
  //   })

  //   it('Updates the contract balance', async () => {
  //     const balance = await ethers.provider.getBalance(ticketChain.address)
  //     expect(balance).to.be.equal(AMOUNT)
  //   })
  // })


})
