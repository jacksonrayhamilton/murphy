/*global require */
(function (root) {
    'use strict';
    function fail(message) {
        throw new Error(message);
    }
    function stringify(object) {
        return JSON.stringify(object, null, '  ');
    }
    function forEach(array, iterator) {
        var index;
        for (index = 0; index < array.length; index += 1) {
            iterator(array[index], index, array);
        }
    }
    function assertProperty(object, property) {
        if (object[property] === undefined) {
            fail('Expected property `' + property + '\' to be defined on object `' +
                 stringify(object) + '\'.');
        }
    }
    function assertNoProperty(object, property) {
        if (object[property] !== undefined) {
            fail('Expected property `' + property + '\' not to be defined on object `' +
                 stringify(object) + '\'.');
        }
    }
    function assertPropertyValue(object, property, value) {
        if (object[property] !== value) {
            fail('Expected property `' + property + '\' to have value `' +
                 value + '\' on object `' + stringify(object) +
                 '\', but it was `' + object[property] + '\'.');
        }
    }
    function assertEncapsulationProperties(object) {
        forEach(['private', 'protected', 'public'], function (property) {
            assertProperty(object, property);
        });
    }
    function assertEqual(name, expected, result) {
        if (expected !== result) {
            fail('Expected `' + name + '\' to equal `' + expected +
                 '\' but it was `' + result + '\'.');
        }
    }
    var murphy;
    if (typeof require === 'function') {
        murphy = require('./murphy');
    } else {
        murphy = root.murphy;
    }
    (function () {
        var constructorMaker = murphy();
        var aMaker = constructorMaker(null, function (self, argument1, argument2) {
            assertEncapsulationProperties(self);
            assertEqual('argument1', argument1, 1);
            assertEqual('argument2', argument2, 2);
            self.disappear = 0;
            self.private.a = 1;
            self.protected.b = 2;
            self.public.c = 3;
        });
        var bMaker = constructorMaker(aMaker, function (self, argument1, argument2) {
            assertEncapsulationProperties(self);
            assertEqual('argument1', argument1, 1);
            assertEqual('argument2', argument2, 2);
            assertNoProperty(self, 'disappear');
            assertNoProperty(self.private, 'a');
            assertPropertyValue(self.protected, 'b', 2);
            assertPropertyValue(self.public, 'c', 3);
            self.protected.d = 4;
            self.public.e = 5;
        });
        var cMaker = constructorMaker(bMaker, function (self, argument1, argument2) {
            assertEncapsulationProperties(self);
            assertEqual('argument1', argument1, 1);
            assertEqual('argument2', argument2, 2);
            assertPropertyValue(self.protected, 'b', 2);
            assertPropertyValue(self.public, 'c', 3);
            assertPropertyValue(self.protected, 'd', 4);
            assertPropertyValue(self.public, 'e', 5);
        });
        function assertOutcomeHalf(object) {
            assertNoProperty(object, 'disappear');
            assertNoProperty(object, 'private');
            assertNoProperty(object, 'protected');
            assertNoProperty(object, 'public');
            assertNoProperty(object, 'a');
            assertNoProperty(object, 'b');
            assertPropertyValue(object, 'c', 3);
        }
        function assertOutcome(object) {
            assertOutcomeHalf(object);
            assertNoProperty(object, 'd');
            assertPropertyValue(object, 'e', 5);
        }
        assertOutcomeHalf(aMaker(1, 2));
        assertOutcome(bMaker(1, 2));
        assertOutcome(cMaker(1, 2));
    }());
}(this));
