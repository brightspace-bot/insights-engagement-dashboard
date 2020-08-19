import './dropdown-filter';

import { html, LitElement } from 'lit-element';
import FakeLms from '../model/fake-lms';
import Lms from '../model/lms';
import { Localizer } from '../locales/localizer';

/**
 * @property {{id: string, displayName: string, selected: boolean}[]} _filterData
 * @property {string[]} selected - array of selected ids
 * @property {number} page-size
 * @property {boolean} demo
 * @fires d2l-insights-semester-filter-change
 * @fires d2l-insights-semester-filter-close
 */
class SemesterFilter extends Localizer(LitElement) {

	static get properties() {
		return {
			isDemo: { type: Boolean, attribute: 'demo' },
			pageSize: { type: Number, attribute: 'page-size' },
			_filterData: { type: Array, attribute: false },
			_bookmark: { type: String, attribute: false },
			_search: { types: String, attribute: false }
		};
	}

	constructor() {
		super();
		/** @type {{id: string, displayName: string}[]} */
		this._filterData = [];
		this._bookmark = null;
		this.pageSize = 3;
	}

	get selected() {
		return this.shadowRoot.querySelector('d2l-insights-dropdown-filter').selected;
	}

	async firstUpdated() {
		this._lms = this.isDemo ? new FakeLms() : new Lms();
		await this._loadData();
	}

	render() {
		return html`
			<d2l-insights-dropdown-filter
				name="${this.localize('components.semester-filter.name')}"
				.data="${this._filterData}"

				@d2l-insights-dropdown-filter-selected="${this._updateFilterSelections}"
				@d2l-insights-dropdown-filter-selection-cleared="${this._updateFilterSelections}"
				@d2l-insights-dropdown-filter-close="${this._filterClose}"
			>
			</d2l-insights-dropdown-filter>
		`;
	}

	async _loadData() {
		const data = await this._lms.fetchSemesters(this.pageSize);

		this._filterData = data.Items.map(item => ({
			id: item.orgUnitId.toString(),
			displayName: this.localize('components.semester-filter.semester-name', item)
		}));
	}

	_updateFilterSelections() {
		/**
		 * @event d2l-insights-semester-filter-change
		 */
		this.dispatchEvent(new Event('d2l-insights-semester-filter-change'));
	}

	_filterClose() {
		/**
		 * @event d2l-insights-semester-filter-close
		 */
		this.dispatchEvent(new Event('d2l-insights-semester-filter-close'));
	}
}
customElements.define('d2l-insights-semester-filter', SemesterFilter);
