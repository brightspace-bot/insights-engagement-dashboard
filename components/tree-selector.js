import './tree-selector-node.js';
import '@brightspace-ui/core/components/button/button-subtle.js';
import '@brightspace-ui/core/components/dropdown/dropdown-content.js';
import '@brightspace-ui/core/components/dropdown/dropdown.js';
import '@brightspace-ui/core/components/inputs/input-search.js';

import { css, html, LitElement } from 'lit-element/lit-element.js';
import { Localizer } from '../locales/localizer';
import { selectStyles } from '@brightspace-ui/core/components/inputs/input-select-styles';

/**
 * @property {String} name
 * @property {Boolean} isSearch - if true, show "search-results" slot instead of "tree" slot
 * @fires d2l-insights-tree-selector-search - user requested or cleared a search; search string is event.detail.value
 */
class TreeSelector extends Localizer(LitElement) {

	static get properties() {
		return {
			name: { type: String },
			isSearch: { type: Boolean, attribute: 'search', reflect: true }
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

				:host([search]) d2l-dropdown d2l-dropdown-content .d2l-insights-tree-selector-tree {
					display: none;
				}

				.d2l-insights-tree-selector-search-results {
					display: none;
				}
				:host([search]) d2l-dropdown d2l-dropdown-content .d2l-insights-tree-selector-search-results {
					display: block;
				}
			`
		];
	}

	constructor() {
		super();

		this.name = 'SPECIFY NAME ATTRIBUTE';
		this._isSearch = false;
	}

	/**
	 * @returns {Promise} - resolves when all tree-selector-nodes in slots, recursively, have finished updating
	 */
	get treeUpdateComplete() {
		return this._waitForTreeUpdateComplete();
	}

	render() {
		// TODO: decide about no-auto-fit
		return html`
			<d2l-dropdown>
				<d2l-dropdown-button-subtle text="${this.name}">
					<d2l-dropdown-content align="start" no-auto-fit>
						<div class="d2l-insights-tree-selector-search" slot="header">
							<d2l-input-search
								label="${this.localize('components.tree-selector.search-label')}"
								placeholder="${this.localize('components.tree-selector.search-placeholder')}"
								@d2l-input-search-searched="${this._onSearch}"
							></d2l-input-search>
						</div>
						<div class="d2l-insights-tree-selector-search-results">
							<slot name="search-results"></slot>
						</div>
						<div class="d2l-insights-tree-selector-tree">
							<slot name="tree"></slot>
						</div>
					</d2l-dropdown-content>
				</d2l-dropdown-button-subtle>
			</d2l-dropdown>
		`;
	}

	simulateSearch(searchString) {
		this._onSearch({
			detail: {
				value: searchString
			}
		});
	}

	async resize() {
		await this.treeUpdateComplete;
		const content = this.shadowRoot.querySelector('d2l-dropdown-content');
		content && await content.resize();
	}

	_onSearch(event) {
		/**
		 * @event d2l-insights-tree-selector-search
		 */
		this.dispatchEvent(new CustomEvent(
			'd2l-insights-tree-selector-search',
			{
				bubbles: true,
				composed: false,
				detail: event.detail
			}
		));
	}

	async _waitForTreeUpdateComplete() {
		await this.updateComplete;
		const slots = [...this.shadowRoot.querySelectorAll('slot')];
		// to be sure all child nodes have been added, instead of using flatten,
		// we recursively walk down the tree, waiting for each node's update to complete
		return Promise.all(slots.map(slot => {
			const childNodes = slot.assignedNodes({ flatten: false });
			return Promise.all(childNodes.map(node => node.treeUpdateComplete));
		}));
	}
}
customElements.define('d2l-insights-tree-selector', TreeSelector);
