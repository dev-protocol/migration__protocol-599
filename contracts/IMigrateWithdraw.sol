pragma solidity 0.5.17;

contract IMigrateWithdraw {
	function __initLastWithdraw(
		address _property,
		address _user,
		uint256 _cHoldersPrice
	) public;

	function __initLastTransfer(
		address _property,
		address _to,
		uint256 _cHoldersPrice
	) public;
}
