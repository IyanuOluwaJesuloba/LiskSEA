// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {LToken} from "../src/Token.sol";

contract TokenTest is Test {
    LToken public token;
    address public owner;
    address public user1;
    address public user2;

    uint256 constant INITIAL_SUPPLY = 1000000;
    uint256 constant INITIAL_SUPPLY_WITH_DECIMALS = INITIAL_SUPPLY * 10 ** 18;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        token = new LToken(INITIAL_SUPPLY);
    }

    function test_Deployment() public view {
        assertEq(token.name(), "LiskSEA Token");
        assertEq(token.symbol(), "LSEA");
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), INITIAL_SUPPLY_WITH_DECIMALS);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY_WITH_DECIMALS);
    }

    function test_OwnerIsDeployer() public view {
        assertEq(token.owner(), owner);
    }

    function test_Transfer() public {
        uint256 amount = 100 * 10 ** 18;

        token.transfer(user1, amount);

        assertEq(token.balanceOf(user1), amount);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY_WITH_DECIMALS - amount);
    }

    function test_TransferFromSelf() public {
        uint256 amount = 50 * 10 ** 18;

        vm.prank(user1);
        vm.expectRevert();
        token.transfer(user2, amount);
    }

    function test_TransferEmitsEvent() public {
        uint256 amount = 100 * 10 ** 18;

        vm.expectEmit(true, true, false, true);
        emit Transfer(owner, user1, amount);

        token.transfer(user1, amount);
    }

    function testFuzz_Transfer(uint256 amount) public {
        amount = bound(amount, 0, INITIAL_SUPPLY_WITH_DECIMALS);

        token.transfer(user1, amount);

        assertEq(token.balanceOf(user1), amount);
    }

    function test_Approve() public {
        uint256 amount = 1000 * 10 ** 18;

        token.approve(user1, amount);

        assertEq(token.allowance(owner, user1), amount);
    }

    function test_ApproveEmitsEvent() public {
        uint256 amount = 1000 * 10 ** 18;

        vm.expectEmit(true, true, false, true);
        emit Approval(owner, user1, amount);

        token.approve(user1, amount);
    }

    function test_TransferFrom() public {
        uint256 amount = 100 * 10 ** 18;

        token.approve(user1, amount);

        vm.prank(user1);
        token.transferFrom(owner, user2, amount);

        assertEq(token.balanceOf(user2), amount);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY_WITH_DECIMALS - amount);
        assertEq(token.allowance(owner, user1), 0);
    }

    function test_TransferFromWithoutApproval() public {
        uint256 amount = 100 * 10 ** 18;

        vm.prank(user1);
        vm.expectRevert();
        token.transferFrom(owner, user2, amount);
    }

    function test_TransferFromInsufficientAllowance() public {
        uint256 approvedAmount = 50 * 10 ** 18;
        uint256 transferAmount = 100 * 10 ** 18;

        token.approve(user1, approvedAmount);

        vm.prank(user1);
        vm.expectRevert();
        token.transferFrom(owner, user2, transferAmount);
    }

    function test_OwnerCanMint() public {
        uint256 mintAmount = 1000 * 10 ** 18;
        uint256 initialSupply = token.totalSupply();

        token.mint(user1, mintAmount);

        assertEq(token.balanceOf(user1), mintAmount);
        assertEq(token.totalSupply(), initialSupply + mintAmount);
    }

    function test_NonOwnerCannotMint() public {
        uint256 mintAmount = 1000 * 10 ** 18;

        vm.prank(user1);
        vm.expectRevert();
        token.mint(user1, mintAmount);
    }

    function test_MintToZeroAddress() public {
        uint256 mintAmount = 1000 * 10 ** 18;

        vm.expectRevert();
        token.mint(address(0), mintAmount);
    }

    function testFuzz_Mint(uint256 amount) public {
        amount = bound(amount, 1, type(uint128).max);
        uint256 initialSupply = token.totalSupply();

        token.mint(user1, amount);

        assertEq(token.balanceOf(user1), amount);
        assertEq(token.totalSupply(), initialSupply + amount);
    }

    function test_TransferOwnership() public {
        token.transferOwnership(user1);

        assertEq(token.owner(), user1);
    }

    function test_NonOwnerCannotTransferOwnership() public {
        vm.prank(user1);
        vm.expectRevert();
        token.transferOwnership(user2);
    }

    function test_RenounceOwnership() public {
        token.renounceOwnership();

        assertEq(token.owner(), address(0));
    }

    function test_CannotMintAfterRenouncingOwnership() public {
        token.renounceOwnership();

        vm.expectRevert();
        token.mint(user1, 100 * 10 ** 18);
    }

    function test_TransferZeroAmount() public {
        token.transfer(user1, 0);
        assertEq(token.balanceOf(user1), 0);
    }

    function test_ApproveZeroAmount() public {
        token.approve(user1, 0);
        assertEq(token.allowance(owner, user1), 0);
    }

    function test_MultipleTransfers() public {
        uint256 amount = 100 * 10 ** 18;

        token.transfer(user1, amount);

        vm.prank(user1);
        token.transfer(user2, amount / 2);

        assertEq(token.balanceOf(user2), amount / 2);
        assertEq(token.balanceOf(user1), amount / 2);
    }

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
