# yup-schema

yup-schema is a simple library that allows you to write yup rules using arrays.

## Installation

```
npm i @flipbyte/yup-schema 
```

## Usage

The library considers each `yup` method to be an array within a main array, with method name as the first value, followed by the arguments (if any).

### Example

```
yup.object().shape({
    name: yup.string().required(),
    age: yup.number().min(18)
})
```

would become

```
[['object'], ['shape', {
    name: [['string'], ['required']],
    age: [['number'], ['min', 18]]
}]]
```
