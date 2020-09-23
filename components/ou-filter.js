import { css, html } from 'lit-element/lit-element.js';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';

/**
 * @property {Object} data - an instance of Data from model/data.js
 * @fires d2l-insights-ou-filter-change
 */
class OuFilter extends Localizer(MobxLitElement) {

	static get properties() {
		return {
			data: { type: Object, attribute: false }
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
		`;
	}

	render() {
		this.data.orgUnitTree.setAncestorFilter(this.data.selectedSemesterIds);
		return html`<div class="ou-filter" ?loading="${this.data.isLoading}">
			<d2l-insights-tree-filter
				.tree="${this.data.orgUnitTree}"
				opener-text="${this.localize('components.org-unit-filter.name-all-selected')}"
				opener-text-selected="${this.localize('components.org-unit-filter.name-some-selected')}"
				@d2l-insights-tree-filter-select="${this._onChange}"
			>
			</d2l-insights-tree-filter>
		</div>`;
	}

	get selected() {
		return this.shadowRoot.querySelector('d2l-insights-tree-filter').selected;
	}

	_onChange() {
		/**
		 * @event d2l-insights-ou-filter-change
		 */
		this.dispatchEvent(new CustomEvent(
			'd2l-insights-ou-filter-change',
			{ bubbles: true, composed: false }
		));
	}
}
customElements.define('d2l-insights-ou-filter', OuFilter);
