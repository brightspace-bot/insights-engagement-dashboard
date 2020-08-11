import './tree-selector-node.js';
import '@brightspace-ui/core/components/button/button-subtle.js';
import '@brightspace-ui/core/components/dropdown/dropdown-content.js';
import '@brightspace-ui/core/components/dropdown/dropdown.js';
import '@brightspace-ui/core/components/inputs/input-search.js';

import {css, html, LitElement} from 'lit-element/lit-element.js';
import {selectStyles} from '@brightspace-ui/core/components/inputs/input-select-styles';

/**
 * @property {string} name
 * @property {{name: string, tree:{}[], getTree: function, isOpen: boolean, selectedState: string}[]} tree - used to initialize, but will not be updated
 * tree - an array of the same form
 * getTree - is async callback which should return the tree (provide either tree or getTree for each node)
 * selectedState - may be "explicit", "implicit", "indeterminate", or "none"
 * @fires d2l-insights-tree-selector-change - value of this.selected has changed
 */
class TreeSelector extends LitElement {

	static get properties() {
		return {
			name: { type: String },
			tree: { type: Object, attribute: false }
		};
	}

	static get styles() {
		return [
			selectStyles,
			css`
				:host {
					display: inline-block;
				}
				:host([hidden]) {
					display: none;
				}

				.search {
					display: flex;
					flex-wrap: nowrap;
				}
			`
		];
	}

	render() {
		return html`
			<d2l-dropdown>
				<button class="d2l-dropdown-opener d2l-input-select" text="${this.name}">${this.name}</button>
					<d2l-dropdown-content align="start">
						<div class="search" slot="header"><d2l-input-search
							label="Org unit search"
							placeholder="Search..."
						></d2l-input-search><d2l-button-subtle text="Clear"></d2l-button-subtle></div>
						<d2l-insights-tree-selector-node
							id="tree-selector-root-node"
							.tree="${this.tree}"
							root
							@d2l-insights-tree-selector-change="${this._onChange}"
							@d2l-insights-tree-selector-resize="${this._onResize}"
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
		 * @event d2l-insights-tree-selector-change
		 */
		this.dispatchEvent(new CustomEvent(
			'd2l-insights-tree-selector-change',
			{bubbles: true, composed: false}
		));
	}

	async _onResize() {
		await this.shadowRoot.querySelector('d2l-dropdown-content').resize();
	}
}
customElements.define('d2l-insights-tree-selector', TreeSelector);
