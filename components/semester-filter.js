import './simple-filter';

import {html, LitElement} from 'lit-element';
import FakeLms from '../model/fake-lms';
import {ifDefined} from 'lit-html/directives/if-defined.js';
import Lms from '../model/lms';
import {Localizer} from '../locales/localizer';

/**
 * @property {{id: string, displayName: string, selected: boolean}[]} _filterData
 * @property {string} _bookmark
 * @property {string} _search - serach string
 * @property {string[]} selected - array of selected ids
 * @fires d2l-insights-semester-filter-change
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
		/** @type {{id: string, displayName: string, selected: boolean}[]} */
		this._filterData = [];
		this._bookmark = null;
		this.pageSize = 3;
	}

	async firstUpdated() {
		this._lms = this.isDemo ? new FakeLms() : new Lms();
		await this._loadData();
	}

	get selected() {
		return this._filterData
			.filter(semester => semester.selected)
			.map(semester => semester.id);
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
			displayName: `${item.orgUnitName}: ${item.orgUnitId}`,
			selected: false
		})));
	}

	_saveBookmark(pagingInfo) {
		this._bookmark = pagingInfo.HasMoreItems ? pagingInfo.Bookmark : null;
	}

	_setSelectedState(id, selected) {
		this._filterData.find(semester => semester.id === id).selected = selected;
	}

	render() {
		return html`
			<d2l-simple-filter
				@d2l-simple-filter-selected="${this._updateFilterSelections}"
				name="${this.localize('components.semester-filter.name')}"
				load-more-text="${ifDefined(this._bookmark ? this.localize('components.semester-filter.loadMore') : undefined)}"
				@d2l-simple-filter-load-more-click="${this._loadMoreClick}"
				searchable
				@d2l-simple-filter-searched="${this._searchClick}"
				.data="${this._filterData}">
			</d2l-simple-filter>
		`;
	}

	_updateFilterSelections(event) {
		this._setSelectedState(event.detail.itemId, event.detail.selected);

		this.dispatchEvent(new Event('d2l-insights-semester-filter-change'));
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
