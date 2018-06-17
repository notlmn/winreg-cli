const {HIVES} = require('winreg');

const REG_TYPES = {
	none: 'REG_NONE',
	string: 'REG_SZ',
	mstring: 'REG_MULTI_SZ',
	estring: 'REG_EXPAND_SZ',
	dword: 'REG_DWORD',
	qword: 'REG_QWORD',
	binary: 'REG_BINARY'
};

module.exports = {
	HIVES,
	REG_TYPES
};
