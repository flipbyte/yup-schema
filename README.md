# yup-schema
[Developed by Flipbyte](https://www.flipbyte.com/)

This project was cloned from the Flipbyte project because that project was no longer being patched and maintained. 

[![npm package][npm-badge]][npm]
[![license][license-badge]][license]

yup-schema is a simple library that allows you to write yup rules using arrays.

## Installation

```sh
npm i @flipbyte/yup-schema
```

## Usage

The library considers each `yup` method to be an array within a main array, with method name as the first value, followed by the arguments (if any).

### Example

```js
yup.object().shape({
    name: yup.string().required(),
    age: yup.number().min(18)
})
```

would become

```js
[['object'], ['shape', {
    name: [['string'], ['required']],
    age: [['number'], ['min', 18]]
}]]
```

## License
The MIT License (MIT)

[npm-badge]: https://img.shields.io/npm/v/yup-schema.svg
[npm]: https://www.npmjs.com/package/yup-schema

[license-badge]: https://badgen.now.sh/badge/license/MIT
[license]: ./LICENSE
