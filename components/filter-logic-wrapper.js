import '@brightspace-ui/facet-filter-sort/components/d2l-filter-dropdown/d2l-filter-dropdown';
import '@brightspace-ui/facet-filter-sort/components/d2l-filter-dropdown/d2l-filter-dropdown-category';
import '@brightspace-ui/facet-filter-sort/components/d2l-filter-dropdown/d2l-filter-dropdown-option';

import {html, LitElement} from 'lit-element/lit-element.js';

class FilterLogicWrapper extends LitElement {
	static get properties() {
		return {
			filterName: {type: String, attribute: true},
			allData: {
				type: Array,
				attribute: false
			},
			visibleData: {
				type: Array,
				attribute: false
			},
			selectedDataCount: {type: Array, attribute: false}
		};
	}

	// TODO: define data structure requirements (id & displayName)
	constructor() {
		super();

		this.filterName = '';

		this._searchTerm = '';

		this._allData = [];
		this.visibleData = [];
		this.selectedDataCount = 0;

		this.addEventListener('d2l-filter-dropdown-option-change', this._handleSelectionToggle);
		this.addEventListener('d2l-filter-dropdown-cleared', this._handleSelectionCleared);
		this.addEventListener('d2l-filter-dropdown-category-searched', this._handleSearch);
	}

	get allData() { return this._allData; }
	set allData(val) {
		this._allData = val;
		this.visibleData = val;
	}

	get searchTerm() { return this._searchTerm; }
	set searchTerm(val) {
		val = val.toLowerCase();
		if (this._searchTerm === val) return;

		this._searchTerm = val;
		this.updateVisibleData();
	}

	_handleSelectionToggle(event) {
		if (!event || !event.detail) return;

		if (event.detail.categoryKey === this.filterName) {
			this.allData.find(obj => obj.id === event.detail.menuItemKey).selected = event.detail.selected;
			this.selectedDataCount += event.detail.selected ? 1 : -1;
			this.updateVisibleData();
		}
	}

	_handleSelectionCleared() {
		// checkbox selection should be editable directly via the component's props, this hack should not be necessary :(
		this.shadowRoot.querySelectorAll('d2l-filter-dropdown-option').forEach(opt => opt.deselect());
		this._allData.forEach(obj => obj.selected = false);
		this.selectedDataCount = 0;
		this.updateVisibleData();
	}

	_handleSearch(event) {
		if (!event || !event.detail) return;
		this.searchTerm = event.detail.value;
	}

	updateVisibleData() {
		// TODO: consider localization in filtering code
		this.visibleData = this.allData.filter(obj => obj.displayName.toLowerCase().startsWith(this._searchTerm));
	}

	render() {
		return html`
			<d2l-filter-dropdown
			header-text="Filter By ${this.filterName}"
			opener-text="${this.filterName}: All"
			opener-text-single="${this.filterName}: ${this.selectedDataCount} selected"
			opener-text-multiple="${this.filterName}: ${this.selectedDataCount} selected"
			total-selected-option-count="${this.selectedDataCount}">

				<d2l-filter-dropdown-category
					key="${this.filterName}"
					category-text="${this.filterName}">

					${this.visibleData.map(obj =>
						html`<d2l-filter-dropdown-option text="${obj.displayName}" value="${obj.id}" ?selected="${obj.selected}">
						</d2l-filter-dropdown-option>`
					)}

				</d2l-filter-dropdown-category>

			</d2l-filter-dropdown>
		`;
	}
}

customElements.define('d2l-filter-logic-wrapper', FilterLogicWrapper);
