// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TicketChain is ERC721 {
    address public owner;
    uint256 public totalOccasions; //events' id
    uint256 public totalSupply; // number of NFT that exists (tickets)

    struct Occasion { //Occasion = event
        uint256 id;
        string name;
        uint256 cost;
        uint256 tickets;
        uint256 maxTickets;
        string date;
        string time;
        string location;
    }

    mapping (uint256 => Occasion) occasions; // use maping to save the occasions on blockchain (key(id) => value)

    //Nested mapping: occasion id => (buyers address => bought or not)
    mapping (uint256 => mapping(address => bool)) public hasBought;

    // 1st uint - occasion id, 2nd uint - seat ID and address that seat was taken by
    mapping (uint256 => mapping (uint256 => address)) public seatTaken;

    // occasion id => seats that have already been taken
    mapping(uint256 => uint256[]) public seatsTaken;

    modifier OnlyOwner(){ // only owner can do specific functions (create occasion, etc.)
        require(msg.sender == owner);
        _; // corresponds to function body
    }

    constructor (
        string memory _name, 
        string memory _symbol
    ) ERC721(_name, _symbol){
        owner = msg.sender; //saves the owner (the one who called the "constructor" function)
    }

    // function that creates the occasion (event)
    function list(
        string memory _name,
        uint256 _cost,
        uint256 _maxTickets,
        string memory _date,
        string memory _time,
        string memory _location 
    ) public OnlyOwner {
        totalOccasions++;
        occasions[totalOccasions] = Occasion( //creating a mapping occasion with key(id) that is totalOccasions
            totalOccasions,
            _name,
            _cost,
            _maxTickets,
            _maxTickets,
            _date,
            _time,
            _location
        );
    }

    // nft minting function:
    // Payable let somebody send the ETH to the contract when the function is called
    //_id - occasion id, _seat - seat id
    function mint(uint256 _id, uint256 _seat) public payable {
        
        // require that id isn't 0 or less than total Occasions (events)
        require(_id != 0);
        require(_id <= totalOccasions); 

        // require that ETH sent is equal or greater than ticket cost
        require(msg.value >= occasions[_id].cost);

        // require that the seat isn't taken, and the seat exists
        require(seatTaken[_id][_seat] == address(0));
        require(_seat <= occasions[_id].maxTickets);

        occasions[_id].tickets -= 1; // update ticket count 

        hasBought[_id][msg.sender] = true; // update buing status 
        seatTaken[_id][_seat] = msg.sender; // assigns seat to address

        seatsTaken[_id].push(_seat); // adds the taken seats to the array of taken seats

        totalSupply++; //totalSullpy is id for tickets of special occasion (event) 

        _safeMint(msg.sender, totalSupply); // safeMint function is from openzeppelin. 
    }

    // function that returns the actual Occasion itself
    function getOccasion(uint256 _id) public view returns (Occasion memory){ 
        return occasions[_id];
    }

    // function that returns the array of taken seats
    function getSeatsTaken(uint256 _id) public view returns (uint256[] memory) {
        return seatsTaken[_id];
    }

    // function that withdraw the balance of the contract and sends it to the deployer
    function withdraw() public OnlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }
}