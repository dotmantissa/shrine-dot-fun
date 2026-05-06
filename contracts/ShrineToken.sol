// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ShrineToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    uint256 public maxSupply;

    address public curve;
    address public dexRouter;
    address public creator;
    uint256 public launchTimestamp;
    string public description;
    string public imageURI;
    string public twitterHandle;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    modifier onlyCurve() {
        require(msg.sender == curve, "ONLY_CURVE");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply,
        string memory _description,
        string memory _imageURI,
        string memory _twitterHandle,
        address _creator
    ) {
        name = _name;
        symbol = _symbol;
        maxSupply = _maxSupply;
        description = _description;
        imageURI = _imageURI;
        twitterHandle = _twitterHandle;
        creator = _creator;
        launchTimestamp = block.timestamp;
    }

    function setCurve(address _curve) external {
        require(curve == address(0), "CURVE_SET");
        curve = _curve;
    }

    function setDexRouter(address _dexRouter) external onlyCurve {
        dexRouter = _dexRouter;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "ALLOWANCE");
        if (allowed != type(uint256).max) allowance[from][msg.sender] = allowed - amount;
        _transfer(from, to, amount);
        return true;
    }

    function mint(address to, uint256 amount) external onlyCurve {
        require(totalSupply + amount <= maxSupply, "MAX_SUPPLY");
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function burn(address from, uint256 amount) external onlyCurve {
        require(balanceOf[from] >= amount, "BALANCE");
        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(balanceOf[from] >= amount, "BALANCE");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }
}
