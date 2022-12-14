interface UniqueClassMap {
  [className: string]: string;
}

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

interface VirtualHandlesMap {
  [handle: string]: ChildNode;
}

const variableExtractRegex = /{{(?<variable>[^\d][\w]+)}}/g;

export class Component {
  private _component: ChildNode;
  private _virtualMap: VirtualNodeMap;
  private _virtualVariableMap: VirtualVariableMap = {};
  private _virtualHandlesMap: VirtualHandlesMap = {};
  private _textNodes: ChildNode[];
  private _savedVirtualTextNodes: SavedVirtualTextNode[] = [];

  public constructor(template: string, classMap?: UniqueClassMap) {
    let temp = template;
    if (classMap) {
      temp = this.convertTemplateWithStyle(template, classMap);
    }

    const component = this.createComponent(temp.trim());

    if (component) {
      this._component = component;

      this._virtualMap = this.createVirtualMap(this._component);

      this._textNodes = this.getAllTextNodes(this._virtualMap);

      this._savedVirtualTextNodes = this.saveVirtualTextNodes(this._textNodes);

      this._virtualVariableMap = this.mapVirtualVariables(this._textNodes);

      this.updateVariables();
    } else throw new Error("Failed to create component from template!");
  }

  /* Private */

  private convertTemplateWithStyle(template: string, classMap: UniqueClassMap) {
    let newTemplate = template;
    for (const className in classMap) {
      if (Object.hasOwn(classMap, className)) {
        const hashedClassName = classMap[className];
        newTemplate = newTemplate.replaceAll(className, hashedClassName);
      }
    }

    return newTemplate;
  }

  private createComponent(template: string) {
    const templateElem = document.createElement("template");
    templateElem.innerHTML = template;

    return templateElem.content.firstChild;
  }

  private createVirtualMap(node: ChildNode) {
    const virtualNodeMap: VirtualNodeMap = { node: node };

    const handleName = node.parentElement?.getAttribute("#handle");
    if (handleName) {
      const handleExists = this._virtualHandlesMap[handleName];
      if (!handleExists) {
        this.saveVirtualHandle(handleName, node);
      }
    }

    if (node.hasChildNodes()) {
      virtualNodeMap.virtualChildNodes = [];

      node.childNodes.forEach((childNode) => {
        virtualNodeMap.virtualChildNodes?.push(this.createVirtualMap(childNode));
      });
    }

    return virtualNodeMap;
  }

  private saveVirtualHandle(handleName: string, node: ChildNode) {
    this._virtualHandlesMap[handleName] = node;
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

      if (savedVirtualTextNode.textNode.textContent !== newTextContent)
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

  public getElementByHandle(handleName: string) {
    const element = this._virtualHandlesMap[handleName].parentElement;

    if (!element) {
      throw new Error("No element with that handle found!");
    }
    return element;
  }
}
