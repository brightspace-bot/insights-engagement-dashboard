import '@brightspace-ui/core/components/inputs/input-text';
import '@brightspace-ui-labs/pagination/pagination';
import './table.js';

import {css, html} from 'lit-element';
import {inputStyles} from '@brightspace-ui/core/components/inputs/input-styles';
import {Localizer} from '../locales/localizer';
import {MobxLitElement} from '@adobe/lit-mobx';
import {selectStyles} from '@brightspace-ui/core/components/inputs/input-select-styles';

/**
 * At the moment the mobx data object is doing sorting / filtering logic
 *
 * @property {Object} data - an instance of Data from model/data.js
 * @property {Number} _currentPage
 * @property {Number} _pageSize
 */
class UsersTable extends Localizer(MobxLitElement) {

	static get properties() {
		return {
			data: {type: Object, attribute: false},
			_currentPage: {type: Number, attribute: false},
			_pageSize: {type: Number, attribute: false}
		};
	}

	static get styles() {
		return [
			inputStyles,
			selectStyles,
			css`
				:host {
					display: block;
				}
				:host([hidden]) {
					display: none;
				}

				.d2l-insights-users-table-controls {
					display: flex;
					margin: 30px 0;
					width: 100%;
				}

				.d2l-insights-users-table-controls-item {
					flex: 1 1 33%;
				}

				.table-total-users {
					flex: 0 1 33%;
				}

				.table-page-controls {
					flex: 0 1 67%;
				}
			`
		];
	}

	constructor() {
		super();
		this.data = {
			userDataForDisplay: []
		};
		this._currentPage = 1;
		this._pageSize = 20;
	}

	get _itemsCount() {
		// this might recalculate userDataForDisplay every time it's accessed, which could make perf bad
		return this.data.userDataForDisplay.length;
	}

	get _maxPages() {
		const itemsCount = this._itemsCount;
		return itemsCount ? Math.ceil(itemsCount / this._pageSize) : 0;
	}

	get _displayData() {
		if (this._itemsCount) {
			const start = this._pageSize * (this._currentPage - 1);
			const end = this._pageSize * (this._currentPage); // it's ok if this is larger than the size of the array

			return this.data.userDataForDisplay.slice(start, end);
		}

		return [];
	}

	get columns() {
		return [
			this.localize('components.insights-users-table.lastFirstName')
		];
	}

	render() {
		return html`
			<d2l-insights-table
				title="${this.localize('components.insights-users-table.title')}"
				.columns=${this.columns}
				.data="${this._displayData}"></d2l-insights-table>

			<div class="d2l-insights-users-table-controls">
				<div class="d2l-insights-users-table-controls-item">
					${this.localize('components.insights-users-table.totalUsers', { num: this._itemsCount })}
				</div>

				<div class="table-page-controls">
					<d2l-labs-pagination
						showItemCountSelect="true"
						itemCountOptions="[10,20,50,100]"
						pageNumber="${this._currentPage}"
						maxPageNumber="${this._maxPages}"
						selectedCountOption="${this._pageSize}"
						@pagination-page-change="${this._handlePageChange}"
						@pagination-item-counter-change="${this._handlePageSizeChange}"
					></d2l-labs-pagination>
				</div>
			</div>
		`;
	}

	updated() {
		if (this._itemsCount === 0) {
			this._currentPage = 0;
		} else if (this._currentPage === 0) {
			this._currentPage = 1;
		}
	}

	_handlePageChange(event) {
		this._currentPage = event.detail.page;
	}

	_handlePageSizeChange(event) {
		this._currentPage = 1;
		this._pageSize = Number(event.detail.itemCount); // itemCount comes back as a string
	}
}
customElements.define('d2l-insights-users-table', UsersTable);
