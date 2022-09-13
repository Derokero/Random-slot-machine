interface VirtualNodeMap {
  node: ChildNode;
  virtualChildNodes?: VirtualNodeMap[];
}

interface VirtualVariable {
  value: string;
  replaceTemplate: string;
}

interface SavedVirtualTextNode {
  textNode: ChildNode;
  replaceTemplate: string | null;
}

interface VirtualVariableMap {
  [variable: string]: VirtualVariable;
}

const variableExtractRegex = /{{(?<variable>[^\d][\w]+)}}/gi;

export class Component {
  private _component: ChildNode;
  private _virtualMap: VirtualNodeMap;
  private _virtualVariableMap: VirtualVariableMap = {};
  private _textNodes: ChildNode[];
  private _savedVirtualTextNodes: SavedVirtualTextNode[] = [];
  // private _virtualHandles: VirtualHandles = {};

  public constructor(template: string) {
    const temp = this.createComponent(template.trim());

    if (temp) {
      this._component = temp;

      this._virtualMap = this.createVirtualMap(this._component);

      this._textNodes = this.getAllTextNodes(this._virtualMap);

      this._savedVirtualTextNodes = this.saveVirtualTextNodes(this._textNodes);

      this._virtualVariableMap = this.mapVirtualVariables(this._textNodes);

      this.updateVariables();
    } else throw new Error("Failed creating component!");
  }

  /* Private */
  private createComponent(template: string) {
    const templateElem = document.createElement("template");
    templateElem.innerHTML = template;

    return templateElem.content.firstChild;
  }

  private createVirtualMap(node: ChildNode) {
    const virtualNodeMap: VirtualNodeMap = { node: node };
    if (node.hasChildNodes()) {
      virtualNodeMap.virtualChildNodes = [];

      node.childNodes.forEach((childNode) => {
        virtualNodeMap.virtualChildNodes?.push(this.createVirtualMap(childNode));
      });
    }

    return virtualNodeMap;
  }

  private getAllTextNodes(virtualNodeMap: VirtualNodeMap) {
    const textNodes: ChildNode[] = [];

    function getTextNodes({ node, virtualChildNodes }: VirtualNodeMap) {
      if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node);
      }

      virtualChildNodes?.forEach((virtualChildNode) => {
        getTextNodes(virtualChildNode);
      });
    }

    getTextNodes(virtualNodeMap);

    return textNodes;
  }

  private saveVirtualTextNodes(textNodes: ChildNode[]) {
    return textNodes.map((textNode) => ({ textNode: textNode, replaceTemplate: textNode.textContent }));
  }

  private mapVirtualVariables(textNodes: ChildNode[]) {
    /* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#finding_successive_matches */
    variableExtractRegex.lastIndex = 0; // Reset before testing since using Global flag

    const variableMap: VirtualVariableMap = {};

    textNodes.forEach((textNode) => {
      const text = textNode.textContent ?? "";

      let outArray: RegExpExecArray | null;

      while ((outArray = variableExtractRegex.exec(text)) !== null) {
        const variable = outArray.groups?.variable;

        if (!variable) continue;

        if (variableMap[variable] === undefined) variableMap[variable] = { value: "", replaceTemplate: text };
      }
    });

    return variableMap;
  }

  private updateVariables() {
    this._savedVirtualTextNodes.forEach((savedVirtualTextNode) => {
      const variables = Object.entries(this._virtualVariableMap);

      let newTextContent = savedVirtualTextNode.replaceTemplate ?? "";
      variables.forEach(([key, variable]) => {
        newTextContent = newTextContent.replaceAll(`{{${key}}}`, variable.value);
      });

      savedVirtualTextNode.textNode.textContent = newTextContent;
    });
  }

  /* Public */
  public get instance() {
    return this._component;
  }

  public updateVariable(variableName: string, newValue: string) {
    const variable = this._virtualVariableMap[variableName];

    if (!variable) throw new Error("Invalid variable name! Please check template!");

    this._virtualVariableMap[variableName].value = newValue;

    this.updateVariables();
  }
}
