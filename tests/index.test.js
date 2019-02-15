import Rules from '../src/index'
import * as yup from 'yup';

describe('yup-schema', () => {
    it('invalid yup rule type', () => {
        let rules = new Rules([
            ['something']
        ]);
        (function() {
            rules.toYup()
        }.should.throw(/Type something does not exist/));
    })

    it('invalid yup rule type method', () => {
        let rules = new Rules([
            ['object'],
            ['of', {
                name: [
                    ['string']
                ]
            }]
        ]);
        (function() {
            rules.toYup()
        }.should.throw(/Method of does not exist/));
    })
})
