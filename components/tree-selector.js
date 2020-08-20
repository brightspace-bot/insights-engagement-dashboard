import './tree-selector-node.js';
import '@brightspace-ui/core/components/button/button-subtle.js';
import '@brightspace-ui/core/components/dropdown/dropdown-content.js';
import '@brightspace-ui/core/components/dropdown/dropdown.js';
import '@brightspace-ui/core/components/inputs/input-search.js';

import { css, html, LitElement } from 'lit-element/lit-element.js';
import { Localizer } from '../locales/localizer';
import { selectStyles } from '@brightspace-ui/core/components/inputs/input-select-styles';

/**
 * @property {string} name
 * @property {{name: string, tree:{}[], getTree: function, isOpen: boolean, selectedState: string}[]} tree - used to initialize, but will not be updated
 * tree - an array of the same form
 * getTree - is async callback which should return the tree (provide either tree or getTree for each node)
 * selectedState - may be "explicit", "implicit", "indeterminate", or "none"
 * @property {Function} search - called with search string to get matching items, which are the same as tree items except they must include
 * a parents field, which itself a list of tree items
 * @fires d2l-insights-tree-selector-change - value of this.selected has changed
 */
class TreeSelector extends Localizer(LitElement) {

	static get properties() {
		return {
			name: { type: String },
			tree: { type: Object, attribute: false },
			search: { type: Object, attribute: false },
			_searchResults: { type: Object, attribute: false }
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

				.d2l-insights-tree-selector-search {
					display: flex;
					flex-wrap: nowrap;
					width: 334px;
				}
			`
		];
	}

	constructor() {
		super();

		this._searchResults = null;
	}

	render() {
		return html`
			<d2l-dropdown>
				<button class="d2l-dropdown-opener d2l-input-select"
					aria-label="${this.localize('components.tree-selector.dropdown-action', { name: this.name })}"
				>${this.name}</button>
					<d2l-dropdown-content align="start">
						<div class="d2l-insights-tree-selector-search" slot="header">
							<d2l-input-search
								label="${this.localize('components.tree-selector.search-label')}"
								placeholder="${this.localize('components.tree-selector.search-placeholder')}"
								@d2l-input-search-searched="${this._onSearch}"
							></d2l-input-search>
						</div>
						<d2l-insights-tree-selector-node
							id="tree-selector-root-node"
							.tree="${this.tree}"
							root
							?hidden="${this._isInSearchMode}"
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

	get _isInSearchMode() {
		return this._searchResults !== null;
	}

	_onChange() {
		/**
		 * @event d2l-insights-tree-selector-change
		 */
		this.dispatchEvent(new CustomEvent(
			'd2l-insights-tree-selector-change',
			{ bubbles: true, composed: false }
		));
	}

	_onSearch(event) {
		const filterString = event.detail.value;
		if (filterString && filterString.length > 0) {
			this._searchResults = this.search(filterString);
			console.log(`found ${JSON.stringify(this._searchResults)}`);
			// todo: mark selected
			// todo: note connection to tree, and perform selection activities on the tree nodes
			// observe: this all works like magic if we just show the nodes themselves, without removing them from the tree
			// need one thing regardless, it seems: ancestors of the search results (complication: to really work well, we also want siblings; could use ancestor's tree or getTree)
			// could add results to tree (if needed), and selectively hide the rest along with some formatting to remove indentation if desired
			// imagine if the tree were already fully in the DOM: it's just the second part (hide & format)
			// so operation is: 1) fill out tree as necessary; 2) adjust styles
			// required data: list of hits, each with a parent which is itself a full tree node (including tree or getTree, parent, etc.)
			// can ignore selected state of these nodes, though: if they're already selected, they're already marked on this side, but
			// possibly not in the original data
		} else {
			this._searchResults = null;
		}
	}

	async _onResize() {
		await this.shadowRoot.querySelector('d2l-dropdown-content').resize();
	}
}
customElements.define('d2l-insights-tree-selector', TreeSelector);
