/*global define, module */
/**
 * @license The MIT License (MIT)
 *
 * Copyright (c) 2015 Jackson Ray Hamilton
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function (root, factory) {
    'use strict';
    // Export murphy as an AMD or CommonJS module, or as a browser global.
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.murphy = factory();
    }
}(this, function factory() {
    'use strict';
    // Create a local constructor maker to implicitly prevent extensions (and
    // thus prevent "dredging" protected values via parasitism).
    return function makeConstructorMaker() {
        // Unique object reference to determine the context in which the
        // constructor is invoked. The context is either through external code,
        // or by a child calling a parent.
        var check = {};
        // `parent' can be `null' or another constructor made by this particular
        // constructor maker.
        return function makeConstructor(parent, constructor) {
            // Wraps the constructor. It calls parents, if any, and passes their
            // data to the constructor. It provides the constructor with a
            // container for private, protected and public members.
            return function inheritor(inheriting) {
                var isInheriting = inheriting === check;
                // Slicing `arguments' is bad for performance, so copy into a
                // new array instead.
                var index = 0;
                var length = arguments.length;
                var argumentsArray = new Array(length);
                for (; index < length; index += 1) {
                    argumentsArray[index] = arguments[index];
                }
                var parentArguments, parentThat, that;
                if (parent) {
                    if (isInheriting) {
                        // Don't prepend the `check' object more than once.
                        parentArguments = argumentsArray;
                    } else {
                        // The first time around, tell the parent it is being
                        // inherited-from.
                        parentArguments = [check].concat(argumentsArray);
                    }
                    // Capture the parent's protected and public members.
                    parentThat = parent.apply(null, parentArguments);
                    // Inherited member container.
                    that = {
                        private: {},
                        protected: parentThat.protected,
                        public: parentThat.public
                    };
                } else {
                    // Base case member container.
                    that = {
                        private: {},
                        protected: {},
                        public: {}
                    };
                }
                if (isInheriting) {
                    // Exclude the `check' object from the constructor's
                    // parameters.
                    constructor.apply(null, [that].concat(argumentsArray.slice(1)));
                    // Recurse.
                    return {
                        protected: that.protected,
                        public: that.public
                    };
                }
                constructor.apply(null, [that].concat(argumentsArray));
                // Stopping case. Automatically export the accumulated
                // public members.
                return that.public;
            };
        };
    };
}));
