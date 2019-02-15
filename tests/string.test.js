import Rules from '../src/index'
import * as yup from 'yup';
import * as TestHelpers from './helpers';

describe('String types', () => {
    describe('casting', () => {
        let schema = new Rules([
            ['string']
        ]).toYup();

        TestHelpers.castAll(schema, {
          valid: [
            [5, '5'],
            ['3', '3'],
            //[new String('foo'), 'foo'],
            ['', ''],
            [true, 'true'],
            [false, 'false'],
            [0, '0'],
            [null, null, schema.nullable()],
          ],
          invalid: [null],
        });

        describe('ensure', () => {
            let schema = new Rules([
                ['string'],
                ['ensure']
            ]).toYup();

            TestHelpers.castAll(schema, {
              valid: [
                [5, '5'],
                ['3', '3'],
                [null, ''],
                [undefined, ''],
                [null, '', schema.default('foo')],
                [undefined, 'foo', schema.default('foo')],
              ],
            });
        });

        it('should trim', () => {
            schema
                .trim()
                .cast(' 3  ')
                .should.equal('3');
        });

        it('should transform to lowercase', () => {
            schema
                .lowercase()
                .cast('HellO JohN')
                .should.equal('hello john');
        });

        it('should transform to uppercase', () => {
            schema
                .uppercase()
                .cast('HellO JohN')
                .should.equal('HELLO JOHN');
        });

        it('should handle nulls', () => {
            expect(
                schema
                .nullable()
                .trim()
                .lowercase()
                .uppercase()
                .cast(null),
            ).to.equal(null);
        });
    });

    it('should handle DEFAULT', function() {
        var inst = new Rules([
            ['string']
        ]).toYup();

        inst
            .default('my_value')
            .required()
            .default()
            .should.equal('my_value');
    });

    it('should type check', function() {
        var inst = new Rules([
            ['string']
        ]).toYup();

        inst.isType('5').should.equal(true);
        inst.isType(new String('5')).should.equal(true);
        inst.isType(false).should.equal(false);
        inst.isType(null).should.equal(false);
        inst
            .nullable(false)
            .isType(null)
            .should.equal(false);
    });

    it('should VALIDATE correctly', function() {
        var inst = new Rules([
            ['string'],
            ['required'],
            ['min', 4],
            ['strict']
        ]).toYup();

        return Promise.all([
            new Rules([
                ['string'],
                ['strict']
            ]).toYup()
            .isValid(null)
            .should.eventually.equal(false),

            new Rules([
                ['string'],
                ['strict'],
                ['nullable', true]
            ]).toYup()
            .isValid(null)
            .should.eventually.equal(true),

            inst
            .isValid('hello')
            .should.eventually.equal(true),

            inst
            .isValid('hel')
            .should.eventually.equal(false),

            inst
            .validate('')
            .should.be.rejected.then(function(err) {
                err.errors.length.should.equal(1);
            }),
        ]);
    });

    it('should check MATCHES correctly', function() {
        var v = new Rules([
            ['string'],
            ['matches', /(hi|bye)/]
        ]).toYup()

        return Promise.all([
            v.isValid('hi')
            .should.eventually.equal(true),
            v.isValid('nope')
            .should.eventually.equal(false),
            v.isValid('bye')
            .should.eventually.equal(true),
        ]);
    });

    it('MATCHES should include empty strings', () => {
        var v = new Rules([
            ['string'],
            ['matches', /(hi|bye)/]
        ]).toYup()

        return v
            .isValid('')
            .should.eventually.equal(false);
    });

    it('MATCHES should exclude empty strings', () => {
        var v = new Rules([
            ['string'],
            ['matches', /(hi|bye)/, {
                excludeEmptyString: true
            }]
        ]).toYup()

        return v
            .isValid('')
            .should.eventually.equal(true);
    });

    it('EMAIL should exclude empty strings', () => {
        var v = new Rules([
            ['string'],
            ['email']
        ]).toYup()

        return v
            .isValid('')
            .should.eventually.equal(true);
    });

    it('should check MIN correctly', function() {
        var v = new Rules([
            ['string'],
            ['min', 5]
        ]).toYup()

        var obj = new Rules([
            ['object', {
                len: [
                    ['number']
                ],
                name: [
                    ['string'],
                    ['min', yup.ref('len')]
                ]
            }]
        ]).toYup()
        return Promise.all([
            v.isValid('hiiofff')
            .should.eventually.equal(true),
            v.isValid('big')
            .should.eventually.equal(false),
            v.isValid('noffasfasfasf saf')
            .should.eventually.equal(true),

            v.isValid(null)
            .should.eventually.equal(false), // null -> ''
            v.nullable()
            .isValid(null)
            .should.eventually.equal(true), // null -> null

            obj.isValid({
                len: 10,
                name: 'john'
            })
            .should.eventually.equal(false),
        ]);
    });

    it('should check MAX correctly', function() {
        var v = new Rules([
            ['string'],
            ['max', 5]
        ]).toYup()

        var obj = new Rules([
            ['object', {
                len: [
                    ['number']
                ],
                name: [
                    ['string'],
                    ['max', yup.ref('len')]
                ]
            }]
        ]).toYup()

        return Promise.all([
            v.isValid('adgf')
            .should.eventually.equal(true),
            v.isValid('bigdfdsfsdf')
            .should.eventually.equal(false),
            v.isValid('no')
            .should.eventually.equal(true),

            v.isValid(null)
            .should.eventually.equal(false),

            v.nullable()
            .isValid(null)
            .should.eventually.equal(true),

            obj.isValid({
                len: 3,
                name: 'john'
            })
            .should.eventually.equal(false),
        ]);
    });

    it('should check LENGTH correctly', function() {
        var v = new Rules([
            ['string'],
            ['length', 5]
        ]).toYup()

        var obj = new Rules([
            ['object', {
                len: [
                    ['number']
                ],
                name: [
                    ['string'],
                    ['length', yup.ref('len')]
                ]
            }]
        ]).toYup()

        return Promise.all([
            v.isValid('exact')
            .should.eventually.equal(true),
            v.isValid('sml')
            .should.eventually.equal(false),
            v.isValid('biiiig')
            .should.eventually.equal(false),

            v.isValid(null)
            .should.eventually.equal(false),
            v.nullable()
            .isValid(null)
            .should.eventually.equal(true),

            obj.isValid({
                len: 5,
                name: 'foo'
            })
            .should.eventually.equal(false),
        ]);
    });

    it('should check url correctly', function() {
        var v = new Rules([
            ['string'],
            ['url']
        ]).toYup();

        return Promise.all([
            v.isValid('//www.github.com/')
            .should.eventually.equal(true),
            v.isValid('https://www.github.com/')
            .should.eventually.equal(true),
            v.isValid('this is not a url')
            .should.eventually.equal(false),
        ]);
    });

    it('should validate transforms', function() {
        return Promise.all([
            new Rules([
                ['string']
            ]).toYup()
            .trim()
            .isValid(' 3  ')
            .should.eventually.equal(true),

            new Rules([
                ['string'],
                ['lowercase']
            ]).toYup()
            .isValid('HellO JohN')
            .should.eventually.equal(true),

            new Rules([
                ['string'],
                ['uppercase']
            ]).toYup()
            .isValid('HellO JohN')
            .should.eventually.equal(true),

            new Rules([
                ['string'],
                ['trim']
            ]).toYup()
            .isValid(' 3  ', {
                strict: true
            })
            .should.eventually.equal(false),

            new Rules([
                ['string'],
                ['lowercase']
            ]).toYup()
            .isValid('HellO JohN', {
                strict: true
            })
            .should.eventually.equal(false),

            new Rules([
                ['string'],
                ['uppercase']
            ]).toYup()
            .isValid('HellO JohN', {
                strict: true
            })
            .should.eventually.equal(false),
        ]);
    });
});
