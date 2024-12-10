// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./MemedToken.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol";

contract Factory is Ownable {
    IUniswapV2Factory pancakeFactory =
        IUniswapV2Factory(address(0xB7926C0430Afb07AA7DEfDE6DA862aE0Bde767bc));
    IUniswapV2Router01 router =
        IUniswapV2Router01(address(0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3));
    uint256 public constant maxSupply = (10 ** 9) * 10 ** 18;
    uint256 public constant k = 46875;
    uint256 public constant offset = 18750000000000000000000000000000;
    uint256 public constant SCALING_FACTOR = 10 ** 18;
    uint256 public graduationAmount = 30 ether;
    uint256 public constant creationFee = 0.002 ether;
    uint256 public constant tradeFeePercent = 10;
    uint256 public feesBalance;

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
        uint createdAt;
    }

    struct AllTokenData {
        address token;
        string name;
        string ticker;
        string description;
        string image;
        address owner;
        TokenStages stage;
        uint256 collateral;
        uint supply;
        uint createdAt;
    }

    mapping(address => TokenData) public tokenData;
    address[] public tokens;

    event TokenCreated(
        address indexed token,
        address indexed owner,
        string name,
        string ticker,
        string description,
        string image,
        uint createdAt
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
    event TokenGraduated(address indexed token, address indexed pool);
    event TokenWithdrawn(
        address indexed token,
        address indexed recipient,
        uint256 amount
    );

    constructor() Ownable(msg.sender) {}

    function setGraduationAmount(uint256 _amount) public onlyOwner {
        graduationAmount = _amount;
    }

    function createMeme(
        string calldata _name,
        string calldata _ticker,
        string calldata _description,
        string calldata _image
    ) public payable {
        require(msg.value >= creationFee, "Insufficient BNB for creation fee");
        feesBalance += creationFee;

        MemedToken token = new MemedToken(_name, _ticker);
        tokenData[address(token)] = TokenData({
            name: _name,
            ticker: _ticker,
            description: _description,
            image: _image,
            owner: msg.sender,
            stage: TokenStages.BOUNDING_CURVE,
            collateral: 0,
            createdAt: block.timestamp
        });
        tokens.push(address(token));
        emit TokenCreated(
            address(token),
            msg.sender,
            _name,
            _ticker,
            _description,
            _image,
            block.timestamp
        );
    }

    function buy(address _token, uint256 _amount) public payable {
        require(
            tokenData[_token].stage == TokenStages.BOUNDING_CURVE,
            "Invalid token"
        );
        MemedToken token = MemedToken(_token);
        require(
            _amount <=
                (maxSupply - ((maxSupply * 20) / 100) - token.totalSupply()),
            "Not enough available tokens"
        );

        uint256[3] memory bnbRequired = getBNBAmount(_token, _amount);

        require(msg.value >= bnbRequired[0], "Not enough BNB for trade");
        feesBalance += bnbRequired[2];

        token.mint(msg.sender, _amount);
        tokenData[_token].collateral += bnbRequired[1];

        uint256 excess = msg.value - bnbRequired[0];
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }

        if (tokenData[_token].collateral >= graduationAmount) {
            graduateToken(_token);
        }

        emit TokensBought(_token, msg.sender, _amount, bnbRequired[1]);
    }

    function sell(address _token, uint256 _amount) public {
        require(
            tokenData[_token].stage == TokenStages.BOUNDING_CURVE,
            "Invalid token stage"
        );
      MemedToken token = MemedToken(_token);
        require(
            token.balanceOf(msg.sender) >= _amount,
            "Insufficient token balance"
        );

        uint256[3] memory bnb = getBNBAmount(_token, _amount);
        uint256 netBnb = bnb[0] - bnb[1];

        require(
            address(this).balance >= netBnb,
            "Insufficient contract balance"
        );

        feesBalance += bnb[2];
        token.burn(msg.sender, _amount);
        tokenData[_token].collateral -= bnb[1];

        payable(msg.sender).transfer(netBnb);

        emit TokensSold(_token, msg.sender, _amount, netBnb);
    }

    function graduateToken(address _token) internal {
        address pool;
        address check = pancakeFactory.getPair(_token, router.WETH());
        if (check == address(0)) {
            pool = pancakeFactory.createPair(_token, router.WETH());
        } else {
            pool = check;
        }
        MemedToken token = MemedToken(_token);
        token.enableTransfers();
        token.mint(address(this), (maxSupply * 20) / 100);
        token.approve(address(router), (maxSupply * 20) / 100);
        router.addLiquidityETH{value: (graduationAmount * 98) / 100}(
            _token,
            ((maxSupply * 20) / 100),
            0,
            0,
            address(0),
            block.timestamp
        );
        payable(tokenData[_token].owner).transfer((graduationAmount * 2) / 100);
        tokenData[_token].stage = TokenStages.GRADUATED;
        emit TokenGraduated(_token, pool);
    }


    function getBNBAmount(
        address _token,
        uint256 _amount
    ) public view returns (uint256[3] memory) {
        MemedToken token = MemedToken(_token);
        uint256 currentSupply = token.totalSupply();
        uint256 newSupply = currentSupply + _amount;
        uint256 f_b = k * newSupply + offset;
        uint256 result = ((_amount * f_b) / SCALING_FACTOR);
        uint256 fee = (result * tradeFeePercent) / 10000;
        return [result + fee, result, fee];
    }

    function getTokens(address _token) external view returns (AllTokenData[] memory) {
        uint length = _token != address(0) ? 1 : tokens.length;
        AllTokenData[] memory allTokens = new AllTokenData[](length);
        for (uint256 i = 0; i < length; i++) {
        address tokenAddress = _token != address(0) ? _token : tokens[i];
        MemedToken token = MemedToken(tokenAddress);
        allTokens[i] = AllTokenData({
            token: tokenAddress,
            supply: token.totalSupply(),
            name: tokenData[tokenAddress].name,
            ticker: tokenData[tokenAddress].ticker,
            description: tokenData[tokenAddress].description,
            image: tokenData[tokenAddress].image,
            owner: tokenData[tokenAddress].owner,
            stage: tokenData[tokenAddress].stage,
            collateral: tokenData[tokenAddress].collateral,
            createdAt: tokenData[tokenAddress].createdAt
        });
        }
        return allTokens;
    }

    receive() external payable {}
}
