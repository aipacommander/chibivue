# chibivue

chibivue is minimal [Vue.js v3](https://github.com/vuejs/core) core implementations (reactivity, vnode, component, compiler).

"chibi" means "small" in Japanese.

This project began in February 2023 with the goal of simplifying the understanding of Vue's core implementation.

Currently, I am still in the process of implementation, but after implementation, I intend to post explanatory articles as well.

(For now, I plan to post Japanese first.)

[example](https://github.com/Ubugeeei/chibivue/tree/main/example/app)

# Online Book

### [English](https://github.com/Ubugeeei/chibivue/tree/main/books/english) | [Japanese](https://github.com/Ubugeeei/chibivue/tree/main/books/japanese)

<br/>
<br/>

# status

## Reactive System

| feature         | impl | book |
| --------------- | ---- | ---- |
| ref             | ✅   | ✅   |
| computed        | ✅   | ✅   |
| reactive        | ✅   | ✅   |
| readonly        | ✅   | ✅   |
| watch           | ✅   | ✅   |
| watchEffect     | ✅   | ✅   |
| isRef           | ✅   | ✅   |
| unref           | ✅   | ✅   |
| toRef           | ✅   | ✅   |
| toRefs          | ✅   | ✅   |
| isProxy         | ✅   | ✅   |
| isReactive      | ✅   | ✅   |
| isReadonly      | ✅   | ✅   |
| shallowRef      | ✅   | ✅   |
| triggerRef      | ✅   | ✅   |
| shallowReactive | ✅   | ✅   |
| customRef       | ✅   | ✅   |
| toRaw           | ✅   | ✅   |
| effectScope     | ✅   | ✅   |
| getCurrentScope | ✅   | ✅   |
| onScopeDispose  | ✅   | ✅   |
| template refs   | ✅   | ✅   |

## Virtual Dom & Renderer

| feature         | impl | book |
| --------------- | ---- | ---- |
| h function      | ✅   | ✅   |
| patch rendering | ✅   | ✅   |
| key attribute   | ✅   | ✅   |
| scheduler       | ✅   | ✅   |
| nextTick        | ✅   | ✅   |
| ssr             |      |      |

## Component System

| feature                      | impl | book |
| ---------------------------- | ---- | ---- |
| Options API (typed)          | ✅   | ✅   |
| Composition API              | ✅   | ✅   |
| lifecycle hooks              | ✅   | ✅   |
| props / emit                 | ✅   | ✅   |
| expose                       | ✅   | ✅   |
| provide / inject             | ✅   | ✅   |
| slot (default)               | ✅   | ✅   |
| slot (named/scoped)          | ✅   | ✅   |
| async component and suspense |      |      |

## Template Compiler

| feature           | impl | book |
| ----------------- | ---- | ---- |
| v-on              | ✅   |      |
| v-bind            | ✅   |      |
| v-for             | ✅   |      |
| v-model           | ✅   |      |
| v-if              |      |      |
| v-show            |      |      |
| mustache          | ✅   |      |
| slot (default)    |      |      |
| slot (named)      |      |      |
| slot (scoped)     |      |      |
| dynamic component |      |      |

## SFC Compiler

| feature                          | impl | book |
| -------------------------------- | ---- | ---- |
| basics (template, script, style) | ✅   | ✅   |
| scoped css                       |      |      |
| script setup                     | ✅   |      |
| compiler macro                   | ✅   |      |

## Extensions and Other Builtin

| feature    | impl | book |
| ---------- | ---- | ---- |
| store      | ✅   |      |
| router     | ✅   |      |
| keep-alive |      |      |
| suspense   |      |      |
