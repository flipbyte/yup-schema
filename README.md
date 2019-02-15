# yup-schema
[Powered by Flipbyte](https://www.flipbyte.com/)

[![Build Status][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coverage Status][coveralls-badge]][coveralls]
[![license][license-badge]][license]
[![Codacy Badge][codacy-badge]][codacy]

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

[build-badge]: https://travis-ci.org/flipbyte/yup-schema.svg?branch=master
[build]: https://travis-ci.org/flipbyte/yup-schema

[npm-badge]: https://img.shields.io/npm/v/@flipbyte/yup-schema.svg
[npm]: https://www.npmjs.com/package/@flipbyte/yup-schema

[coveralls-badge]: https://coveralls.io/repos/github/flipbyte/yup-schema/badge.svg
[coveralls]: https://coveralls.io/github/flipbyte/yup-schema

[license-badge]: https://badgen.now.sh/badge/license/MIT
[license]: ./LICENSE

[codacy-badge]: https://api.codacy.com/project/badge/Grade/18e71277b7e94ad9aca885b5ba3d890c
[codacy]: https://www.codacy.com/app/easeq/yup-schema?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=flipbyte/yup-schema&amp;utm_campaign=Badge_Grade
