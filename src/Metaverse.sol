// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Updated OpenZeppelin imports (latest version)
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Metaverse is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _supply;

    uint256 public maxSupply = 100;
    uint256 public cost = 1 wei;

    struct Object {
        string name;
        int8 w;
        int8 h;
        int8 d;
        int8 x;
        int8 y;
        int8 z;
    }

    Object[] private _objects;
    mapping(address => Object[]) private _nftOwners;

    constructor() ERC721("META", "MTA") Ownable(msg.sender) {}

    /// @notice Returns the total supply of minted NFTs
    function totalSupply() public view returns (uint256) {
        return _supply.current();
    }

    /// @notice Returns all objects created
    function getObjects() external view returns (Object[] memory) {
        return _objects;
    }

    /// @notice Returns all objects owned by the sender
    function getOwnerObjects() external view returns (Object[] memory) {
        return _nftOwners[msg.sender];
    }

    /// @notice Mint a new object NFT
    function mint(
        string calldata _objectName,
        int8 _w,
        int8 _h,
        int8 _d,
        int8 _x,
        int8 _y,
        int8 _z
    ) external payable {
        require(_supply.current() < maxSupply, "Max supply reached");
        require(msg.value >= cost, "Insufficient payment");

        _supply.increment();
        uint256 tokenId = _supply.current();
        _safeMint(msg.sender, tokenId);

        Object memory newObject = Object(_objectName, _w, _h, _d, _x, _y, _z);
        _objects.push(newObject);
        _nftOwners[msg.sender].push(newObject);
    }

    /// @notice Withdraw all contract balance to the owner
    function withdraw() external onlyOwner nonReentrant {
        payable(owner()).transfer(address(this).balance);
    }
}
