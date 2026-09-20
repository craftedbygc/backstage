# Theatre.js - Studio

Theatre.js is an animation library for high-fidelity motion graphics. It is designed to help you express detailed animation, enabling you to create intricate movement, and convey nuance.

Theatre.js can be used both programmatically _and_ visually.

You can use Theatre.js to:

* Animate 3D objects made with THREE.js or other 3D libraries
* Animate HTML/SVG via React or other libraries
* Design micro-interactions
* Choreograph generative interactive art
* Or animate any other JS variable

## Documentation

Guides and API reference live in the monorepo `docs/` workspace. Run `yarn docs:dev` from the repo root, or see the deployed site from [craftedbygc/theatre](https://github.com/craftedbygc/theatre).

## `@unseenco/theatre-studio`

Theatre.js comes in two packages: `@unseenco/theatre-core` (the library) and `@unseenco/theatre-studio` (the editor). This package is the editor, which is only used during design/development.

## License

Your use of Theatre.js is governed under the Apache License Version 2.0:

* Theatre's core (`@unseenco/theatre-core`) is released under the Apache License.
* The studio (`@unseenco/theatre-studio`) is released under the AGPL 3.0 License. This is the package that you use to edit your animations, setup your scenes, etc. You only use the studio during design/development. Your project's final bundle only includes `@unseenco/theatre-core`, so only the Apache License applies.
