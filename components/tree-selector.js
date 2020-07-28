import './tree-selector-node.js';
import '@brightspace-ui/core/components/inputs/input-checkbox';

import {css, html, LitElement} from 'lit-element/lit-element.js';

class TreeSelector extends LitElement {

	static get properties() {
		return {
			/**
			 * an array of nodes
			 * each node is an object with properties name, children, getChildren, isOpen, isExplicitlySelected
			 * where children is an array of the same and getChildren is an async method which should return the
			 * children of the node or an empty array. All properties but "name" are optional.
			 */
			tree: { type: Object, attribute: false }
		};
	}

	static get styles() {
		return css`
			:host {
				display: inline-block;
			}
			:host([hidden]) {
				display: none;
			}
			
			d2l-input-checkbox {
				display: inline-block;
			}
			.arrow:before {
				content: "> "
			}
			.arrow[open]:before {
				content: "v "
			}
			
			.subtree {
				margin-left: 30px;
			}
		`;
	}

	render() {
		// TODO: drop-down & list selected
		return html`<d2l-insights-tree-selector-node
			id="tree-selector-root-node"
			.tree="${this.tree}"
			@change="${this._onChange}"
		  ></d2l-insights-tree-selector-node>`;
	}

	get selected() {
		return this.shadowRoot.getElementById('tree-selector-root-node').selected;
	}

	_onChange() {
		this.dispatchEvent(new CustomEvent(
			'change',
			{bubbles: true, composed: false}
		));
	}
}
customElements.define('d2l-insights-tree-selector', TreeSelector);
