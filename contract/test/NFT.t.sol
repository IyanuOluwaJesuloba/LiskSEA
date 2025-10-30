// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {LNFT} from "../src/NFT.sol";

contract NFTTest is Test {
    LNFT public nft;
    address public owner;
    address public user1;
    address public user2;

    string constant TEST_URI_1 = "ipfs://QmTest1";
    string constant TEST_URI_2 = "ipfs://QmTest2";
    string constant TEST_URI_3 = "ipfs://QmTest3";

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        nft = new LNFT();
    }

    function test_Deployment() public view {
        assertEq(nft.name(), "LiskSEA NFT");
        assertEq(nft.symbol(), "LNFT");
        assertEq(nft.totalSupply(), 0);
    }

    function test_OwnerIsDeployer() public view {
        assertEq(nft.owner(), owner);
    }

    function test_OwnerCanSafeMint() public {
        nft.safeMint(user1, TEST_URI_1);

        assertEq(nft.balanceOf(user1), 1);
        assertEq(nft.ownerOf(0), user1);
        assertEq(nft.tokenURI(0), TEST_URI_1);
        assertEq(nft.totalSupply(), 1);
    }

    function test_NonOwnerCannotSafeMint() public {
        vm.prank(user1);
        vm.expectRevert();
        nft.safeMint(user2, TEST_URI_1);
    }

    function test_SafeMintMultipleTokens() public {
        nft.safeMint(user1, TEST_URI_1);
        nft.safeMint(user1, TEST_URI_2);
        nft.safeMint(user2, TEST_URI_3);

        assertEq(nft.balanceOf(user1), 2);
        assertEq(nft.balanceOf(user2), 1);
        assertEq(nft.totalSupply(), 3);
    }

    function test_SafeMintIncrementsTokenId() public {
        nft.safeMint(user1, TEST_URI_1);
        assertEq(nft.ownerOf(0), user1);

        nft.safeMint(user2, TEST_URI_2);
        assertEq(nft.ownerOf(1), user2);

        nft.safeMint(user1, TEST_URI_3);
        assertEq(nft.ownerOf(2), user1);
    }

    function test_AnyoneCanMint() public {
        vm.prank(user1);
        nft.mint(TEST_URI_1);

        assertEq(nft.balanceOf(user1), 1);
        assertEq(nft.ownerOf(0), user1);
        assertEq(nft.tokenURI(0), TEST_URI_1);
    }

    function test_MintMultipleByDifferentUsers() public {
        vm.prank(user1);
        nft.mint(TEST_URI_1);

        vm.prank(user2);
        nft.mint(TEST_URI_2);

        assertEq(nft.balanceOf(user1), 1);
        assertEq(nft.balanceOf(user2), 1);
        assertEq(nft.ownerOf(0), user1);
        assertEq(nft.ownerOf(1), user2);
    }

    function test_UserCanMintMultipleTokens() public {
        vm.startPrank(user1);
        nft.mint(TEST_URI_1);
        nft.mint(TEST_URI_2);
        nft.mint(TEST_URI_3);
        vm.stopPrank();

        assertEq(nft.balanceOf(user1), 3);
        assertEq(nft.totalSupply(), 3);
    }

    function test_TokenURIIsSet() public {
        nft.safeMint(user1, TEST_URI_1);

        assertEq(nft.tokenURI(0), TEST_URI_1);
    }

    function test_TokenURIForNonexistentToken() public {
        vm.expectRevert();
        nft.tokenURI(999);
    }

    function test_DifferentURIsForDifferentTokens() public {
        nft.safeMint(user1, TEST_URI_1);
        nft.safeMint(user2, TEST_URI_2);

        assertEq(nft.tokenURI(0), TEST_URI_1);
        assertEq(nft.tokenURI(1), TEST_URI_2);
    }

    function test_TransferToken() public {
        nft.safeMint(user1, TEST_URI_1);

        vm.prank(user1);
        nft.transferFrom(user1, user2, 0);

        assertEq(nft.ownerOf(0), user2);
        assertEq(nft.balanceOf(user1), 0);
        assertEq(nft.balanceOf(user2), 1);
    }

    function test_CannotTransferTokenYouDontOwn() public {
        nft.safeMint(user1, TEST_URI_1);

        vm.prank(user2);
        vm.expectRevert();
        nft.transferFrom(user1, user2, 0);
    }

    function test_SafeTransferFrom() public {
        nft.safeMint(user1, TEST_URI_1);

        vm.prank(user1);
        nft.safeTransferFrom(user1, user2, 0);

        assertEq(nft.ownerOf(0), user2);
    }

    function test_ApproveToken() public {
        nft.safeMint(user1, TEST_URI_1);

        vm.prank(user1);
        nft.approve(user2, 0);

        assertEq(nft.getApproved(0), user2);
    }

    function test_ApprovedCanTransfer() public {
        nft.safeMint(user1, TEST_URI_1);

        vm.prank(user1);
        nft.approve(user2, 0);

        vm.prank(user2);
        nft.transferFrom(user1, user2, 0);

        assertEq(nft.ownerOf(0), user2);
    }

    function test_SetApprovalForAll() public {
        nft.safeMint(user1, TEST_URI_1);
        nft.safeMint(user1, TEST_URI_2);

        vm.prank(user1);
        nft.setApprovalForAll(user2, true);

        assertTrue(nft.isApprovedForAll(user1, user2));

        vm.prank(user2);
        nft.transferFrom(user1, user2, 0);

        assertEq(nft.ownerOf(0), user2);
    }

    function test_TotalSupplyIncrementsCorrectly() public {
        assertEq(nft.totalSupply(), 0);

        nft.safeMint(user1, TEST_URI_1);
        assertEq(nft.totalSupply(), 1);

        vm.prank(user2);
        nft.mint(TEST_URI_2);
        assertEq(nft.totalSupply(), 2);

        nft.safeMint(user1, TEST_URI_3);
        assertEq(nft.totalSupply(), 3);
    }

    function test_TransferOwnership() public {
        nft.transferOwnership(user1);

        assertEq(nft.owner(), user1);
    }

    function test_NewOwnerCanSafeMint() public {
        nft.transferOwnership(user1);

        vm.prank(user1);
        nft.safeMint(user2, TEST_URI_1);

        assertEq(nft.ownerOf(0), user2);
    }

    function test_OldOwnerCannotSafeMint() public {
        nft.transferOwnership(user1);

        vm.expectRevert();
        nft.safeMint(user2, TEST_URI_1);
    }

    function test_RenounceOwnership() public {
        nft.renounceOwnership();

        assertEq(nft.owner(), address(0));
    }

    function test_CannotSafeMintAfterRenouncingOwnership() public {
        nft.renounceOwnership();

        vm.expectRevert();
        nft.safeMint(user1, TEST_URI_1);
    }

    function test_CanStillPublicMintAfterRenouncingOwnership() public {
        nft.renounceOwnership();

        vm.prank(user1);
        nft.mint(TEST_URI_1);

        assertEq(nft.ownerOf(0), user1);
    }

    function test_SupportsERC721Interface() public view {
        // ERC721 interface ID: 0x80ac58cd
        assertTrue(nft.supportsInterface(0x80ac58cd));
    }

    function test_SupportsERC721MetadataInterface() public view {
        // ERC721Metadata interface ID: 0x5b5e139f
        assertTrue(nft.supportsInterface(0x5b5e139f));
    }

    function test_OwnerOfNonexistentToken() public {
        vm.expectRevert();
        nft.ownerOf(0);
    }

    function test_BalanceOfZeroAddress() public {
        vm.expectRevert();
        nft.balanceOf(address(0));
    }

    function test_MintWithEmptyURI() public {
        vm.prank(user1);
        nft.mint("");

        assertEq(nft.tokenURI(0), "");
        assertEq(nft.ownerOf(0), user1);
    }

    function test_MixedMintingMethods() public {
        nft.safeMint(user1, TEST_URI_1);

        vm.prank(user2);
        nft.mint(TEST_URI_2);

        nft.safeMint(user1, TEST_URI_3);

        assertEq(nft.totalSupply(), 3);
        assertEq(nft.ownerOf(0), user1);
        assertEq(nft.ownerOf(1), user2);
        assertEq(nft.ownerOf(2), user1);
    }

    function testFuzz_Mint(uint8 numMints) public {
        vm.assume(numMints > 0 && numMints < 50);

        vm.startPrank(user1);
        for (uint256 i = 0; i < numMints; i++) {
            nft.mint(string(abi.encodePacked("ipfs://", vm.toString(i))));
        }
        vm.stopPrank();

        assertEq(nft.balanceOf(user1), numMints);
        assertEq(nft.totalSupply(), numMints);
    }
}
