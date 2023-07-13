// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ContractA {
    address public owner;
    constructor (address _owner){
        owner = _owner;
    }
}

contract ContractFactory {
    event Deployed(address addr);

    // new方法创建时需要将ContractA合约和Factory合约放在一起
    function deploy_new() external {
        ContractA _contractA = new ContractA(msg.sender);
        emit Deployed(address(_contractA));
    }

    // new方法也可以部署到指定的地址
    function deploy_new2(uint _salt) external {
        ContractA _contractA = new ContractA{
            salt:bytes32(_salt)
        }(msg.sender);
        emit Deployed(address(_contractA));
    }

    //部署合约需要子合约的bytecode，salt
    function deploy_create2(bytes memory bytecode, uint _salt) public payable {
        address addr;
        assembly {
            addr := create2(
                0,
                add(bytecode, 0x20),
                mload(bytecode), 
                _salt 
            )

            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }    
        }
        emit Deployed(addr);
    }

    // 根据工厂合约地址、salt和子合约字节码预测子合约的部署地址
    function getAddress(bytes memory bytecode,uint _salt) public view returns(address){
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),address(this),_salt, keccak256(bytecode)
            )
        );
        return address(uint160(uint(hash)));
    }
    // 获取子合约的byteocde和构造参数代码
    function getBytecode(address _owner) public pure returns(bytes memory){
        // 存储 ContractA 合约的创建字节码
        bytes memory bytecode  = type(ContractA).creationCode;
        // 创建一个新的合约实例时，需要提供构造函数的参数。
        // 这些参数需要被编码并与合约的创建代码一起发送到 new 指令，以便在区块链上创建新的合约
        return abi.encodePacked(bytecode,abi.encode(_owner));
    }
}