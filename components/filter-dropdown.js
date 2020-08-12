// just a list of checkboxes inside a dropdown to act as a temporary basic filter

import '@brightspace-ui/core/components/dropdown/dropdown-content';
import '@brightspace-ui/core/components/dropdown/dropdown';
import '@brightspace-ui/core/components/inputs/input-checkbox';
import '@brightspace-ui/core/components/inputs/input-search';
import '@brightspace-ui/core/components/button/button-subtle.js';
import '@webcomponents/webcomponentsjs/webcomponents-loader.js';
import 'd2l-facet-filter-sort/components/d2l-filter-dropdown/d2l-filter-dropdown.js';
import 'd2l-facet-filter-sort/components/d2l-filter-dropdown/d2l-filter-dropdown-category.js';
import 'd2l-facet-filter-sort/components/d2l-filter-dropdown/d2l-filter-dropdown-option.js';

import {css, html, LitElement} from 'lit-element';
import {Localizer} from '../locales/localizer';
import {selectStyles} from '@brightspace-ui/core/components/inputs/input-select-styles';

/**
 * @property {string} name
 * @property {{id: string, displayName: string}[]} data
 * @fires d2l-simple-filter-selected - event.detail contains {string} filterName, {string} id, and {boolean} selected
 * @fires d2l-simple-filter-load-more-click
 * @fires d2l-simple-filter-searched
 */
class DropdownFilter extends Localizer(LitElement) {

	static get properties() {
		return {
			name: {type: String, attribute: true},
			data: {type: Array, attribute: false},
			loadMoreText: {type: String, attribute: 'load-more-text'}
		};
	}

	static get styles() {
		return [selectStyles, css`
				.d2l-simple-filter-search-container {
					margin-bottom: 15px;
				}
			`
		];
	}

	constructor() {
		super();

		this.data = [];
		this.name = '';
		this.loadMoreText = undefined;
	}

	render() {
		return html`
			<d2l-filter-dropdown total-selected-option-count="2" opener-text="${this.name}">
				<d2l-filter-dropdown-category
					key="1"
					category-text="${this.name}"
					selected-option-count="2"
					@d2l-filter-dropdown-option-change="${this._handleElementSelected}"
					@d2l-filter-dropdown-category-searched="${this._handleSearchedClick}" >

					${this.data.map(obj => html`
						<d2l-filter-dropdown-option text="${obj.displayName}" value="${obj.id}"></d2l-filter-dropdown-option>
					`)}

				</d2l-filter-dropdown-category>

				${this._renderLoadMore()}

			</d2l-filter-dropdown>
		`;
	}

	updated() {
		if (this._loadMoreClickFlag) {
			this._loadMoreClickFlag = false;
			return;
		}

		// Fix for behavior: When a user hits Search/Clear, items in the list stay selected even if the list is fully updated.
		this.renderRoot.querySelectorAll('d2l-filter-dropdown-option')
			.forEach(node => {
				node.selected = false;
			});
	}

	_renderLoadMore() {
		if (!this.loadMoreText) {
			return html``;
		}

		return html`
			<d2l-button-subtle
				text="${this.loadMoreText}"
				@click="${this._handleLoadMoreClick}">
			</d2l-button-subtle>`;
	}

	_handleElementSelected(event) {
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
		this.dispatchEvent(new CustomEvent('d2l-insights-dropdown-filter-searched', {
			detail: { value: event.detail.value }
		}));
	}
}

customElements.define('d2l-insights-dropdown-filter', DropdownFilter);
