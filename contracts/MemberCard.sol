//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract MemberCard is ERC721Enumerable, Ownable, Pausable {
    struct UseTokenInfo {
        address vendor;
        address owner;
        uint256 usedAt;
    }

    uint256 private currentTokenId;
    uint256 public countOfUse;
    uint256 public cardDuration;
    uint256 public fee;

    mapping(address => bool) public vendors;
    mapping(uint256 => UseTokenInfo[]) private useTokenInfo;
    mapping(uint256 => uint256) private availCount;
    mapping(uint256 => uint256) private expiryDate;

    event CardMinted(address receiver, uint256 indexed tokenId);
    event CardUsed(uint256 indexed tokenId, address account);
    event SetExpiryDate(uint256 indexed value);
    event SetAvailCount(uint256 indexed value);
    event SetAvailCountFor(uint256 indexed tokenId, uint256 indexed value);

    modifier validCount(uint256 tokenId) {
        require(getAvailCount(tokenId) > 0, "Out of use");
        _;
    }

    modifier validDate(uint256 tokenId) {
        require(block.timestamp < getExpiryDate(tokenId), "Expired"); // solhint-disable-line not-rely-on-time
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        uint256 count,
        uint256 duration
    ) ERC721(name, symbol) {
        cardDuration = duration;
        countOfUse = count;
        fee = 5e16;
    }

    function addVendor(address addr) external onlyOwner {
        vendors[addr] = true;
    }

    function removeVendor(address addr) external onlyOwner {
        vendors[addr] = false;
    }

    function setPaused(bool _paused) external onlyOwner {
        if (_paused) {
            _pause();
        } else {
            _unpause();
        }
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override whenNotPaused {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );
        require(
            balanceOf(to) == 0,
            "Only have 1 NFT per wallet"
        );
        _transfer(from, to, tokenId);
    }

    function mintToken(address to) external payable {
        require(
            balanceOf(to) == 0,
            "Only have 1 NFT per wallet"
        );
        require(msg.value >= fee, "Invalid value");
        _safeMint(to, ++currentTokenId);
        availCount[currentTokenId] = countOfUse;
        payable(owner()).transfer(msg.value); // solhint-disable-line indent
        emit CardMinted(to, currentTokenId);
    }

    function setTokenExpiry(uint256 tokenId) public onlyOwner {
        expiryDate[tokenId] = block.timestamp + cardDuration; // solhint-disable-line not-rely-on-time
    }

    function useToken(uint256 _tokenId, address _account)
        public
        validCount(_tokenId)
        validDate(_tokenId)
    {
        require(vendors[_msgSender()], "Invalid vendor");
        require(_account == ownerOf(_tokenId), "Not owner");

        availCount[_tokenId]--;
        useTokenInfo[_tokenId].push(UseTokenInfo(_msgSender(), _account, block.timestamp));
        emit CardUsed(_tokenId, _account);
    }

    function setExpiryDate(uint256 value) public onlyOwner {
        require(cardDuration != value, "Must different");
        cardDuration = value;
        emit SetExpiryDate(cardDuration);
    }

    function setAvailCountFor(uint256 tokenId, uint256 value) public onlyOwner {
        require(getAvailCount(tokenId) != value, "Must different");
        availCount[tokenId] = value;
        emit SetAvailCountFor(tokenId, value);
    }

    function setAvailCount(uint256 value) public onlyOwner {
        require(countOfUse != value, "Must different");
        countOfUse = value;
        emit SetAvailCount(countOfUse);
    }

    function getExpiryDate(uint256 tokenId) public view returns (uint256) {
        return expiryDate[tokenId];
    }

    function getAvailCount(uint256 tokenId) public view returns (uint256) {
        return availCount[tokenId];
    }

    function tokensOfOwner(address owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256 count = balanceOf(owner);
        uint256[] memory ids = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            ids[i] = tokenOfOwnerByIndex(owner, i);
        }
        return ids;
    }

    function getuseTokenInfo(uint256 _tokenId) public view returns (UseTokenInfo[] memory info) {
        info = useTokenInfo[_tokenId];
    }
}