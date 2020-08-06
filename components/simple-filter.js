// just a list of checkboxes inside a dropdown to act as a temporary basic filter

import '@brightspace-ui/core/components/dropdown/dropdown-content';
import '@brightspace-ui/core/components/dropdown/dropdown';
import '@brightspace-ui/core/components/inputs/input-checkbox';
import '@brightspace-ui/core/components/button/button-subtle.js';

import {html, LitElement} from 'lit-element';
import {ifDefined} from 'lit-html/directives/if-defined';
import {selectStyles} from '@brightspace-ui/core/components/inputs/input-select-styles';

/**
 * @property {string} name
 * @property {{id: string, displayName: string}[]} data
 * @fires d2l-simple-filter-selected - event.detail contains {string} filterName, {string} id, and {boolean} selected
 * @fires d2l-simple-filter-load-more-click
 */
class SimpleFilter extends LitElement {

	static get properties() {
		return {
			name: {type: String, attribute: true},
			data: {type: Array, attribute: false},
			loadMoreText: {type: String, attribute: 'load-more-text'}
		};
	}

	static get styles() {
		return [selectStyles];
	}

	constructor() {
		super();

		this.data = [];
		this.name = '';
		this.loadMoreText = undefined;
	}

	render() {
		return html`
			<d2l-dropdown>
				<button class="d2l-dropdown-opener d2l-input-select" aria-label="Open ${this.name} filter">
					${this.name}
				</button>

				<d2l-dropdown-content align="start">
					<!-- placing a string inside the checkbox already acts as a label, no need to add one explicitly -->
					${this.data.map(obj => html`
						<d2l-input-checkbox value="${obj.id}" @change="${this._handleElementSelected}">${obj.displayName}</d2l-input-checkbox>
					`)}
					${ifDefined(this.loadMoreText) && this.loadMoreText !== 'null' ?
						html`<d2l-button-subtle text="${this.loadMoreText}" @click="${this._handleLoadMoreClick}" ></d2l-button-subtle>` :
						html``
					}
				</d2l-dropdown-content>
			</d2l-dropdown>
		`;
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

	_handleLoadMoreClick(event) {
		event.stopPropagation();
		// propagate the event one level up, since it can't cross the shadow DOM boundary
		this.dispatchEvent(new CustomEvent('d2l-simple-filter-load-more-click'));
	}
}

customElements.define('d2l-simple-filter', SimpleFilter);
