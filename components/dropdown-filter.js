import 'd2l-facet-filter-sort/components/d2l-filter-dropdown/d2l-filter-dropdown.js';
import 'd2l-facet-filter-sort/components/d2l-filter-dropdown/d2l-filter-dropdown-category.js';
import 'd2l-facet-filter-sort/components/d2l-filter-dropdown/d2l-filter-dropdown-option.js';

import {css, html, LitElement} from 'lit-element';
import {Localizer} from '../locales/localizer';
import {repeat} from 'lit-html/directives/repeat.js';

/**
 * @property {string} name
 * @property {{id: string, displayName: string, _selected: boolean}[]} data
 * @property {boolean} more - shows Load More button if true
 * @property {string[]} selected - returns list of ids for selected items
 * @property {boolean} disable-search
 * @fires d2l-insights-dropdown-filter-selected - event.detail contains {string} filterName, {string} id, and {boolean} selected
 * @fires d2l-insights-dropdown-filter-load-more-click
 * @fires d2l-insights-dropdown-filter-searched
 * @fires d2l-insights-dropdown-filter-selection-cleared
 * @fires d2l-insights-dropdown-filter-close
 */
class DropdownFilter extends Localizer(LitElement) {

	static get properties() {
		return {
			name: {type: String, attribute: true},
			data: {type: Array, attribute: false},
			hasMore: {type: Boolean, attribute: 'more'},
			disableSearch: {type: Boolean, attribute: 'disable-search'},
			_selectedCount: {type: Number, attribute: true}
		};
	}

	static get styles() {
		return [css`
			d2l-button-subtle {
				margin: 0.25rem;
				display: grid;
			}

			d2l-filter-dropdown-category[disable-search] {
				padding-top: 0px;
			}
		`];
	}

	get selected() {
		return this.data
			.filter(item => item._selected)
			.map(item => item.id);
	}

	constructor() {
		super();

		/** {{id: string, displayName: string, _selected: boolean}[]} */
		this.data = [];
		this.name = '';
		this.hasMore = false;
		this._selectedCount = 0;
		// is used in repeat-directive to tell Lit-framework that we want full refresh of a list of elements
		this._searchIteration = 0;
	}

	render() {
		const openerSelectedText = this.localize('components.dropdown-filter.opener-text-multiple', {filterName: this.name, selectedCount: this._selectedCount});

		return html`
			<d2l-filter-dropdown
				total-selected-option-count="${this._selectedCount}"
				opener-text="${this.name}"
				opener-text-single="${openerSelectedText}"
				opener-text-multiple="${openerSelectedText}"
				@d2l-filter-dropdown-cleared="${this._clearSelectionClick}"
				@d2l-dropdown-close="${this._filterClose}"
				>
				<d2l-filter-dropdown-category
					?disable-search="${this.disableSearch}"
					category-text="${this.name}"
					@d2l-filter-dropdown-option-change="${this._handleElementSelected}"
					@d2l-filter-dropdown-category-searched="${this._handleSearchedClick}" >

					${repeat(this.data, (item) => item.id + this._searchIteration, (item) => html`
						<d2l-filter-dropdown-option text="${item.displayName}" value="${item.id}"></d2l-filter-dropdown-option>
					`)}

				</d2l-filter-dropdown-category>

				${this._renderLoadMore()}

			</d2l-filter-dropdown>
		`;
	}

	updated() {
		if (!this.hasMore && this._loadMoreClickFlag) {
			this._loadMoreClickFlag = false;

			this.shadowRoot.querySelector('d2l-filter-dropdown-option').focus();
		}
	}

	_setSelectedState(id, selected) {
		this.data.find(item => item.id === id)._selected = selected;
		this._updateSelectedCount();
	}

	_updateSelectedCount() {
		this._selectedCount = this.data.filter(item => item._selected).length;
	}

	_renderLoadMore() {
		if (!this.hasMore) {
			return html``;
		}

		return html`
			<d2l-button-subtle
				text="${this.localize('components.dropdown-filter.load-more')}"
				@click="${this._handleLoadMoreClick}">
			</d2l-button-subtle>`;
	}

	_handleElementSelected(event) {
		this._setSelectedState(event.detail.menuItemKey, event.detail.selected);

		// propagate the event one level up, since it can't cross the shadow DOM boundary
		this.dispatchEvent(new CustomEvent('d2l-insights-dropdown-filter-selected', {
			detail: {
				itemId: event.detail.menuItemKey,
				selected: event.detail.selected
			}
		}));
	}

	_handleLoadMoreClick() {
		this._loadMoreClickFlag = true;
		this.dispatchEvent(new CustomEvent('d2l-insights-dropdown-filter-load-more-click'));
	}

	_handleSearchedClick(event) {
		this._searchIteration++;
		this._selectedCount = 0;

		this.dispatchEvent(new CustomEvent('d2l-insights-dropdown-filter-searched', {
			detail: { value: event.detail.value }
		}));
	}

	_clearSelectionClick() {
		this._searchIteration++;
		this._selectedCount = 0;

		this.data.forEach(item => item._selected = false);

		this.dispatchEvent(new CustomEvent('d2l-insights-dropdown-filter-selection-cleared'));
	}

	_filterClose() {
		this.dispatchEvent(new CustomEvent('d2l-insights-dropdown-filter-close'));
	}
}

customElements.define('d2l-insights-dropdown-filter', DropdownFilter);
