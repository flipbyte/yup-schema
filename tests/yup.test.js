import Rules from '../src/index'
import * as yup from 'yup';

describe('Yup', function() {
    it('cast should not assert on undefined', () => {
        (() => new Rules([
            ['string']
        ]).toYup().cast(undefined)).should.not.throw();
    });

    it('cast should assert on undefined cast results', () => {
        (() =>
            new Rules([
                ['string']
            ]).toYup()
            .transform(() => undefined)
            .cast('foo')).should.throw();
    });

    it('cast should respect assert option', () => {
        (() => new Rules([
            ['string']
        ]).toYup().cast(null)).should.throw();

        (() => new Rules([
            ['string']
        ]).toYup().cast(null, {
            assert: false
        })).should.not.throw();
    });

    it('should reach correctly', async () => {
        var num = new Rules([
                ['number']
            ]).toYup(),
            inst = new Rules([
                ['object'],
                ['shape', {
                    num: [
                        ['number'],
                        ['max', 4]
                    ],
                    nested: [
                        ['object'],
                        ['shape', {
                            arr: [
                                ['array'],
                                ['of', [
                                    ['object'],
                                    ['shape', {
                                        num: num
                                    }]
                                ]]
                            ]
                        }]
                    ]
                }]
            ]).toYup()

        yup.reach(inst, '').should.equal(inst);

        yup.reach(inst, 'nested.arr.num').should.equal(num);
        yup.reach(inst, 'nested.arr[].num').should.equal(num);
        yup.reach(inst, 'nested.arr[1].num').should.equal(num);
        yup.reach(inst, 'nested["arr"][1].num').should.not.equal(new Rules([
            ['number']
        ]).toYup());

        let valid = await yup.reach(inst, 'nested.arr[].num').isValid(5);
        valid.should.equal(true);
    });

    it('should reach conditionally correctly', function() {
        var num = new Rules([
                ['number']
            ]).toYup(),
            inst = new Rules([
                ['object'],
                ['shape', {
                    num: [
                        ['number'],
                        ['max', 4]
                    ],
                    nested: [
                        ['object'],
                        ['shape', {
                            arr: [
                                ['array'],
                                ['when', '$bar', function(bar) {
                                    return bar !== 3 ?
                                        new Rules([
                                            ['array'],
                                            ['of', [
                                                ['number']
                                            ]]
                                        ]).toYup() :
                                        new Rules([
                                            ['array'],
                                            ['of', [
                                                ['object'],
                                                ['shape', {
                                                    foo: [
                                                        ['number']
                                                    ],
                                                    num: [
                                                        ['number'],
                                                        ['when', 'foo', foo => {
                                                            if (foo === 5) return num;
                                                        }]
                                                    ]
                                                }]
                                            ]]
                                        ]).toYup()
                                }]
                            ]
                        }]
                    ]
                }]
            ]).toYup()


        let context = {
            bar: 3
        };
        let value = {
            bar: 3,
            nested: {
                arr: [{
                    foo: 5
                }, {
                    foo: 3
                }],
            },
        };

        yup.reach(inst, 'nested.arr.num', value).should.equal(num);
        yup.reach(inst, 'nested.arr[].num', value).should.equal(num);

        yup.reach(inst, 'nested.arr.num', value, context).should.equal(num);
        yup.reach(inst, 'nested.arr[].num', value, context).should.equal(num);
        yup.reach(inst, 'nested.arr[0].num', value, context).should.equal(num);

        // should fail b/c item[1] is used to resolve the schema
        yup.reach(inst, 'nested["arr"][1].num', value, context).should.not.equal(num);

        return yup.reach(inst, 'nested.arr[].num', value, context)
            .isValid(5)
            .then(valid => {
                valid.should.equal(true);
            });
    });

    it('should reach through lazy', async () => {
        let types = {
            '1': new Rules([
                ['object', {
                    foo: [
                        ['string']
                    ]
                }]
            ]).toYup(),
            '2': new Rules([
                ['object', {
                    foo: [
                        ['number']
                    ]
                }]
            ]).toYup(),
        };

        let err = await new Rules([
                ['object', {
                    x: [
                        ['array', [
                            ['lazy', val => types[val.type]]
                        ]]
                    ]
                }]
            ]).toYup()
            .strict()
            .validate({
                x: [{
                    type: 1,
                    foo: '4'
                }, {
                    type: 2,
                    foo: '5'
                }],
            })
            .should.be.rejected;
        err.message.should.match(/must be a `number` type/);
    });
});
