// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Ownable} from "@openzeppelin/contracts@4.8.2/access/Ownable.sol";
import {IERC165} from "@openzeppelin/contracts@4.8.2/utils/introspection/IERC165.sol";

contract L2Storage is Ownable, IERC165 {

	function supportsInterface(bytes4 x) external pure returns (bool) {
		return x == type(IERC165).interfaceId; // 0x01ffc9a7 
	}

	event AdminChanged(address indexed op, bool indexed admin);
	event DataChanged(string indexed node, string indexed key, uint256 nonce);
	
	event GraphTokenChanged(uint256 indexed tokenId, string indexed key, string indexed value);
  	event GraphAddressChanged(uint256 indexed tokenId, string indexed key, string indexed value);
	event GraphTokenBytesChanged(uint256 indexed tokenId, string indexed key, bytes value);
  	event GraphAddressBytesChanged(uint256 indexed tokenId, string indexed key, bytes value);

	mapping (string => mapping(string => bytes)) _data;
	mapping (string => uint256) _nonce;
	mapping (address => bool) _admin;

	modifier onlyAdmin {
		require(_admin[msg.sender], "not admin");
		_;
	}

	constructor() {
		_admin[msg.sender] = true; 
	}

	function setAdmin(address op, bool admin) onlyOwner external {
		_admin[op] = admin;
		emit AdminChanged(op, admin);
	}
	function setData(string memory node, string memory key, bytes memory v) onlyAdmin public {
		_data[node][key] = _data[node][key] = v;
		uint256 nonce = ++_nonce[node];
		emit DataChanged(node, key, nonce);
	}
	function setString(string calldata node, string memory key, string memory s) public {
		setData(node, key, bytes(s));
	}
	function setDataWithGraphTokenData(string calldata node, string memory key, bytes memory v, uint256 tokenId) external {
		emit GraphTokenBytesChanged(tokenId, key, v);
		setData(node, key, v);
	}
	function setDataWithGraphAddressData(string calldata node, string memory key, bytes memory v, uint256 tokenId) external {
		emit GraphAddressBytesChanged(tokenId, key, v);
		setData(node, key, v);
	}
	function setStringWithGraphTokenData(string calldata node, string memory key, string memory s, uint256 tokenId) external {
		emit GraphTokenChanged(tokenId, key, s);
		setString(node, key, s);
	}
	function setStringWithGraphAddressData(string calldata node, string memory key, string memory s, uint256 tokenId) external {
		emit GraphAddressChanged(tokenId, key, s);
		setString(node, key, s);
	}
	function getData(string calldata node, string calldata key) external view returns (bytes memory v) {
		v = _data[node][key];
	}
	function getNonce(string calldata node) external view returns (uint256 nonce) {
		nonce = _nonce[node];
	}    
	function getBatchData(string calldata node, string[] calldata keys) external view returns (uint256 nonce, bytes[] memory vs) {
		vs = new bytes[](keys.length);
		mapping (string => bytes) storage ref = _data[node];
		for (uint256 i; i < keys.length; i++) {
			vs[i] = ref[keys[i]];
		}
		nonce = _nonce[node];
	}
	
	function multicall(bytes[] calldata calls) external returns (bytes[] memory results) {
		results = new bytes[](calls.length);
		for(uint i = 0; i < calls.length; i++) {
			(bool success, bytes memory result) = address(this).delegatecall(calls[i]);
			if (!success) {
				assembly {
					let ptr := mload(0x40)
					mstore(ptr, returndatasize())
					returndatacopy(ptr, 0, returndatasize())
					revert(ptr, returndatasize())
				}
			}
			results[i] = result;
		}
		return results;
	}
}