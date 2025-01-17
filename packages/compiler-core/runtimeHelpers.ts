export const FRAGMENT = Symbol();
export const CREATE_VNODE = Symbol();
export const CREATE_ELEMENT_VNODE = Symbol();
export const RESOLVE_COMPONENT = Symbol(``);
export const WITH_DIRECTIVES = Symbol();
export const RENDER_LIST = Symbol();
export const TO_DISPLAY_STRING = Symbol();
export const TO_HANDLER_KEY = Symbol();
export const UNREF = Symbol();

export const helperNameMap: Record<symbol, string> = {
  [FRAGMENT]: `Fragment`,
  [CREATE_VNODE]: `createVNode`,
  [CREATE_ELEMENT_VNODE]: `createElementVNode`,
  [RESOLVE_COMPONENT]: `resolveComponent`,
  [TO_DISPLAY_STRING]: `toDisplayString`,
  [TO_HANDLER_KEY]: `toHandlerKey`,
  [WITH_DIRECTIVES]: `withDirectives`,
  [RENDER_LIST]: `renderList`,
  [UNREF]: `unref`,
};

export function registerRuntimeHelpers(helpers: Record<symbol, string>) {
  Object.getOwnPropertySymbols(helpers).forEach((s) => {
    helperNameMap[s] = helpers[s];
  });
}
