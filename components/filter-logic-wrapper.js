'use strict';

import '@brightspace-ui/facet-filter-sort/components/d2l-filter-dropdown/d2l-filter-dropdown';
import '@brightspace-ui/facet-filter-sort/components/d2l-filter-dropdown/d2l-filter-dropdown-category';
import '@brightspace-ui/facet-filter-sort/components/d2l-filter-dropdown/d2l-filter-dropdown-option';

import {html, LitElement} from 'lit-element/lit-element.js';

class FilterLogicWrapper extends LitElement {
	static get properties() {
		return {
			filterName: {type: String, attribute: true},
			data: {
				type: Array,
				attribute: false
			},
			selectedDataCount: {type: Array, attribute: false}
		};
	}

	// TODO: define data structure requirements (id & displayName)
	constructor() {
		super();

		this.filterName = "";

		this.data = [];
		this.selectedDataCount = 0;

		this.addEventListener('d2l-filter-dropdown-option-change', this._handleSelectionToggle);
		this.addEventListener('d2l-filter-dropdown-cleared', this._handleSelectionCleared);
		this.addEventListener('d2l-filter-dropdown-category-searched', this._handleSearch);
	}

	_handleSelectionToggle(event) {
		if (!event || !event.detail) return;

		if (event.detail.categoryKey === this.filterName) {
			this.selectedDataCount += event.detail.selected ? 1 : -1;
		}
	}

	_handleSelectionCleared() {
		// checkbox selection should be editable directly via props, this hack should not be necessary :(
		this.shadowRoot.querySelectorAll('d2l-filter-dropdown-option').forEach(opt => opt.deselect());
		// this.data.forEach(obj => obj.selected = false); // maybe this isn't necessary anymore
		this.selectedDataCount = 0;
	}

	_handleSearch(event) {
		// TODO: search doesn't work yet
		// if (!event || !event.detail) return;
		//
		// const searchValue = event.detail.value;
		// this.data.filter(obj => obj.displayName.startsWith(searchValue)).forEach(obj => obj.visible = true);
		// this.data.filter(obj => !obj.displayName.startsWith(searchValue)).forEach(obj => obj.visible = false);
		// const parentNode = this.shadowRoot.querySelector('d2l-filter-dropdown-category');
		//
		// while (parentNode.lastChild) {
		// 	parentNode.removeChild(parentNode.lastChild);
		// }
		//
		// this.render();
	}

	render() {
		return html`
			<d2l-filter-dropdown
			header-text="Filter By ${this.filterName}"
			opener-text="${this.filterName}: All"
			opener-text-single="${this.filterName}: ${this.selectedDataCount} selected"
			opener-text-multiple="${this.filterName}: ${this.selectedDataCount} selected"
			total-selected-option-count="${this.selectedDataCount}">

				<d2l-filter-dropdown-category key="${this.filterName}" category-text="${this.filterName}" selected-option-count="${this.selectedDataCount}">
					${this.data.filter(obj => obj.visible)
					.map(obj =>
						html`<d2l-filter-dropdown-option text="${obj.displayName}" value="${obj.id}" ?selected="${obj.selected}"/>`
					)}
				</d2l-filter-dropdown-category>

			</d2l-filter-dropdown>
		`;
	}
}

customElements.define('d2l-filter-logic-wrapper', FilterLogicWrapper);
