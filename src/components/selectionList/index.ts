import { Component } from "../Component";
import { SelectionListItem } from "./selectionListItem";
import template from "./template.html";
import style from "./style.scss";

const listItem = new SelectionListItem().instance;

export class SelectionList extends Component {
  constructor() {
    super(template, style);

    this.updateVariable("title", "This is a list");

    this.instance.appendChild(listItem);
  }
}
