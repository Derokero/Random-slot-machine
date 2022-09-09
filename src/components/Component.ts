interface VirtualNode {
  node: ChildNode;
  replaceTemplate: string;
}

interface NodeSubTree {
  [key: string]: NodeSubTree | VirtualNode | ChildNode;
}

interface VirtualVariableEntry {
  value: string;
  replaceTemplate: string;
  nodeMap: ChildNode[];
}

interface VirtualVariableMap {
  [key: string]: VirtualVariableEntry;
}

export class Component {
  private _component: ChildNode;
  private _virtualMap: NodeSubTree;
  private _virtualVariableMap: VirtualVariableMap = {};

  public constructor(template: string) {
    const temp = this.createComponent(template.trim());

    if (temp) {
      this._component = temp;
      this._virtualMap = this.createVirtualMap(this._component);
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
    const nodeSubTree: NodeSubTree = {};

    if (node.hasChildNodes())
      node.childNodes.forEach((childNode, idx) => {
        let handleName: string | null = null;
        if (childNode.nodeType === Node.ELEMENT_NODE)
          handleName = (childNode as HTMLElement).attributes.getNamedItem("#handle")?.nodeValue ?? null;

        if (handleName)
          nodeSubTree[handleName] = {
            ...this.createVirtualMap(childNode),
            handle: childNode,
          };
        else nodeSubTree[idx] = this.createVirtualMap(childNode);
      });
    else {
      if (node.nodeType === Node.TEXT_NODE) {
        const virtualTextNode = { node, replaceTemplate: node.textContent ?? "" };
        this.mapVirtualVariables(virtualTextNode);
        nodeSubTree[node.nodeType] = virtualTextNode;
      } else {
        nodeSubTree[node.nodeType] = { node };
      }
    }

    return nodeSubTree;
  }

  private mapVirtualVariables(virtualTextNode: VirtualNode) {
    const { node, replaceTemplate } = virtualTextNode;
    if (!replaceTemplate) return;

    const text = node?.textContent;
    if (!text) return;

    const variableExtractRegex = /{{(?<variable>[^\d][\w]+)}}/g;

    let outArray: RegExpExecArray | null;
    while ((outArray = variableExtractRegex.exec(text)) !== null) {
      const variable = outArray.groups?.variable.trim();

      if (!variable) continue;

      if (this._virtualVariableMap[variable] === undefined)
        this._virtualVariableMap[variable] = {
          value: "",
          replaceTemplate: replaceTemplate,
          nodeMap: [],
        };

      const variableNodeExists =
        this._virtualVariableMap[variable].nodeMap.findIndex((savedNode) => node === savedNode) !== -1;

      if (variableNodeExists) continue;

      this._virtualVariableMap[variable].nodeMap.push(virtualTextNode.node);
    }
  }

  private updateVariables() {
    const textNodes = Object.values(this._virtualMap)
      .filter((node) => {
        if (Object.hasOwn(node, Node.TEXT_NODE)) return true;
      })
      .map((node) => (<NodeSubTree>node)[Node.TEXT_NODE]);

    const variables = Object.entries(this._virtualVariableMap);

    for (const textNode of textNodes as VirtualNode[]) {
      let newTextContent = textNode.replaceTemplate;

      for (const [key, variable] of variables) {
        const variableValue = variable.value;

        newTextContent = newTextContent.replaceAll(`{{${key}}}`, variableValue);
      }

      textNode.node.textContent = newTextContent;
    }
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
