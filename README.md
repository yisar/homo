# Necha

A language with pragmatic design choices to creatively explore type systems and code generation topics.

For now, necha can execute simple programs, the code is a mess and naive since I'm just experimenting with the syntax and semantics, no analysis is done at all at the moment,internally is transpiled to javascript and run in a [quickjs](https://bellard.org/quickjs/ "QuickJS engine") runtime.

The grammar and the parser of the language is written with the help of [tree-sitter](https://tree-sitter.github.io/tree-sitter/ "Tree-sitter lib") library

## Example

log is the only function imported from the runtime

hello.nec:
```
fact = \n . if n <= 1 
              1
            else
              (fact n - 1) * n

main = \. {
  name = "fellow user"
  log "hello" name ", have a cake 🎂!"
  log "the factorial of 5 = " (fact 5)
}
```
### Building

It requires zig (nightly) and the -fstage1 option when building due an error in the code generation in the stage2 compiler

Linux and windows should work (not tested on macos):

```
$ zig build -fstage1
$ # test the binary
$ ./zig-out/necha hello.nec
hello world, have a cake 🎂

the factorial of 5 =  120
```

### Planned features

* Strong/Static/Sound type system
* it's own runtime and garbage collector
* code generation/transpile to javascript

