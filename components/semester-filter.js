import './dropdown-filter';

import {html, LitElement} from 'lit-element';
import FakeLms from '../model/fake-lms';
import Lms from '../model/lms';
import {Localizer} from '../locales/localizer';

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

	async firstUpdated() {
		this._lms = this.isDemo ? new FakeLms() : new Lms();
		await this._loadData();
	}

	get selected() {
		return this.shadowRoot.querySelector('d2l-insights-dropdown-filter').selected;
	}

	async _loadData(clear) {
		let currentData = this._filterData;

		if (clear) {
			this._bookmark = null;
			currentData = [];
		}

		const data = await this._lms.fetchSemesters(this.pageSize, this._bookmark, this._search);

		this._saveBookmark(data.PagingInfo);

		this._filterData = currentData.concat(data.Items.map(item => ({
			id: item.orgUnitId.toString(),
			displayName: this.localize('components.semester-filter.semester-name', item)
		})));
	}

	_saveBookmark(pagingInfo) {
		this._bookmark = pagingInfo.HasMoreItems ? pagingInfo.Bookmark : null;
	}

	render() {
		return html`
			<d2l-insights-dropdown-filter
				name="${this.localize('components.semester-filter.name')}"
				?more="${!!this._bookmark}"
				.data="${this._filterData}"

				@d2l-insights-dropdown-filter-selected="${this._updateFilterSelections}"
				@d2l-insights-dropdown-filter-load-more-click="${this._loadMoreClick}"
				@d2l-insights-dropdown-filter-searched="${this._searchClick}"
				@d2l-insights-dropdown-filter-selection-cleared="${this._updateFilterSelections}"
				@d2l-insights-dropdown-filter-close="${this._filterClose}"
			>
			</d2l-insights-dropdown-filter>
		`;
	}

	_updateFilterSelections() {
		this.dispatchEvent(new Event('d2l-insights-semester-filter-change'));
	}

	_filterClose() {
		this.dispatchEvent(new Event('d2l-insights-semester-filter-close'));
	}

	async _searchClick(event) {
		this._search = event.detail.value;
		await this._loadData(true);
	}

	async _loadMoreClick() {
		await this._loadData();
	}
}
customElements.define('d2l-insights-semester-filter', SemesterFilter);
