pragma solidity 0.5.17;

contract ILegacyLockup {
	event Lockedup(address _from, address _property, uint256 _value);

	function difference(address _property, uint256 _lastReward)
		public
		view
		returns (
			uint256 _reward,
			uint256 _holdersAmount,
			uint256 _holdersPrice,
			uint256 _interestAmount,
			uint256 _interestPrice
		);

	function getPropertyValue(address _property)
		external
		view
		returns (uint256);

	function getAllValue() external view returns (uint256);

	function getValue(address _property, address _sender)
		external
		view
		returns (uint256);
}

contract IMigrateLockup is ILegacyLockup {
	function __initStakeOnProperty(
		address _property,
		address _user,
		uint256 _cReward,
		uint256 _cInterestPrice
	) public;

	function __initLastStakeOnProperty(
		address _property,
		uint256 _cHoldersAmountPerProperty,
		uint256 _cHoldersPrice
	) public;

	function __initLastStake(
		uint256 _cReward,
		uint256 _cInterestPrice,
		uint256 _cHoldersPrice
	) public;
}
