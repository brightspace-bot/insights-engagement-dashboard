// just a list of checkboxes inside a dropdown to act as a temporary basic filter

import '@brightspace-ui/core/components/dropdown/dropdown-content';
import '@brightspace-ui/core/components/dropdown/dropdown';
import '@brightspace-ui/core/components/inputs/input-checkbox';
import '@brightspace-ui/core/components/inputs/input-search';
import '@brightspace-ui/core/components/button/button-subtle.js';

import { css, html, LitElement } from 'lit-element';
import { Localizer } from '../locales/localizer';
import { selectStyles } from '@brightspace-ui/core/components/inputs/input-select-styles';

/**
 * @property {string} name
 * @property {{id: string, displayName: string}[]} data
 * @fires d2l-simple-filter-selected - event.detail contains {string} filterName, {string} id, and {boolean} selected
 * @fires d2l-simple-filter-load-more-click
 * @fires d2l-simple-filter-searched
 */
class SimpleFilter extends Localizer(LitElement) {

	static get properties() {
		return {
			name: { type: String, attribute: true },
			data: { type: Array, attribute: false },
			loadMoreText: { type: String, attribute: 'load-more-text' },
			searchable: { type: Boolean, attribute: true }
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
		this.searchable = false;
	}

	render() {
		return html`
			<d2l-dropdown>
				<button class="d2l-dropdown-opener d2l-input-select" aria-label="${this.localize('components.simple-filter.dropdown-action', { name: this.name })}">
					${this.name}
				</button>
				<d2l-dropdown-content align="start">

					${this._renderSearchContainer()}

					<!-- placing a string inside the checkbox already acts as a label, no need to add one explicitly -->
					${this.data.map(obj => html`
						<d2l-input-checkbox value="${obj.id}" @change="${this._handleElementSelected}">${obj.displayName}</d2l-input-checkbox>
					`)}

					${this._renderLoadMore()}

				</d2l-dropdown-content>
			</d2l-dropdown>
		`;
	}

	_renderSearchContainer() {
		if (!this.searchable) {
			return html``;
		}

		return html`
			<div class="d2l-simple-filter-search-container">
				<d2l-input-search
					label="${this.localize('components.simple-filter.search-label')}"
					placeholder="${this.localize('components.simple-filter.search-placeholder')}"
					@d2l-input-search-searched="${this._handleSearchedClick}">
				</d2l-input-search>
			</div>`;
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
		this.dispatchEvent(new CustomEvent('d2l-simple-filter-selected', {
			detail: {
				itemId: event.target.value,
				selected: event.target.checked
			}
		}));
	}

	_handleLoadMoreClick() {
		this.dispatchEvent(new CustomEvent('d2l-simple-filter-load-more-click'));
	}

	_handleSearchedClick(event) {
		this.dispatchEvent(new CustomEvent('d2l-simple-filter-searched', {
			detail: { value: event.detail.value }
		}));
	}
}

customElements.define('d2l-simple-filter', SimpleFilter);
