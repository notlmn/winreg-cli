# winreg-cli

> Command line tool that provides a fluent API for modifying Windows registry

```
C:\> winreg
winreg [command]

Commands:
  winreg read <hive> <path>    Read a value from the registry       [aliases: r]
  winreg list <hive> <key>     List subkeys and values of a key     [aliases: l]
  winreg write <hive> <path>   Write a value to the registry        [aliases: w]
  winreg delete <hive> <path>  Delete a key/value from the registry [aliases: d]

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```

## Installation
```
$ npm install -g winreg-cli
```


## Commands

### `winreg read <hive> <path>`
Reads the data of a single value item from the `path`

### `winreg list <hive> <key> [--recursive|-r]`
Lists the contents of a registry `key`, including subkeys and values

### `winreg write <hive> <path> --type <type> --data <data>`
Stores the given `data` at the specified `path` in the registry

### `winreg delete <hive> <path> [--force|-f]`
Deletes a value item or key from the registry. (The `--force` flag is required to delete keys)


## Possible values

### `<hive>`
* `HKLM`
* `HKCU`
* `HKCR`
* `HKU`
* `HKCC`

### `<type>`
* `none` => `'REG_NONE'`
* `string` => `'REG_SZ'`
* `mstring` => `'REG_MULTI_SZ'`
* `estring` => `'REG_EXPAND_SZ'`
* `dword` => `'REG_DWORD'`
* `qword` => `'REG_QWORD'`
* `binary` => `'REG_BINARY'`

## Known issues
* Cannot read default values
* Cannot write to default values
* Cannot clear a key, only delete the key/value
* Can only create values not empty keys

## License
[MIT](./LICENSE)
