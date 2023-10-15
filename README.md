# Cevali

Create, extend, and validate inputs in JavaScript. Cevali is a library that allows you to create and extend validators to validate inputs.

<p align="center">
  <a href="https://www.npmjs.com/package/cevali">
    <img src="https://img.shields.io/badge/version-0.0.0" alt="Version" />
  </a>
  <a href="https://github.com/jorenrui/cevali/tree/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" />
  </a>
</p>

## Installation

Install `cevali` using [yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/):

```bash
npm install --save cevali

# or
yarn add cevali
```

## Usage

```js
import { create, TYPE } from "cevali";

// Create a schema type
const string = create('string', TYPE.string);

// Create your own validators
const email = string.create((value: string) => {
  if (!value.includes("@"))
    throw new Error("Invalid email");
});
email.displayName = "email";

const blocklisted = string.create((value: string, blocklisted: string[]) => {
  if (blocklisted.includes(value))
    throw new Error("Blocklisted word");
});
blocklisted.displayName = "blocklisted";

// Create a pipe
const validate = string([minLength(5), maxLength(10)]);

// Validate
try {
  validate("hello");
} catch (error) {
  console.log(error.message);
}
```

You can create your own custom types:

```js
import { create } from 'cevali';

class User {
  name: string;
  access: "admin" | "user" | "guest";

  constructor(name: string, access: "admin" | "user" | "guest" = "guest") {
    this.name = name;
    this.access = access;
  }
}

const userSchema = create("user", new User(''), (value) => {
  if (typeof value === "string")
    return new User(value);

  if (!(value instanceof User))
    throw new Error("Invalid user");

  return value;
});

const isAdmin = userSchema.create((value: User) => {
  if (value.access !== "admin")
    throw new Error("Not admin");
});

const validate = userSchema([isAdmin()]);

try {
  validate(new User("john"));
} catch (ex) {
  console.log(ex.message);
}
```

## License

MIT © [Joeylene Rivera](https://github.com/jorenrui)
