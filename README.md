# Murphy.js

*A functional interface for information hiding and inheritance.*

> **Murphy's Law:** If there are two or more ways to do something, and one of
> those ways can result in a catastrophe, then someone will do it.

JavaScript does not provide an effective mechanism for encapsulating data.

"Classes" (and, in ECMAScript 6, the `class` keyword) do not provide syntactic
support for private or protected fields.

```js
class Person {
    constructor(name) {
        this._name = name;
    }
    hello() {
        console.log('Hi, my name is "' + this._name + '".');
    }
}

function Person(name) {
    this._name = name;
}
Person.prototype.hello = function () {
    console.log('Hi, my name is "' + this._name + '".');
};

var joe = new Person('Joe');
console.log(joe._name); // "Joe"
```

It is a major shortcoming that `_name` is accessible from the outside, because
there is no reason for it to be, and it would be unreliable for a programmer to
depend on its accessibility.

To achieve privacy, one must use `var`.

```js
function Person(options) {
    var name = options.name;
    this.hello = function () {
        console.log('Hi, my name is "' + name + '".');
    };
}
```

But the data cannot be shared by inheritors.

```js
class Mayor extends Person {
    constructor() {
        this.hello = function () {
            // ReferenceError: name is not defined
            console.log('Good day, citizen! My name is "' + name + '".');
        };
    }
}
```

We want "protected" data that can be accessed by the lineage but is inaccessible
to the outside world.

Meet Murphy:

```js
var makeConstructor = murphy();
var makePerson = makeConstructor(null, function (self, options) {
    self.protected.name = options.name;
    self.public.hello = function () {
        console.log('Hi, my name is "' + self.protected.name + '".');
    };
});
var makeMayor = makeConstructor(makePerson, function (self, options) {
    self.public.hello = function () {
        console.log('Good day, citizen! My name is "' + self.protected.name + '".');
    };
});

var person = makePerson({
    name: 'Joe'
});
person.hello(); // Hi, my name is "Joe".
console.log(person.name); // undefined

var mayor = makeMayor({
    name: 'Bob'
});
mayor.hello(); // Good day, citizen! My name is "Bob".
console.log(mayor.name); // undefined
```

With Murphy, you don't need "prototypal" constructors, `new`, `this`, or even
the `class` keyword or `() => {}` ("fat arrow" functions). All you need is
`makeConstructor` and `function`.

With Murphy, you can build extensible interfaces that don't expose private
data. Thanks to encapsulation, the things that can go wrong when
`_pinkyPromises` are `$$violated`, *cannot* go wrong.

## Installation

Browser:

```bash
bower install --save murphy
```

```html
<script src="bower_components/murphy/murphy.js"></script>
```

Node:

```bash
npm install --save murphy
```

## Usage

Via browser global:

```js
var makeConstructor = murphy();
```

AMD:

```js
require(['murphy'], function (murphy) {
    var makeConstructor = murphy();
});
```

CommonJS:

```js
var murphy = require('murphy');
var makeConstructor = murphy();
```

## Development

To run tests in Node.js:

```bash
npm test
```

To run tests in a browser, open `test.html`.

## License

MIT.
