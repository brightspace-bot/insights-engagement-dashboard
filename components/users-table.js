import '@brightspace-ui/core/components/inputs/input-text';
import '@brightspace-ui-labs/pagination/pagination';
import './table.js';
import { computed, decorate } from 'mobx';
import { css, html } from 'lit-element';
import { formatNumber, formatPercent } from '@brightspace-ui/intl';
import { RECORD, USER } from '../consts';
import { COLUMN_TYPES } from './table';
import { formatDateTime } from '@brightspace-ui/intl/lib/dateTime.js';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin';

const TABLE_USER = {
	NAME_INFO: 0,
	COURSES: 1,
	AVG_GRADE: 2,
	AVG_TIME_IN_CONTENT: 3,
	AVG_DISCUSSION_ACTIVITY: 4,
	LAST_ACCESSED_SYS: 5
};

const numberFormatOptions = { maximumFractionDigits: 2 };

const DEFAULT_PAGE_SIZE = 20;

function avgOf(records, field) {
	const total = records.reduce((sum, r) => sum + r[field], 0);
	return total / records.length;
}

/**
 * The mobx data object is doing filtering logic
 *
 * @property {Object} data - an instance of Data from model/data.js
 * @property {Number} _currentPage
 * @property {Number} _pageSize
 */
class UsersTable extends SkeletonMixin(Localizer(MobxLitElement)) {

	static get properties() {
		return {
			data: { type: Object, attribute: false },
			_currentPage: { type: Number, attribute: false },
			_pageSize: { type: Number, attribute: false }
		};
	}

	static get styles() {
		return [
			css`
				:host {
					display: block;
				}
				:host([hidden]) {
					display: none;
				}

				d2l-labs-pagination {
					margin: 15px 0;
				}

				.d2l-insights-users-table-total-users {
					margin-bottom: 30px;
					width: 100%;
				}
			`
		];
	}

	constructor() {
		super();
		this.data = {
			users: []
		};
		this._currentPage = 1;
		this._pageSize = DEFAULT_PAGE_SIZE;
	}

	get _itemsCount() {
		return this.userDataForDisplay.length;
	}

	get _maxPages() {
		const itemsCount = this._itemsCount;
		return itemsCount ? Math.ceil(itemsCount / this._pageSize) : 0;
	}

	// don't use displayData.length to get the itemsCount. When we display a skeleton view, displayData.length is
	// the number of skeleton rows we're displaying, but the Total Users count should still be 0
	get _displayData() {
		if (this.skeleton) {
			const loadingPlaceholderText = this.localize('components.insights-users-table.loadingPlaceholder');

			// a DEFAULT_PAGE_SIZE x columnInfoLength 2D array filled with a generic string
			return Array(DEFAULT_PAGE_SIZE).fill(Array(this.columnInfo.length).fill(loadingPlaceholderText));
		}

		if (this._itemsCount) {
			const start = this._pageSize * (this._currentPage - 1);
			const end = this._pageSize * (this._currentPage); // it's ok if this goes over the end of the array
			return this.userDataForDisplay.slice(start, end);
		}

		return [];
	}

	// @computed
	get userDataForDisplay() {
		// map to a 2D userData array, with column 0 as a sub-array of [lastFirstName, username - id]
		// then sort by lastFirstName
		const recordsByUser = this.data.recordsByUser;
		return this.data.users
			.map(user => {
				const records = recordsByUser.get(user[USER.ID]);
				const recordsWithGrades = records.filter(r => r[RECORD.CURRENT_FINAL_GRADE] !== null);
				const avgFinalGrade = avgOf(recordsWithGrades, RECORD.CURRENT_FINAL_GRADE);
				const threads = avgOf(records, RECORD.DISCUSSION_ACTIVITY_THREADS);
				const read = avgOf(records, RECORD.DISCUSSION_ACTIVITY_READS);
				const replies = avgOf(records, RECORD.DISCUSSION_ACTIVITY_REPLIES);
				const date = user[USER.LAST_SYS_ACCESS] ? new Date(user[USER.LAST_SYS_ACCESS]).toISOString() : null;
				return [
					[`${user[USER.LAST_NAME]}, ${user[USER.FIRST_NAME]}`, `${user[USER.USERNAME]} - ${user[USER.ID]}`],
					records.length, // courses
					avgFinalGrade ? formatPercent(avgFinalGrade / 100, numberFormatOptions) : '',
					formatNumber(avgOf(records, RECORD.TIME_IN_CONTENT) / 60, numberFormatOptions),
					[Math.round(threads), Math.round(read), Math.round(replies)],
					date ? formatDateTime(new Date(date), { format: 'medium' }) : this.localize('components.insights-users-table.null')
				];
			})
			.sort((user1, user2) => {
				// sort by lastFirstName
				return user1[TABLE_USER.NAME_INFO][0].localeCompare(user2[TABLE_USER.NAME_INFO][0]);
			});
	}

	get columnInfo() {
		return [
			{
				headerText: this.localize('components.insights-users-table.lastFirstName'),
				columnType: COLUMN_TYPES.TEXT_SUB_TEXT
			},
			{
				headerText: this.localize('components.insights-users-table.courses'),
				columnType: COLUMN_TYPES.NORMAL_TEXT
			},
			{
				headerText: this.localize('components.insights-users-table.avgGrade'),
				columnType: COLUMN_TYPES.NORMAL_TEXT
			},
			{
				headerText: this.localize('components.insights-users-table.avgTimeInContent'),
				columnType: COLUMN_TYPES.NORMAL_TEXT
			},
			{
				headerText: this.localize('components.insights-users-table.avgDiscussionActivity'),
				columnType: COLUMN_TYPES.SUB_COLUMNS
			},
			{
				headerText: this.localize('components.insights-users-table.lastAccessedSys'),
				columnType: COLUMN_TYPES.NORMAL_TEXT
			}
		];
	}

	render() {
		return html`
			<d2l-insights-table
				title="${this.localize('components.insights-users-table.title')}"
				.columnInfo=${this.columnInfo}
				.data="${this._displayData}"
				?skeleton="${this.skeleton}"></d2l-insights-table>

			<d2l-labs-pagination
				show-item-count-select
				item-count-options="[10,20,50,100]"
				page-number="${this._currentPage}"
				max-page-number="${this._maxPages}"
				selected-count-option="${this._pageSize}"
				@pagination-page-change="${this._handlePageChange}"
				@pagination-item-counter-change="${this._handlePageSizeChange}"
			></d2l-labs-pagination>

			${this._renderTotalUsers()}
		`;
	}

	_renderTotalUsers() {
		const itemCounts = this.skeleton ? 0 : this._itemsCount;

		return html`
			<div class="d2l-insights-users-table-total-users">
				${this.localize('components.insights-users-table.totalUsers', { num: itemCounts })}
			</div>
		`;
	}

	updated() {
		if (this.skeleton) {
			this._currentPage = 0;
			return;
		}

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
decorate(UsersTable, {
	userDataForDisplay: computed
});
customElements.define('d2l-insights-users-table', UsersTable);
