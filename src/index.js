import * as yup from 'yup';

export default class Rules {
    constructor(rules) {
        this.rules = [...rules];
    }

    isRule(arg) {
        if (Array.isArray(arg) && Array.isArray(arg[0]) && yup[arg[0][0]]) {
            return true;
        }

        return false;
    }

    handleObject(obj) {
        var handledObj = {};
        for (var key in obj) {
            handledObj[key] = obj.hasOwnProperty(key) && this.isRule(obj[key])
                ? new Rules(obj[key]).toYup() : obj[key]
        }

        return handledObj
    }

    processArgs(args) {
        return args.reduce((result, arg) => {
            // test for arg !== null, because typeof null === "object", but null.constructor is Uncaught TypeError
            if (arg !== null && typeof arg === 'object' && arg.constructor === Object && !Array.isArray(arg)) {
                return [ ...result, this.handleObject(arg)];
            } else if (this.isRule(arg)) {
                return [ ...result, new Rules(arg).toYup()];
            }

            return [ ...result, arg ];
        }, [])
    }

    toYup() {
        var [[type, ...typeArgs], ...rules] = this.rules;
        if (!type || !yup[type]) {
            throw new Error('Type ' + type + ' does not exist');
        }

        let ruleTypeArgs = this.processArgs(typeArgs);

        var yupRule = yup[type](...ruleTypeArgs);
        rules.forEach(([fn, ...rule]) => {
            if (!fn || !yupRule[fn]) {
                throw new Error('Method ' + fn + ' does not exist');
            }

            let args = this.processArgs(rule);
            yupRule = yupRule[fn](...args)
        })

        return yupRule
    }
}
