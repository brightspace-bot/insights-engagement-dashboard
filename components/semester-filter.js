import './simple-filter';

import {html, LitElement} from 'lit-element';

async function fetchData(bookmark) {
	const url = new URL('/d2l/api/ap/unstable/insights/data/semesters', location.href);
	url.searchParams.set('pageSize', 3);
	if (bookmark) {
		url.searchParams.set('bookmark', bookmark);
	}
	const response = await fetch(url);
	return await response.json();
}

async function testData(bookmark) {
	let response = {
		PagingInfo: {
			Bookmark: '1326467654053_120127',
			HasMoreItems: true
		},
		Items: [
			{
				orgUnitId: 10007,
				orgUnitName: 'IPSIS Semester New'
			},
			{
				orgUnitId: 121194,
				orgUnitName: 'Fall Test Semester'
			},
			{
				orgUnitId: 120127,
				orgUnitName: 'IPSIS Test Semester 5'
			}
		]
	};
	const secondPage = {
		PagingInfo: {
			Bookmark: '1326467625687_120124',
			HasMoreItems: false
		},
		Items: [
			{
				orgUnitId: 120126,
				orgUnitName: 'IPSIS Test Semester 4'
			},
			{
				orgUnitId: 120125,
				orgUnitName: 'IPSIS Test Semester 3'
			},
			{
				orgUnitId: 120124,
				orgUnitName: 'IPSIS Test Semester 2'
			}
		]
	};
	if (bookmark) {
		response = secondPage;
	}
	return await new Promise(resolve =>	setTimeout(() => resolve(response), 100));
}

/**
 * @property {{id: string, displayName: string, selected: boolean}[]} _filterData
 * @property {string} _bookmark
 * @property {string[]} selected - array of selected ids
 * @fires d2l-insights-semester-filter-change
 */
class SemesterFilter extends LitElement {

	static get properties() {
		return {
			isDemo: { type: Boolean, attribute: 'demo' },
			_filterData: { type: Array, attribute: false },
			_bookmark: { type: String, attribute: false}
		};
	}

	constructor() {
		super();

		this._name = 'Semester';
		/** @type {{id: string, displayName: string, selected: boolean}[]} */
		this._filterData = [];
		this._bookmark = null;
	}

	get selected() {
		return this._filterData
			.filter(semester => semester.selected)
			.map(semester => semester.id);
	}

	async firstUpdated() {
		await this._loadData();
	}

	async _getData() {
		return this.isDemo ? await testData(this._bookmark) : await fetchData(this._bookmark);
	}

	async _loadData() {
		const data = await this._getData();

		this._saveBookmark(data.PagingInfo);

		this._filterData = this._filterData.concat(data.Items.map(item => ({
			id: item.orgUnitId.toString(),
			displayName: item.orgUnitName,
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
				name="${this._name}"
				load-more-text="${this._bookmark ? 'Load more' : null}"
				@d2l-simple-filter-load-more-click="${this._loadMoreClick}"
				.data="${this._filterData}">
			</d2l-simple-filter>
		`;
	}

	_updateFilterSelections(event) {
		this._setSelectedState(event.detail.itemId, event.detail.selected);

		this.dispatchEvent(new Event('d2l-insights-semester-filter-change'));
	}

	async _loadMoreClick() {
		await this._loadData();
	}
}
customElements.define('d2l-insights-semester-filter', SemesterFilter);
