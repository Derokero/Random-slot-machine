import "./scss/main.scss";
import { SelectionList } from "./components/selectionList/";

const root = document.getElementById("root");
root?.replaceWith(new SelectionList().instance);
