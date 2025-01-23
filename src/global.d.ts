declare module "rc-form" {
  export function createForm(options: any): any;
}

declare module "dom-scroll-into-view" {
  interface DomScrollIntoViewConfig {
    alignWithLeft?: boolean;
    alignWithTop?: boolean;
    offsetTop?: number;
    offsetLeft?: number;
    offsetBottom?: number;
    offsetRight?: number;
    allowHorizontalScroll?: boolean;
    onlyScrollIfNeeded?: boolean;
  }

  function scrollIntoView(
    source: HTMLElement,
    container: HTMLElement,
    config: DomScrollIntoViewConfig
  ): void;

  export default scrollIntoView;
}
