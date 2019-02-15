import Rules from '../src/index'
import * as yup from 'yup';

describe('lazy', function() {
    it('should throw on a non-schema value', () => {
            (() => new Rules([
                ['lazy', () => undefined]
            ]).toYup().validate()).should.throw();
    });

describe('mapper', () => {
    const value = 1;
    let mapper;

    beforeEach(() => {
        mapper = sinon.stub();
        mapper.returns(new Rules([
            ['mixed']
        ]).toYup());
    });

    it('should call with value', () => {
        new Rules([
            ['lazy', mapper]
        ]).toYup().validate(value);
        mapper.should.have.been.calledWith(value);
    });

    it('should call with context', () => {
        const context = {
            a: 1,
        };
        new Rules([
            ['lazy', mapper]
        ]).toYup().validate(value, context);
        mapper.should.have.been.calledWithExactly(value, context);
    });
});
});
