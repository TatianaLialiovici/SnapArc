// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721Enumerable, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title SnapArcMarket
 * @notice A micro-marketplace for photography licenses on Arc Testnet.
 *         Photographers list photos with a fixed price (0.10–0.50 native USDC).
 *         Buyers purchase a license and receive an ERC721 NFT as proof of rights.
 *         Funds are transferred directly to the photographer. No intermediary.
 */
contract SnapArcMarket is ERC721Enumerable, Ownable, ReentrancyGuard {
    using Strings for uint256;
    using Strings for address;

    uint256 public constant MIN_PRICE = 0.10 ether; // 0.10 USDC, 18 decimals
    uint256 public constant MAX_PRICE = 0.50 ether; // 0.50 USDC, 18 decimals
    uint256 public constant MAX_PHOTOS = 10_000;

    uint256 private _photoCounter;
    uint256 private _licenseCounter;

    struct Photo {
        address photographer;
        string title;
        string description;
        string imageURI;
        uint256 price;
        bool active;
        uint256 createdAt;
    }

    struct License {
        uint256 photoId;
        address buyer;
        uint256 pricePaid;
        uint256 purchasedAt;
    }

    mapping(uint256 => Photo) public photos;
    mapping(uint256 => License) public licenses;
    mapping(address => uint256) public photographerEarnings;

    event PhotoAdded(
        uint256 indexed photoId,
        address indexed photographer,
        string title,
        uint256 price,
        string imageURI
    );

    event PhotoUpdated(
        uint256 indexed photoId,
        uint256 price,
        bool active
    );

    event LicensePurchased(
        uint256 indexed tokenId,
        uint256 indexed photoId,
        address indexed buyer,
        address photographer,
        uint256 pricePaid,
        uint256 timestamp
    );

    error InvalidPrice(uint256 price);
    error PhotoNotFound(uint256 photoId);
    error PhotoNotActive(uint256 photoId);
    error IncorrectPayment(uint256 expected, uint256 received);
    error EmptyTitle();
    error EmptyImageURI();
    error MaxPhotosReached();
    error NotPhotographer();
    error InvalidRange();

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC721(name, symbol) Ownable(initialOwner) {}

    /**
     * @notice Add a new photo to the marketplace.
     * @param title Short title of the photo.
     * @param description Optional description.
     * @param imageURI URI pointing to the photo (IPFS or any permanent URL).
     * @param price License price in native USDC wei (0.10–0.50 USDC).
     */
    function addPhoto(
        string calldata title,
        string calldata description,
        string calldata imageURI,
        uint256 price
    ) external returns (uint256 photoId) {
        if (bytes(title).length == 0) revert EmptyTitle();
        if (bytes(imageURI).length == 0) revert EmptyImageURI();
        if (price < MIN_PRICE || price > MAX_PRICE) revert InvalidPrice(price);
        if (_photoCounter >= MAX_PHOTOS) revert MaxPhotosReached();

        unchecked {
            _photoCounter += 1;
        }

        photoId = _photoCounter;
        photos[photoId] = Photo({
            photographer: msg.sender,
            title: title,
            description: description,
            imageURI: imageURI,
            price: price,
            active: true,
            createdAt: block.timestamp
        });

        emit PhotoAdded(photoId, msg.sender, title, price, imageURI);
    }

    /**
     * @notice Update the price or active status of a photo. Only the photographer.
     */
    function updatePhoto(
        uint256 photoId,
        uint256 newPrice,
        bool active
    ) external {
        Photo storage photo = photos[photoId];
        if (photo.photographer != msg.sender) revert NotPhotographer();
        if (newPrice < MIN_PRICE || newPrice > MAX_PRICE) revert InvalidPrice(newPrice);

        photo.price = newPrice;
        photo.active = active;

        emit PhotoUpdated(photoId, newPrice, active);
    }

    /**
     * @notice Purchase a license for a photo. Mints an ERC721 license NFT.
     * @param photoId The photo to license.
     */
    function buyLicense(uint256 photoId) external payable nonReentrant {
        Photo storage photo = photos[photoId];
        if (photo.photographer == address(0)) revert PhotoNotFound(photoId);
        if (!photo.active) revert PhotoNotActive(photoId);
        if (msg.value != photo.price) revert IncorrectPayment(photo.price, msg.value);

        unchecked {
            _licenseCounter += 1;
        }

        uint256 tokenId = _licenseCounter;
        licenses[tokenId] = License({
            photoId: photoId,
            buyer: msg.sender,
            pricePaid: msg.value,
            purchasedAt: block.timestamp
        });

        _safeMint(msg.sender, tokenId);

        photographerEarnings[photo.photographer] += msg.value;
        (bool sent, ) = photo.photographer.call{value: msg.value}("");
        require(sent, "Transfer to photographer failed");

        emit LicensePurchased(
            tokenId,
            photoId,
            msg.sender,
            photo.photographer,
            msg.value,
            block.timestamp
        );
    }

    /**
     * @notice Returns the total number of photos ever listed.
     */
    function photoCount() external view returns (uint256) {
        return _photoCounter;
    }

    /**
     * @notice Returns the total number of licenses ever minted.
     */
    function licenseCount() external view returns (uint256) {
        return _licenseCounter;
    }

    /**
     * @notice Returns all active photo IDs.
     */
    function getActivePhotoIds() external view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](_photoCounter);
        uint256 activeCount;
        for (uint256 i = 1; i <= _photoCounter; i++) {
            if (photos[i].active) {
                ids[activeCount] = i;
                activeCount++;
            }
        }
        assembly {
            mstore(ids, activeCount)
        }
        return ids;
    }

    /**
     * @notice Returns all license token IDs owned by a buyer.
     */
    function getLicenseIdsByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](balance);
        for (uint256 i; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        return tokenIds;
    }

    /**
     * @notice Construct the on-chain JSON metadata for a license token.
     */
    function tokenURI(uint256 tokenId) public view override(ERC721) returns (string memory) {
        _requireOwned(tokenId);

        License memory license = licenses[tokenId];
        Photo memory photo = photos[license.photoId];

        bytes memory json = abi.encodePacked(
            '{"name":"Snap Arc License #', tokenId.toString(), ' - ', photo.title, '",',
            '"description":"', _escapeJson(photo.description), '",',
            '"image":"', photo.imageURI, '",',
            '"attributes":[',
                '{"trait_type":"Photo","value":"', photo.title, '"},',
                '{"trait_type":"License Type","value":"Standard Royalty-Free"},',
                '{"trait_type":"Price Paid","display_type":"number","value":"', _formatEther(license.pricePaid), '"},',
                '{"trait_type":"Buyer","value":"', license.buyer.toHexString(), '"},',
                '{"trait_type":"Photographer","value":"', photo.photographer.toHexString(), '"},',
                '{"trait_type":"Purchased At","display_type":"date","value":', license.purchasedAt.toString(), '},',
                '{"trait_type":"Photo ID","value":"', license.photoId.toString(), '"}',
            ']}'
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(json)
            )
        );
    }

    /**
     * @notice Simple JSON escaping for the description field.
     */
    function _escapeJson(string memory input) internal pure returns (string memory) {
        bytes memory b = bytes(input);
        bytes memory output = new bytes(b.length * 2);
        uint256 outLen;
        for (uint256 i; i < b.length; i++) {
            bytes1 c = b[i];
            if (c == '"' || c == "\\") {
                output[outLen++] = "\\";
                output[outLen++] = c;
            } else if (uint8(c) < 0x20) {
                // skip non-printable control characters
            } else {
                output[outLen++] = c;
            }
        }
        assembly {
            mstore(output, outLen)
        }
        return string(output);
    }

    /**
     * @notice Format wei amount to a readable string with 18 decimals.
     */
    function _formatEther(uint256 value) internal pure returns (string memory) {
        uint256 integer = value / 1e18;
        uint256 fraction = value % 1e18;
        return string(abi.encodePacked(
            integer.toString(),
            ".",
            _padLeft(fraction, 18)
        ));
    }

    function _padLeft(uint256 value, uint256 length) internal pure returns (string memory) {
        string memory s = value.toString();
        uint256 sLen = bytes(s).length;
        if (sLen >= length) return s;
        bytes memory zeros = new bytes(length - sLen);
        for (uint256 i; i < length - sLen; i++) {
            zeros[i] = "0";
        }
        return string(abi.encodePacked(zeros, s));
    }

    /**
     * @notice Allow the contract to receive native USDC in emergencies.
     */
    receive() external payable {}
}
