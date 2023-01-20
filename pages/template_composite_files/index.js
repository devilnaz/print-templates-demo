import cbHello from './cbHello.js';
import { ui_elements } from './UI/index.js';

customElements.define('cb-hello', cbHello);

ui_elements.forEach((item) => {
  customElements.define(item.tag_name, item.element);
});
