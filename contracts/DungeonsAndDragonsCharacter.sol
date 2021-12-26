// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorMock.sol";
import "hardhat/console.sol";

contract DungeonsAndDragonsCharacter is ERC721URIStorage, VRFConsumerBase, Ownable {
    // using SafeMath for uint256;
    // using String for string;

    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 public randomResult;
    address public VRFCoordinator;
    address public LinkToken;

    struct Character {
        uint256 strength;
        uint256 dexterity;
        uint256 constitution;
        uint256 intelligence;
        uint256 wisdom;
        uint256 charisma;
        uint256 experience;
        string name;
    }

    Character[] public characters;

    mapping(bytes32 => string) requestToCharacterName;
    mapping(bytes32 => address) requestToSender;
    mapping(bytes32 => uint256) requestToTokenId;

    constructor(
        address _VRFcoordinator,
        address _LinkToken,
        bytes32 _keyhash
    )
        public
        VRFConsumerBase(_VRFcoordinator, _LinkToken)
        ERC721("DungeonsAndDragonsCharacter", "D&D")
    {
        VRFCoordinator = _VRFcoordinator;
        LinkToken = _LinkToken;
        keyHash = _keyhash;
        fee = 0.1 * 10**18; // 0.001 LINK Rinkeby testnet
        // fee = 0.001 * 10**18; // 0.001 LINK Mumbai testnet
    }

    // request a random number for once character
    function requestNewRandomCharacter(string memory name)
        public
        returns (bytes32)
    {
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with faucet"
        );
        bytes32 requestId = requestRandomness(keyHash, fee);
        requestToCharacterName[requestId] = name;
        requestToSender[requestId] = msg.sender;
        return requestId;
    }

    function getTokenURI(uint256 tokenId) public view returns (string memory) {
        return tokenURI(tokenId);
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) public {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        _setTokenURI(tokenId, _tokenURI);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomNumber)
        internal
        override
    {
        uint256 newId = characters.length;
        uint256 strength = (randomNumber % 100);
        uint256 dexterity = ((randomNumber % 10000) / 100);
        uint256 constitution = ((randomNumber % 1000000) / 10000);
        uint256 intelligence = ((randomNumber % 100000000) / 1000000);
        uint256 wisdom = ((randomNumber % 10000000000) / 100000000);
        uint256 charisma = ((randomNumber % 1000000000000) / 10000000000);
        uint256 experience = 0;

        characters.push(
            Character(
                strength,
                dexterity,
                constitution,
                intelligence,
                wisdom,
                charisma,
                experience,
                requestToCharacterName[requestId]
            )
        );
        _safeMint(requestToSender[requestId], newId);
    }

    function getLevel(uint256 tokenId) public view returns (uint256) {
        return sqrt(characters[tokenId].experience);
    }

    function getNumberOfCharacters() public view returns (uint256) {
        return characters.length;
    }

    function getCharacterOverView(uint256 tokenId)
        public
        view
        returns (
            string memory,
            uint256,
            uint256,
            uint256
        )
    {
        return (
            characters[tokenId].name,
            characters[tokenId].strength +
                characters[tokenId].dexterity +
                characters[tokenId].constitution +
                characters[tokenId].intelligence +
                characters[tokenId].wisdom +
                characters[tokenId].charisma,
            getLevel(tokenId),
            characters[tokenId].experience
        );
    }

    function getCharacterStats(uint256 tokenId) public view returns (
        uint256,
        uint256,
        uint256,
        uint256,
        uint256,
        uint256,
        uint256
    ){
        return (
            characters[tokenId].strength,
            characters[tokenId].dexterity,
            characters[tokenId].constitution,
            characters[tokenId].intelligence,
            characters[tokenId].wisdom,
            characters[tokenId].charisma,
            characters[tokenId].experience
        );
    }

    function sqrt(uint256 x) internal view returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}
