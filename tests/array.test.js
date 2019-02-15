import Rules from '../src/index'
import * as yup from 'yup';

describe('Array types', () => {
    describe('casting', () => {
        it('should parse json strings', () => {

            new Rules([
                    ['array']
                ]).toYup()
                .cast('[2,3,5,6]')
                .should.eql([2, 3, 5, 6]);
        });

        it('should return null for failed casts', () => {
            expect(new Rules([
                ['array']
            ]).toYup().cast('asfasf', {
                assert: false
            })).to.equal(null);

            expect(new Rules([
                ['array']
            ]).toYup().cast(null, {
                assert: false
            })).to.equal(null);
        });

        it('should recursively cast fields', () => {
            new Rules([
                    ['array'],
                    ['of', [
                        ['number']
                    ]]
                ]).toYup()
                .cast(['4', '5'])
                .should.eql([4, 5]);

            new Rules([
                    ['array'],
                    ['of', [
                        ['string']
                    ]]
                ]).toYup()
                .cast(['4', 5, false])
                .should.eql(['4', '5', 'false']);
        });
    });

    it('should handle DEFAULT', () => {
        expect(new Rules([
            ['array']
        ]).toYup().default()).to.equal(undefined);

        new Rules([
                ['array'],
                ['default', () => [1, 2, 3]]
            ]).toYup()
            .default()
            .should.eql([1, 2, 3]);
    });

    it('should type check', () => {
        var inst = new Rules([
            ['array']
        ]).toYup();

        inst.isType([]).should.equal(true);
        inst.isType({}).should.equal(false);
        inst.isType('true').should.equal(false);
        inst.isType(NaN).should.equal(false);
        inst.isType(34545).should.equal(false);

        expect(inst.isType(null)).to.equal(false);

        inst
            .nullable()
            .isType(null)
            .should.equal(true);
    });

    it('should cast children', () => {
        new Rules([
                ['array'],
                ['of', [
                    ['number']
                ]]
            ]).toYup()
            .cast(['1', '3'])
            .should.eql([1, 3]);
    });

    it('should concat subType correctly', () => {
        expect(
            new Rules([
                ['array'],
                ['of',
                    [
                        ['number']
                    ]
                ],
                ['concat', [
                    ['array']
                ]]
            ]).toYup()._subType
        ).to.exist;

        expect(
            new Rules([
                ['array'],
                ['of',
                    [
                        ['number']
                    ]
                ],
                ['concat', [
                    ['array'],
                    ['of', false]
                ]]
            ]).toYup()._subType
        ).to.equal(false);
    });

    it('should pass options to children', () => {
        var rules = [
            ['array', [
                ['object', {
                    name: [
                        ['string']
                    ]
                }]
            ]]
        ]
        let inst = new Rules(rules).toYup();
        inst
            .cast([{
                id: 1,
                name: 'john'
            }], {
                stripUnknown: true
            })
            .should.eql([{
                name: 'john'
            }]);
    });

    describe('validation', () => {
        it('should allow undefined', async () => {
            await new Rules([
                    ['array'],
                    ['of',
                        [
                            ['number'],
                            ['max', 5]
                        ]
                    ]
                ]).toYup()
                .isValid()
                .should.become(true);
        });

        it('should not allow null when not nullable', async () => {
            await new Rules([
                    ['array']
                ]).toYup()
                .isValid(null)
                .should.become(false);

            await new Rules([
                    ['array'],
                    ['nullable']
                ]).toYup()
                .isValid(null)
                .should.become(true);
        });

        it('should respect subtype validations', async () => {
            var inst = new Rules([
                ['array'],
                ['of',
                    [
                        ['number'],
                        ['max', 5]
                    ]
                ]
            ]).toYup();

            await inst.isValid(['gg', 3]).should.become(false);
            await inst.isValid([7, 3]).should.become(false);

            let value = await inst.validate(['4', 3]);

            value.should.eql([4, 3]);
        });

        it('should prevent recursive casting', async () => {
            let castSpy = sinon.spy(yup.string.prototype, '_cast');
            let inst = new Rules([
                ['array', [
                    ['string']
                ]]
            ]).toYup()
            let value = await inst.validate([5]);

            value[0].should.equal('5');

            castSpy.should.have.been.called.once;
            yup.string.prototype._cast.restore();
        });
    });

    it('should respect abortEarly', () => {
        let inst = new Rules([
            ['array'],
            ['of', [
                ['object', {
                    str: [
                        ['string'],
                        ['required']
                    ]
                }]
            ]],
            ['test', 'name', 'oops', () => false]
        ]).toYup();

        return Promise.all([
            inst
            .validate([{
                str: ''
            }])
            .should.be.rejected.then(err => {
                err.value.should.eql([{
                    str: ''
                }]);
                err.errors.length.should.equal(1);
                err.errors.should.eql(['oops']);
            }),

            inst
            .validate([{
                str: ''
            }], {
                abortEarly: false
            })
            .should.be.rejected.then(err => {
                err.value.should.eql([{
                    str: ''
                }]);

                err.errors.length.should.equal(2);
                err.errors.should.eql(['[0].str is a required field', 'oops']);
            }),
        ]);
    });

    it('should compact arrays', () => {
        var arr = ['', 1, 0, 4, false, null],
            inst = new Rules([
                ['array']
            ]).toYup();

        inst
            .compact()
            .cast(arr)
            .should.eql([1, 4]);

        inst
            .compact(v => v == null)
            .cast(arr)
            .should.eql(['', 1, 0, 4, false]);
    });

    it('should ensure arrays', () => {
        let inst = new Rules([
            ['array'],
            ['ensure']
        ]).toYup();

        const a = [1, 4];
        inst.cast(a).should.equal(a);

        inst.cast(null).should.eql([]);
    });
});
