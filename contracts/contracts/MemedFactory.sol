// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./MemedToken.sol";

contract Factory is Ownable {
    uint256 public mintCost = 0.01 ether;
    uint256 public constant maxSupply = (10**9) * 10**18;
    uint256 public constant lpSupply = (maxSupply * 20) / 100;
    uint256 public constant k = 46875;
    uint256 public constant offset = 18750000000000000000000000000000;
    uint256 public constant SCALING_FACTOR = 10**39;
    address public pancakeAddress;

    enum TokenStages {
        NOT_CREATED,
        BOUNDING_CURVE,
        GRADUATED
    }
    struct TokenData {
        string name;
        string ticker;
        string description;
        string image;
        address owner;
        TokenStages stage;
        uint256 collateral;
    }

    mapping(address => TokenData) public tokenData;
    mapping(address => mapping(address => uint256)) public balance;
    
    event TokenCreated(
        address indexed token,
        address indexed owner,
        string name,
        string ticker,
        string description,
        string image
    );
    event TokensBought(
        address indexed token,
        address indexed buyer,
        uint256 amount,
        uint256 totalPrice
    );
    event TokensSold(
        address indexed token,
        address indexed seller,
        uint256 amount,
        uint256 totalPrice
    );
    event LiquidityAdded(address indexed token, uint256 amount);

    constructor(address _pancakeAddress) {
        pancakeAddress = _pancakeAddress;
    }

    function createMeme(
        address _owner,
        string calldata _name,
        string calldata _ticker,
        string calldata _description,
        string calldata _image
    ) public payable {
        require(msg.value == mintCost, "Invalid fee");
        MemedToken token = new MemedToken(_name, _ticker);
        tokenData[address(token)] = TokenData({
            name: _name,
            ticker: _ticker,
            description: _description,
            image: _image,
            owner: _owner,
            stage: TokenStages.BOUNDING_CURVE,
            collateral: 0
        });
        token.mint(lpSupply);
        emit TokenCreated(
            address(token),
            _owner,
            _name,
            _ticker,
            _description,
            _image
        );
    }

    function buy(address _token, uint256 _amount) public payable { 
        require(tokenData[_token].stage==TokenStages.BOUNDING_CURVE, "Invalid token");
        MemedToken token = MemedToken(_token);
        require(_amount<=(maxSupply-lpSupply-token.totalSupply()), "Not enough available tokens");
        uint256 bnb = getBNBAmount(_token, _amount);
        require(msg.value>=bnb, "not enough bnb");
        token.mint(_amount);
        tokenData[_token].collateral += msg.value;


    }

    function sell(address _token, uint256 _amount) public {
        
    }

    function getTokenData(address _owner)
        public
        view
        returns (TokenData memory)
    {
        TokenData memory data = tokenData[_owner];
        return data;
    }

    function getBNBAmount(address _token, uint256 _amount)
        public
        view
        returns (uint256)
    {
        MemedToken token = MemedToken(_token);
        uint256 b = token.totalSupply() - lpSupply + _amount;
        uint256 a = token.totalSupply() - lpSupply;
        uint256 f_a = k * a + offset;
        uint256 f_b = k * b + offset;
        return ((b - a) * (f_a + f_b)) / (2 * SCALING_FACTOR);
    }

    receive() external payable {}
}
