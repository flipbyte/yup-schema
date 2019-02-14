import Rules from '../src/index'
import * as yup from 'yup';

describe('Number types', function() {
    describe('casting', () => {
        let schema = new Rules([['number']]).toYup();

        it('should round', () => {
            schema
                .round('floor')
                .cast(45.99999)
                .should.equal(45);
            schema
                .round('ceIl')
                .cast(45.1111)
                .should.equal(46);
            schema
                .round()
                .cast(45.444444)
                .should.equal(45);

            expect(
                schema
                .nullable()
                .integer()
                .round()
                .cast(null),
            ).to.equal(null);
            (function() {
                schema.round('fasf');
            }.should.throw(TypeError));
        });

        it('should truncate', () => {
            schema
                .truncate()
                .cast(45.55)
                .should.equal(45);
        });

        it('should return NaN for failed casts', () => {
            expect(new Rules([['number']]).toYup().cast('asfasf', {
                assert: false
            })).to.eql(NaN);

            expect(new Rules([['number']]).toYup().cast(null, {
                assert: false
            })).to.eql(NaN);
        });
    });

    it('should handle DEFAULT', function() {
        var inst = new Rules([['number'], ['default', 0]]).toYup()

        inst.default().should.equal(0);
        inst
            .default(5)
            .required()
            .default()
            .should.equal(5);
    });

    it('should type check', function() {
        let inst = new Rules([['number']]).toYup();

        inst.isType(5).should.equal(true);
        inst.isType(new Number(5)).should.equal(true);
        inst.isType(new Number('foo')).should.equal(false);
        inst.isType(false).should.equal(false);
        inst.isType(null).should.equal(false);
        inst.isType(NaN).should.equal(false);
        inst
            .nullable()
            .isType(null)
            .should.equal(true);
    });

    it('should VALIDATE correctly', function() {
        let inst = new Rules([['number'], ['required'], ['min', 4]]).toYup();

        return Promise.all([
            new Rules([['number']]).toYup()
                .isValid(null)
                .should.eventually.equal(false),
            new Rules([['number']]).toYup()
                .nullable()
                .isValid(null)
                .should.eventually.equal(true),
            new Rules([['number']]).toYup()
                .isValid(' ')
                .should.eventually.equal(false),
            new Rules([['number']]).toYup()
                .isValid('12abc')
                .should.eventually.equal(false),
            new Rules([['number']]).toYup()
                .isValid(0xff)
                .should.eventually.equal(true),
            new Rules([['number']]).toYup()
                .isValid('0xff')
                .should.eventually.equal(true),

            inst
                .isValid(5)
                .should.eventually.equal(true),
            inst
                .isValid(2)
                .should.eventually.equal(false),

            inst
                .validate()
                .should.be.rejected.then(function(err) {
                    err.errors.length.should.equal(1);
                    err.errors[0].should.contain('required');
                }),
        ]);
    });

    describe('min', () => {
        var schema = new Rules([['number'], ['min', 5]]).toYup()

        // TestHelpers.validateAll(schema, {
        //     valid: [7, 35738787838, [null, schema.nullable()]],
        //     invalid: [2, null, [14, schema.min(10).min(15)]],
        // });
    });

    describe('max', () => {
        var schema = new Rules([['number'], ['max', 5]]).toYup()

        // TestHelpers.validateAll(schema, {
        //     valid: [4, -5222, [null, schema.nullable()]],
        //     invalid: [10, null, [16, schema.max(20).max(15)]],
        // });
    });

    describe('lessThan', () => {
        var schema = new Rules([['number'], ['lessThan', 5]]).toYup()


        // TestHelpers.validateAll(schema, {
        //     valid: [4, -10, [null, schema.nullable()]],
        //     invalid: [5, 7, null, [14, schema.lessThan(10).lessThan(14)]],
        // });

        it('should return default message', () => {
            return schema
                .validate(6)
                .should.be.rejected.and.eventually.have.property('errors')
                .that.contain('this must be less than 5');
        });
    });

    describe('moreThan', () => {
        var schema = new Rules([['number'], ['moreThan', 5]]).toYup()
        //
        // TestHelpers.validateAll(schema, {
        //     valid: [6, 56445435, [null, schema.nullable()]],
        //     invalid: [5, -10, null, [64, schema.moreThan(52).moreThan(74)]],
        // });

        it('should return default message', () => {
            return schema
                .validate(4)
                .should.be.rejected.and.eventually.have.property('errors')
                .that.contain('this must be greater than 5');
        });
    });

    describe('integer', () => {
        var schema = new Rules([['number'], ['integer']]).toYup()

        // TestHelpers.validateAll(schema, {
        //     valid: [4, -5222],
        //     invalid: [10.53, 0.1 * 0.2, -34512535.626, 3.12312e51, new Date()],
        // });

        it('should return default message', () => {
            return schema
                .validate(10.53)
                .should.be.rejected.and.eventually.have.property('errors')
                .that.contain('this must be an integer');
        });
    });

    it('should check POSITIVE correctly', function() {
        var v = new Rules([['number'], ['positive']]).toYup()

        return Promise.all([
            v.isValid(7)
                .should.eventually.equal(true),

            v.isValid(0)
                .should.eventually.equal(false),

            v.validate(0)
                .should.be.rejected.then(null, function(err) {
                    err.errors[0].should.contain('this must be a positive number');
                }),
        ]);
    });

    it('should check NEGATIVE correctly', function() {
        var v = new Rules([['number'], ['negative']]).toYup()

        return Promise.all([
            v.isValid(-4)
                .should.eventually.equal(true),

            v.isValid(0)
                .should.eventually.equal(false),

            v.validate(10)
                .should.be.rejected.then(null, function(err) {
                    err.errors[0].should.contain('this must be a negative number');
                }),
        ]);
    });
});
