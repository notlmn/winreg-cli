#!/usr/bin/env node

const {promisify} = require('util');
const yargs = require('yargs');
const Registry = require('winreg');
const {REG_TYPES} = require('./constants');
const {humanizePath, machinizePath, validDataType} = require('./util');

// Promisify `winreg`s API
Registry.prototype.get = promisify(Registry.prototype.get);
Registry.prototype.set = promisify(Registry.prototype.set);
Registry.prototype.keys = promisify(Registry.prototype.keys);
Registry.prototype.values = promisify(Registry.prototype.values);
Registry.prototype.create = promisify(Registry.prototype.create);
Registry.prototype.remove = promisify(Registry.prototype.remove);
Registry.prototype.destroy = promisify(Registry.prototype.destroy);
Registry.prototype.keyExists = promisify(Registry.prototype.keyExists);
Registry.prototype.valueExists = promisify(Registry.prototype.valueExists);

function createRegItem(hive, key) {
	const path = machinizePath(humanizePath(key));

	return new Registry({
		hive: hive.toUpperCase(),
		key: path.length > 0 ? `\\${path}` : ''
	});
}

/**
 * Reads the data of a single value item from the registry
 *
 * @param {string} hive The hive to read from
 * @param {string} path Path of the value to read
 */
async function readValueFromReg(hive, path) {
	const regItem = createRegItem(hive, path);

	// Check if the registry item is a key (keys are listed, not read)
	if (await regItem.keyExists()) {
		console.log(`The path specified is a key (${humanizePath(regItem.path)})`);
		return;
	}

	try {
		const valueName = regItem.key.split('\\').pop();
		const regValue = await regItem.parent.get(valueName);
		console.log(regValue.value);
	} catch (e) {
		throw new Error(`The specified path doesn't exist (${humanizePath(regItem.path)})`);
	}
}

/**
 * Outputs the data of a key recursively
 *
 * @param {string} hive The hive to write to
 * @param {string} key The key to log recursively
 * @param {boolean} recursive Used to recursively output subkeys
 * @param {string} [space='  '] Constant used for indentation level
 */
async function listKeyValues(hive, key, recursive, space = '  ') {
	const regItem = createRegItem(hive, key);

	if (!await regItem.keyExists()) {
		throw new Error(`The path specified is not a key or doesn't exit (${humanizePath(regItem.path)})`);
	}

	for (const item of await regItem.keys()) {
		console.log(`${space}/${humanizePath(item.key).split('/').pop()}/`);

		if (recursive) {
			// eslint-disable-next-line no-await-in-loop
			await listKeyValues(hive, item.key, recursive, `${space}  `);
		}
	}

	for (const item of await regItem.values()) {
		console.log(`${space}${item.name}: "${item.value}"`);
	}
}

/**
 * Writes a value to the specified registy path
 *
 * @param {string} hive The hive to write to
 * @param {string} path The path of value (includes value name)
 * @param {string} type The type of value
 * @param {string} valueData The data being stored in the value
 */
async function writeDataToReg(hive, path, type, valueData) {
	const regItem = createRegItem(hive, path);

	if (await regItem.keyExists()) {
		throw new Error('The path provided is a key that already exists');
	}

	const parts = humanizePath(machinizePath(path)).split('/');
	const valueName = parts[parts.length - 1];
	const valueType = REG_TYPES[type];

	if (validDataType(valueType, valueData)) {
		await regItem.parent.set(valueName, valueType, valueData);
	} else {
		throw new Error('The data is not valid for the type specified');
	}
}

/**
 * Deletes a registry key/value
 *
 * @param {string} hive The hive to delete from
 * @param {string} path The key/value to delete
 * @param {boolean} force Required to delete keys/subkeys
 */
async function deleteFromReg(hive, path, force) {
	const regItem = createRegItem(hive, path);

	if (await regItem.keyExists()) {
		if (!force) {
			throw new Error('The path specified is a key. Use --force to delete keys');
		}

		await regItem.destroy();
		return;
	}

	const parts = humanizePath(machinizePath(path)).split('/');
	const valueName = parts[parts.length - 1];

	if (await regItem.parent.valueExists(valueName)) {
		await regItem.parent.remove(valueName);
	}
}

try {
	// eslint-disable-next-line no-unused-variable
	const argv = yargs
		.command(['read <hive> <path>', 'r <hive> <path>'], 'Read a value from the registry', () => {}, async ({hive, path}) => {
			return readValueFromReg(hive, path);
		})
		.command(['list <hive> <key>', 'l <hive> <key>'], 'List subkeys and values of a key', {
			recursive: {
				alias: 'r',
				type: 'boolean',
				default: false,
				describe: 'Recursively list all subkeys'
			}
		}, async ({hive, key, recursive}) => {
			return listKeyValues(hive, key, recursive);
		})
		.command(['write <hive> <path>', 'w <hive> <path>'], 'Write a value to the registry', {
			type: {
				alias: 't',
				type: 'string',
				demandOption: true,
				describe: 'Type of data stored in the value',
				choices: ['string', 'mstring', 'estring', 'dword', 'qword', 'binary', 'none']
			},
			data: {
				alias: 'd',
				type: 'string',
				demandOption: true,
				describe: 'Data to be stored in the value'
			}
		}, async ({hive, path, type, data}) => {
			return writeDataToReg(hive, path, type.toLowerCase(), data);
		})
		.command(['delete <hive> <path>', 'd <hive> <path>'], 'Delete a key/value from the registry', {
			force: {
				alias: 'f',
				type: 'boolean',
				default: false,
				describe: 'Do not prompt for recursive deletions'
			}
		}, async ({hive, path, force}) => {
			return deleteFromReg(hive, path, force);
		})
		.showHelp()
		.argv;
} catch (e) {
	console.error(e);
	process.exit(1);
}
