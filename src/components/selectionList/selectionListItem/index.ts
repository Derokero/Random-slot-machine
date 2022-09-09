import { Component } from "../../Component";
import template from "./template.html";

export class SelectionListItem extends Component {
  constructor() {
    super(template);

    this.updateVariable("firstName", "Bob");
    this.updateVariable("lastName", "Billy");
    this.updateVariable("text", "Some text here");
    this.updateVariable("somethingElse", "This is some other text! A pretty long text!");
  }
}
