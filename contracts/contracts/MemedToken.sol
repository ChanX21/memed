// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MemedToken is ERC20, Ownable {
    constructor(string memory _name, string memory _ticker)
        ERC20(_name, _ticker)
    {}

    function mint(uint256 _amount) public onlyOwner {
        _mint(msg.sender, _amount);
    }

    function burn(uint256 _amount) public onlyOwner {
        _burn(msg.sender, _amount);
    }
}
