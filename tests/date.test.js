import Rules from '../src/index'
import * as yup from 'yup';

function isValidDate(date) {
    return date instanceof Date && !isNaN(date.getTime());
}

describe('Date types', () => {
    it('should CAST correctly', () => {
        let rules = [
            ['date']
        ]
        let inst = new Rules(rules).toYup();

        inst.cast(new Date()).should.be.a('date');
        inst.cast('jan 15 2014').should.eql(new Date(2014, 0, 15));
        inst.cast('2014-09-23T19:25:25Z').should.eql(new Date(1411500325000));
        // Leading-zero milliseconds
        inst.cast('2016-08-10T11:32:19.012Z').should.eql(new Date(1470828739012));
        // Microsecond precision
        inst.cast('2016-08-10T11:32:19.2125Z').should.eql(new Date(1470828739212));
    });

    it('should return invalid date for failed casts', function() {
        let rules = [
            ['date']
        ]
        let inst = new Rules(rules).toYup();

        inst.cast(null, {
            assert: false
        }).should.not.satisfy(isValidDate);
        inst.cast('', {
            assert: false
        }).should.not.satisfy(isValidDate);
    });

    it('should type check', () => {
        let rules = [
            ['date']
        ]
        let inst = new Rules(rules).toYup();

        inst.isType(new Date()).should.equal(true);
        inst.isType(false).should.equal(false);
        inst.isType(null).should.equal(false);
        inst.isType(NaN).should.equal(false);
        inst
            .nullable()
            .isType(new Date())
            .should.equal(true);
    });

    it('should VALIDATE correctly', () => {
        let rules = [
            ['date'],
            ['required'],
            ['max', new Date(2014, 5, 15)]
        ]
        let inst = new Rules(rules).toYup();

        return Promise.all([
            new Rules([
                ['date']
            ]).toYup()
            .isValid(null)
            .should.eventually.equal(false),
            new Rules([
                ['date'],
                ['nullable']
            ]).toYup()
            .isValid(null)
            .should.eventually.equal(true),

            inst
            .isValid(new Date(2014, 0, 15))
            .should.eventually.equal(true),
            inst
            .isValid(new Date(2014, 7, 15))
            .should.eventually.equal(false),
            inst
            .isValid('5')
            .should.eventually.equal(true),

            inst
            .validate()
            .should.be.rejected.then(err => {
                err.errors.length.should.equal(1);
                err.errors[0].should.contain('required');
            }),
        ]);
    });

    it('should check MIN correctly', () => {
        var min = new Date(2014, 3, 15),
            invalid = new Date(2014, 1, 15),
            valid = new Date(2014, 5, 15);
        (function() {
            new Rules([
                ['date'],
                ['max', 'hello']
            ]).toYup()
        }.should.throw(TypeError));
        (function() {
            new Rules([
                ['date'],
                ['max', yup.ref('$foo')]
            ]).toYup()
        }.should.not.throw());

        return Promise.all([
            new Rules([
                ['date'],
                ['min', min]
            ]).toYup()
            .min(min)
            .isValid(valid)
            .should.eventually.equal(true),
            new Rules([
                ['date'],
                ['min', min]
            ]).toYup()
            .isValid(invalid)
            .should.eventually.equal(false),
            new Rules([
                ['date'],
                ['min', min]
            ]).toYup()
            .isValid(null)
            .should.eventually.equal(false),

            new Rules([
                ['date'],
                ['min', yup.ref('$foo')]
            ]).toYup()
            .isValid(valid, {
                context: {
                    foo: min
                }
            })
            .should.eventually.equal(true),
            new Rules([
                ['date'],
                ['min', yup.ref('$foo')]
            ]).toYup()
            .isValid(invalid, {
                context: {
                    foo: min
                }
            })
            .should.eventually.equal(false),
        ]);
    });

    it('should check MAX correctly', () => {
        var max = new Date(2014, 7, 15),
            invalid = new Date(2014, 9, 15),
            valid = new Date(2014, 5, 15);
        (function() {
            new Rules([
                ['date'],
                ['max', 'hello']
            ]).toYup()
        }.should.throw(TypeError));
        (function() {
            new Rules([
                ['date'],
                ['max', yup.ref('$foo')]
            ]).toYup()
        }.should.not.throw());

        return Promise.all([
            new Rules([
                ['date'],
                ['max', max]
            ]).toYup()
            .isValid(valid)
            .should.eventually.equal(true),
            new Rules([
                ['date'],
                ['max', max]
            ]).toYup()
            .isValid(invalid)
            .should.eventually.equal(false),
            new Rules([
                ['date'],
                ['max', max],
                ['nullable', true]
            ]).toYup()
            .isValid(null)
            .should.eventually.equal(true),

            new Rules([
                ['date'],
                ['max', yup.ref('$foo')]
            ]).toYup()
            .isValid(valid, {
                context: {
                    foo: max
                }
            })
            .should.eventually.equal(true),
            new Rules([
                ['date'],
                ['max', yup.ref('$foo')]
            ]).toYup()
            .isValid(invalid, {
                context: {
                    foo: max
                }
            })
            .should.eventually.equal(false),
        ]);
    });
})
