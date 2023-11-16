import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Card from './components/Card'
import SeatChart from './components/SeatChart'

// ABIs
import TicketChain from './abis/TicketChain.json'

// Config
import config from './config.json'

function App() {
  // we use useState in order to work with data inside our frontend
  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)
  const [ticketChain, setTicketChain] = useState(null)
  const [occasions, setOccasions] = useState([])
  const [occasion, setOccasion] = useState({})
  const [toggle, setToggle] = useState(false)

  const loadBlockchainData = async () => {

    // blockhain connection that allows to sign contracts, transactions, etc.
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    // connect our smart contract to application
    const network = await provider.getNetwork()
    const address = config[network.chainId].TicketChain.address
    const ticketChain = new ethers.Contract(address, TicketChain, provider)
    setTicketChain(ticketChain)

    const totalOccasions = await ticketChain.totalOccasions() //call totalOccasions var from our contract
    const occasions = []

    for (var i = 1; i <= totalOccasions; i++) {
      const occasion = await ticketChain.getOccasion(i) //save each occasion
      occasions.push(occasion) //add these occasions into array 
    }
    setOccasions(occasions)

    console.log(occasions)

    // Updates account on page
    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) // attaches metamask to opened window
      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account) // set the connected account's address 
    })
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div>
      <header>
        <Navigation account={account} setAccount={setAccount}/>
        <h2 className="header__title"><strong>Events</strong> Tickets</h2>
      </header>

      <div className='cards'>
        {occasions.map((occasion, index) => (
          <Card
            occasion={occasion}
            id={index + 1}
            ticketChain={ticketChain}
            provider={provider}
            account={account}
            toggle={toggle}
            setToggle={setToggle}
            setOccasion={setOccasion}
            key={index}
        />
        ))}
      </div>
      {toggle && (
        <SeatChart
          occasion={occasion}
          ticketChain={ticketChain}
          provider={provider}
          setToggle={setToggle}
        />
      )}
    </div>
  );
}

export default App;