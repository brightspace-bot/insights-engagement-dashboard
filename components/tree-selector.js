import './tree-selector-node.js';
import '@brightspace-ui/core/components/dropdown/dropdown-content';
import '@brightspace-ui/core/components/dropdown/dropdown';

import {css, html, LitElement} from 'lit-element/lit-element.js';
/**
 * @property {string} name
 * @property {{name: string, tree:{}[], getTree: function, isOpen: boolean, selectedState: string}[]} tree - used to initialize, but will not be updated
 * tree - an array of the same form
 * getTree - is async callback which should return the tree (provide either tree or getTree for each node)
 * selectedState - may be "explicit", "implicit", "indeterminate", or "none"
 * @fires change - value of this.selected has changed
 */
class TreeSelector extends LitElement {

	static get properties() {
		return {
			name: { type: String },
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
		return html`
			<d2l-dropdown>
				<button class="d2l-dropdown-opener d2l-input-select" aria-label="Open ${this.name} filter">
					${this.name}
				</button>
				<d2l-dropdown-content align="start">
					<d2l-insights-tree-selector-node
						id="tree-selector-root-node"
						.tree="${this.tree}"
						@change="${this._onChange}"
					></d2l-insights-tree-selector-node>
				</d2l-dropdown-content>
			</d2l-dropdown>
		`;
	}

	get selected() {
		return this.shadowRoot.getElementById('tree-selector-root-node').selected;
	}

	_onChange() {
		/**
		 * @event change
		 */
		this.dispatchEvent(new CustomEvent(
			'change',
			{bubbles: true, composed: false}
		));
	}
}
customElements.define('d2l-insights-tree-selector', TreeSelector);
