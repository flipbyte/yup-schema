import Rules from '../src/index'
import * as yup from 'yup';

describe('Boolean types', () => {
    let config

    it('should CAST correctly', () => {
        let rules = [['bool']]
        let inst = new Rules(rules).toYup();

        inst.cast('true').should.equal(true);
        inst.cast('True').should.equal(true);
        inst.cast('false').should.equal(false);
        inst.cast('False').should.equal(false);
        inst.cast(1).should.equal(true);
        inst.cast(0).should.equal(false);
    })

    it('should handle DEFAULT', () => {
        let rules = [['bool']]
        let inst = new Rules(rules).toYup();

        expect(inst.default()).to.equal(undefined);
        inst.default(true).required().default().should.equal(true);
    });

    it('should type check', () => {
        let rules = [['bool']]
        let inst = new Rules(rules).toYup();

        inst.isType(1).should.equal(false);
        inst.isType(false).should.equal(true);
        inst.isType('true').should.equal(false);
        inst.isType(NaN).should.equal(false);
        inst.isType(new Number('foooo')).should.equal(false);

        inst.isType(34545).should.equal(false);
        inst.isType(new Boolean(false)).should.equal(true);

        expect(inst.isType(null)).to.equal(false);

        inst.nullable().isType(null).should.equal(true);
    });

    it('bool should VALIDATE correctly', () => {
        let rules = [['bool'], ['required']];
        let inst = new Rules(rules).toYup();

        let instances = [
            new Rules([['bool']]).toYup().isValid('1').should.eventually.equal(true),
            new Rules([['bool'], ['strict']]).toYup().isValid(null).should.eventually.equal(false),
            new Rules([['bool'], ['nullable']]).toYup().isValid(null).should.eventually.equal(true),
            new Rules([['bool'], ['required']]).toYup().validate().should.be.rejected.then(err => {
                err.errors.length.should.equal(1);
                err.errors[0].should.contain('required');
            })
        ]

        return Promise.all(instances)
    });
})
