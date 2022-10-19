# Rust -> WASM implementation of "Snake"
This is a fun reference project I completed in order to learn a bit about Rust and WebAssembly.
- `cargo install wasm-pack`
- `wasm-pack build --target web` compiles to WASM and populates the `pkg` folder with TypeScript bindings.
- `cd www && npm install && npm run dev` to install dependencies and start the server on 8080

Note that hot reload on changes to `pkg` is pretty janky, but restarting the dev server seems to take care of it. I have also had some issues with the VS Code TypeScript extension not noticing that new TS bindings have been generated for Rust, so intellisense produces false errors.
