import React, { ReactElement, ReactNode } from "react";

export function getParams(ns?: any, opt?: any, cb?: any) {
  let names = ns;
  let options = opt;
  let callback = cb;
  if (cb === undefined) {
    if (typeof names === "function") {
      callback = names;
      options = {};
      names = undefined;
    } else if (Array.isArray(names)) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      } else {
        options = options || {};
      }
    } else {
      callback = options;
      options = names || {};
      names = undefined;
    }
  }
  return {
    names,
    options,
    callback,
  };
}

export const validateFuncWrapper = (
  fn: Function,
  ns: string[],
  opt: { [key: string]: any }
) =>
  new Promise((resolve) => {
    if (!fn) resolve([null, {}]);
    fn(ns, opt, (err: any, values: any) => {
      resolve([err, values]);
    });
  });

export function computedStyle(el: any, prop: any) {
  const getComputedStyle = window.getComputedStyle;
  const style =
    // If we have getComputedStyle
    getComputedStyle
      ? // Query it
        // TODO: From CSS-Query notes, we might need (node, null) for FF
        getComputedStyle(el)
      : // Otherwise, we are in IE and use currentStyle
        el.currentStyle;
  if (style) {
    return style[
      // Switch to camelCase for CSSOM
      // DEV: Grabbed from jQuery
      // https://github.com/jquery/jquery/blob/1.9-stable/src/css.js#L191-L194
      // https://github.com/jquery/jquery/blob/1.9-stable/src/core.js#L593-L597
      prop.replace(/-(\w)/gi, (_: any, letter: any) => {
        return letter.toUpperCase();
      })
    ];
  }
  return undefined;
}

export function getScrollableContainer(n: any) {
  let node = n;
  let nodeName;
  /* eslint no-cond-assign:0 */
  while ((nodeName = node.nodeName.toLowerCase()) !== "body") {
    const overflowY = computedStyle(node, "overflowY");
    // https://stackoverflow.com/a/36900407/3040605
    if (
      node !== n &&
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
    node = node.parentNode;
  }
  return nodeName === "body" ? node.ownerDocument : node;
}

export function isLeafError(error: any) {
  return Object.prototype.hasOwnProperty.call(error, "errors");
}

export function getFirstErrorField(errors: any) {
  if (!errors) return null;
  for (const [key, value] of errors.entries()) {
    if (isLeafError(value)) return key;
    return getFirstErrorField(value);
  }
}

function updateChild({
  element,
  updateModuleFields,
  wrappedComponentRef,
  cbRef,
}: {
  element: ReactElement;
  updateModuleFields: Function;
  wrappedComponentRef: any;
  cbRef: Function;
}) {
  const isClassComponent =
    (element?.type as any)?.WrappedComponent?.prototype instanceof
    React.Component;
  const injectedProps = isClassComponent
    ? {
        updateModuleFields,
        wrappedComponentRef,
        ref: cbRef(element),
      }
    : {
        updateModuleFields,
        ref: cbRef(element),
      };
  return React.cloneElement(element, injectedProps);
}

export function updateChildren(
  element: ReactNode,
  extraProps: any
): ReactNode | ReactNode[] {
  if (Array.isArray(element)) {
    return element.map((child: ReactNode) => updateChildren(child, extraProps));
  }
  if (!React.isValidElement(element as ReactElement)) return element;

  const { type, props } = element as ReactElement;
  const { cbRef, wrappedComponentRef, updateModuleFields } = extraProps;
  const children = props?.children;

  if ((type as any)?.displayName?.startsWith("Form")) {
    return updateChild({
      cbRef,
      element: element as ReactElement,
      updateModuleFields,
      wrappedComponentRef,
    });
  }

  if (children) {
    element = Array.isArray(children)
      ? React.cloneElement(
          element as ReactElement,
          {},
          children?.map((child) => updateChildren(child, extraProps))
        )
      : React.cloneElement(
          element as ReactElement,
          {},
          updateChildren(children, extraProps)
        );
  }
  return element;
}
