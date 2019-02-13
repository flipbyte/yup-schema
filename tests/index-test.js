import expect from 'expect'
import Rules from '../src/index'
import * as yup from 'yup';

describe('Basic Schema', () => {
    let config

    before(() => {
        config = [
            ['object'],
            ['shape', {
                simpleFieldset: [
                    ['object'],
                    ['shape', {
                        title: [
                            ['string'],
                            ['required'],
                            ['matches', /^[a-zA-Z][a-zA-Z0-9]+$/]
                        ]
                    }]
                ],
                title: [
                    ['string'],
                    // ['required']
                    ['when', 'simpleFieldset.title', {
                        is: false,
                        then: [
                            ['string'],
                            ['required'],
                            ['min', 5]
                        ],
                        otherwise: [
                            ['string'],
                            ['nullable']
                        ]
                    }]
                ],
                simple: [
                    ['array'],
                    ['of', [
                        ['object'],
                        ['shape', {
                            name: [
                                ['string'],
                                ['required']
                            ],
                            age: [
                                ['number'],
                                ['required'],
                                ['min', 18]
                            ],
                            dob: [
                                ['date'],
                                ['required']
                            ]
                        }]
                    ]]
                ],
                nested: [
                    ['array'],
                    ['of', [
                        ['object'],
                        ['shape', [{
                            name: [
                                ['string'],
                                ['required']
                            ],
                            travelHistory: [
                                ['array'],
                                ['of', [
                                    ['object'],
                                    ['shape', {
                                        date: [
                                            ['date']
                                        ],
                                        location: [
                                            ['string'],
                                            ['when', 'date', {
                                                is: true,
                                                then: [
                                                    ['string'],
                                                    ['required'],
                                                    ['min', 2]
                                                ],
                                                otherwise: [
                                                    ['string'],
                                                    ['nullable']
                                                ]
                                            }]
                                        ]
                                    }]
                                ]]
                            ]
                        }]]
                    ]]
                ]
            }]
        ]
    })

    // after(() => {
    //     document.body.removeChild(app)
    // })

    it('testing', () => {
        // require('src/index')
        // expect(app.innerHTML).toContain('Welcome to array-to-yup')
        let rules = new Rules(config)
        let schema = rules.toYup()
        // console.log(schema);
        // console.log()
        // console.log('string-required', yup.string().required())
        // console.log()
        // console.log(yup.object().shape({
        //     title: yup.string().required()
        // }))
        // if(schema.validate({})) {
        //     console.log(true)
        // } else {
        //     console.log(false)
        // }

        schema
            .isValid({
                // simpleFieldset: {
                //     title: 'fsfsdf'
                // },
                // title: 'fd'
            })
            // .catch(function(err) {
            //   err.name; // 'ValidationError'
            //   console.log('err', err); // => ['Deve ser maior que 18']
            // })
            .then(function(valid, errors) {
                console.log(valid)
                // console.log(errors)
                // console.log(schema.errors)
            })
        console.log(schema.errors)
    })
})
