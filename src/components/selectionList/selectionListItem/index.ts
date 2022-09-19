import { Component } from "../../Component";
import style from "./style.scss";

import template from "./template.html";

export class SelectionListItem extends Component {
  private _counter = 0;
  constructor() {
    super(template, style);

    this.updateVariable("firstName", "Bob");
    this.updateVariable("lastName", "Billy");
    this.updateVariable("text", "Some text here");
    this.updateVariable("nested", "NESTED!");
    this.updateVariable("level1", "Level 1");
    this.updateVariable("level2", "Level 2");
    this.updateVariable("level3", "Level 3");
    this.updateVariable("deeplyNested", "3 levels nested!");

    this.updateVariable("somethingElse", "This is some other text! A pretty long text!");

    this.getElementByHandle("changeTextButton").addEventListener("click", (ev: MouseEvent) => {
      (<HTMLSpanElement>ev.currentTarget)?.classList.toggle("clicked");
      this._counter++;
      this.updateVariable("clicked", `Clicked ${this._counter} times`);
    });
  }
}
