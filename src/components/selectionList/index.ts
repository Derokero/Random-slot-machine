import { Component } from "../Component";
import { SelectionListItem } from "./selectionListItem";
import template from "./template.html";

const listItem = new SelectionListItem().instance;

export class SelectionList extends Component {
  constructor() {
    super(template);

    this.updateVariable("title", "This is a list");

    this.instance.appendChild(listItem);
  }
}
