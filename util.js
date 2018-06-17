const {REG_TYPES} = require('./constants');

/**
 * Converts Windows style path to regular style path
 *
 * @param {string} path Windows style path
 * @returns {string} Converted regular style path
 */
function humanizePath(path) {
	return path.split('\\').filter(Boolean).join('/');
}

/**
 * Converts regular style path to Windows style path
 *
 * @param {string} path Regular style path
 * @returns {string} Converted Windows style path
 */
function machinizePath(path) {
	return path.split('/').filter(Boolean).join('\\');
}

/**
 * Checks of the data is valid for the given value type
 *
 * @param {string} type Type of the given data to validate with
 * @param {string} data The data to validate
 * @returns {boolean} True if data is valid for the given type
 */
function validDataType(type, data) {
	data = data.replace(/\s+/g, '');

	if (type === REG_TYPES.binary) {
		// Binary data can only contain numbers
		return (/^[\d]+$/g).test(data);
	}

	if (type === REG_TYPES.dword || type === REG_TYPES.qword) {
		// DWORDs and QWORDs need to be valid numbers (123) or hexes (0xA1B)
		return (/^([\d]+|0x[a-f\d]+)$/gi).test(data);
	}

	// Any values for string types are valid by default
	return true;
}

module.exports = {
	humanizePath,
	machinizePath,
	validDataType
};
