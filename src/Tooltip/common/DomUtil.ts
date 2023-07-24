class DomUtil {
  /**
   * 创建一个带有'tagName'的HTML元素，并添加到container下
   * @param tagName
   * @param className
   * @param container
   * @returns {HTMLElement}
   */
  static create(
    tagName: string,
    className: string,
    container: Element | null = null
  ): HTMLElement {
    const el = document.createElement(tagName);
    el.className = className || "";
    if (container) {
      container.appendChild(el);
    }
    return el;
  }

  /**
   * 将string解析为Dom
   * @param domStr
   * @param withWrapper
   * @param className
   * @returns {HTMLDivElement}
   */
  static parseDom(domStr: string, className: string): HTMLDivElement {
    const el = document.createElement("div");
    el.className = className || "";
    el.innerHTML = domStr;
    return el;
  }
}

export default DomUtil;
