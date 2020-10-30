import '@brightspace-ui/core/components/inputs/input-text';
import '@brightspace-ui-labs/pagination/pagination';
import 'd2l-table/d2l-scroll-wrapper';
import './table.js';
import { action, computed, decorate, observable, reaction } from 'mobx';
import { css, html } from 'lit-element';
import { formatNumber, formatPercent } from '@brightspace-ui/intl';
import { RECORD, USER } from '../consts';
import { COLUMN_TYPES } from './table';
import { formatDateTime } from '@brightspace-ui/intl/lib/dateTime.js';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin';

const TABLE_USER = {
	SELECTOR_VALUE: 0,
	NAME_INFO: 1,
	COURSES: 2,
	AVG_GRADE: 3,
	AVG_TIME_IN_CONTENT: 4,
	AVG_DISCUSSION_ACTIVITY: 5,
	LAST_ACCESSED_SYS: 6
};

const numberFormatOptions = { maximumFractionDigits: 2 };

const DEFAULT_PAGE_SIZE = 20;

function avgOf(records, field) {
	const total = records.reduce((sum, r) => sum + r[field], 0);
	return total / records.length;
}

function unique(arr) {
	return [...new Set(arr)];
}

/**
 * The mobx data object is doing filtering logic
 *
 * @property {Object} data - an instance of Data from model/data.js
 * @property {Number} _currentPage
 * @property {Number} _pageSize
 * @property {Number} _sortColumn - The index of the column that is currently sorted
 * @property {String} _sortOrder - either 'asc' or 'desc'
 * @property {Array} selectedUserIds - ids of users that are selected in the table
 */
class UsersTable extends SkeletonMixin(Localizer(MobxLitElement)) {

	static get properties() {
		return {
			data: { type: Object, attribute: false },
			_currentPage: { type: Number, attribute: false },
			_pageSize: { type: Number, attribute: false },
			_sortColumn: { type: Number, attribute: false },
			_sortOrder: { type: String, attribute: false },
			selectedUserIds: { type: Array, attribute: false }
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
					max-width: 1200px;
				}

				.d2l-insights-users-table-total-users {
					margin-bottom: 30px;
					width: 100%;
				}

				.d2l-insights-scroll-container {
					overflow-x: auto;
				}

				d2l-scroll-wrapper {
					--d2l-scroll-wrapper-h-scroll: {
						border-left: var(--d2l-table-border-overflow);
						border-right: var(--d2l-table-border-overflow);
					};
					--d2l-scroll-wrapper-h-scroll-focus: {
						border-left: var(--d2l-table-border-overflow-focus);
						border-right: var(--d2l-table-border-overflow-focus);
					};
					--d2l-scroll-wrapper-left: {
						border-left: dashed 1px black;
					};
					--d2l-scroll-wrapper-right: {
						border-right: none;
					};

					--d2l-scroll-wrapper-border-color: var(--d2l-color-galena);
					--d2l-scroll-wrapper-background-color: var(--d2l-color-sylvite);
					--d2l-scroll-wrapper-inner: {
						@apply --d2l-table;
					};
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
		this._sortOrder = 'desc';
		this._sortColumn = TABLE_USER.NAME_INFO;
		this.selectedUserIds = [];

		// reset selectedUserIds whenever the input data changes
		reaction(
			() => this.data.users,
			() => { this._resetSelectedUserIds(); }
		);
	}

	get _itemsCount() {
		return this.userDataForDisplay.length;
	}

	get _maxPages() {
		const itemsCount = this._itemsCount;
		return itemsCount ? Math.ceil(itemsCount / this._pageSize) : 0;
	}

	// should be reset whenever data, page or sorting state changes
	_resetSelectedUserIds() {
		this.selectedUserIds = [];
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

	_handleColumnSort(e) {
		this._sortOrder = e.detail.order;
		this._sortColumn = e.detail.column;
		this._currentPage = 0;

		this._resetSelectedUserIds();
	}

	_preProcessData(user) {
		const recordsByUser = this.data.recordsByUser;

		const userId = user[USER.ID];
		const userLastFirstName = `${user[USER.LAST_NAME]}, ${user[USER.FIRST_NAME]}`;
		const selectorInfo = {
			value: userId,
			ariaLabel: this.localize('components.insights-users-table.selectorAriaLabel', { userLastFirstName }),
			selected: this.selectedUserIds.includes(userId)
		};
		const userInfo = [userLastFirstName, `${user[USER.USERNAME]} - ${userId}`];

		const userRecords = recordsByUser.get(user[USER.ID]);
		const coursesWithGrades = userRecords.filter(r => r[RECORD.CURRENT_FINAL_GRADE] !== null);
		const avgFinalGrade = avgOf(coursesWithGrades, RECORD.CURRENT_FINAL_GRADE);
		const threads = avgOf(userRecords, RECORD.DISCUSSION_ACTIVITY_THREADS);
		const reads = avgOf(userRecords, RECORD.DISCUSSION_ACTIVITY_READS);
		const replies = avgOf(userRecords, RECORD.DISCUSSION_ACTIVITY_REPLIES);

		const userLastSysAccess = user[USER.LAST_SYS_ACCESS] ? new Date(user[USER.LAST_SYS_ACCESS]) : undefined;

		return [
			selectorInfo,
			userInfo,
			userRecords.length, // courses
			avgFinalGrade,
			avgOf(userRecords, RECORD.TIME_IN_CONTENT),
			[Math.round(threads), Math.round(reads), Math.round(replies)],
			userLastSysAccess
		];
	}

	_choseSortFunction(column, order) {
		const ORDER = {
			'asc': [-1, 1, 0],
			'desc': [1, -1, 0]
		};
		if (column === TABLE_USER.NAME_INFO) {
			// NB: "desc" and "asc" are inverted for name info: desc sorts a-z whereas asc sorts z-a
			return (user1, user2) => {
				const lastName1 = user1[TABLE_USER.NAME_INFO][0].toLowerCase();
				const lastName2 = user2[TABLE_USER.NAME_INFO][0].toLowerCase();
				return (lastName1 > lastName2 ? ORDER[order][0] :
					lastName1 < lastName2 ? ORDER[order][1] :
						ORDER[order][2]);
			};
		}

		return (user1, user2) => {
			// undefined is neither greater or less then a value so we set it to -infinity
			const record1 = user1[column] ? user1[column] : Number.NEGATIVE_INFINITY;
			const record2 = user2[column] ? user2[column] : Number.NEGATIVE_INFINITY;
			return (record1 > record2 ? ORDER[order][1] :
				record1 < record2 ? ORDER[order][0] :
					ORDER[order][2]);
		};
	}

	_formatDataForDisplay(user) {
		const lastSysAccessFormatted = user[TABLE_USER.LAST_ACCESSED_SYS]
			? formatDateTime(new Date(user[TABLE_USER.LAST_ACCESSED_SYS]), { format: 'medium' })
			: this.localize('components.insights-users-table.null');

		return [
			user[TABLE_USER.SELECTOR_VALUE],
			user[TABLE_USER.NAME_INFO],
			user[TABLE_USER.COURSES],
			user[TABLE_USER.AVG_GRADE] ? formatPercent(user[TABLE_USER.AVG_GRADE] / 100, numberFormatOptions) : '',
			formatNumber(user[TABLE_USER.AVG_TIME_IN_CONTENT] / 60, numberFormatOptions),
			user[TABLE_USER.AVG_DISCUSSION_ACTIVITY],
			lastSysAccessFormatted
		];
	}

	// @computed
	get userDataForDisplay() {
		// map to a 2D userData array, with column 0 as a sub-array of [lastFirstName, username - id]
		// then sort by lastFirstName
		const sortFunction = this._choseSortFunction(this._sortColumn, this._sortOrder);
		return this.data.users
			.map(this._preProcessData, this)
			.sort(sortFunction)
			.map(this._formatDataForDisplay, this);
	}

	get columnInfo() {
		return [
			{
				headerText: '', // no text should appear for this column header
				columnType: COLUMN_TYPES.ROW_SELECTOR
			},
			{
				headerText: this.localize('components.insights-users-table.lastFirstName'),
				columnType: COLUMN_TYPES.TEXT_SUB_TEXT,
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
			<d2l-scroll-wrapper show-actions="" needs-table>
				<d2l-insights-table
					title="${this.localize('components.insights-users-table.title')}"
					@d2l-insights-table-sort="${this._handleColumnSort}"
					sort-column="1"
					.columnInfo=${this.columnInfo}
					.data="${this._displayData}"
					?skeleton="${this.skeleton}"
					@d2l-insights-table-select-changed="${this._handleSelectChanged}"
				></d2l-insights-table>
			</d2l-scroll-wrapper>

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
		this._resetSelectedUserIds();
	}

	_handlePageSizeChange(event) {
		this._currentPage = 1;
		this._pageSize = Number(event.detail.itemCount); // itemCount comes back as a string
		this._resetSelectedUserIds();
	}

	_handleSelectChanged(event) {
		const changedUserIds = event.detail.values.map(value => Number(value));
		if (event.detail.selected) {
			this.selectedUserIds = unique([...this.selectedUserIds, ...changedUserIds]);
		} else {
			this.selectedUserIds = this.selectedUserIds.filter(userId => !changedUserIds.includes(userId));
		}
	}
}
decorate(UsersTable, {
	selectedUserIds: observable,
	userDataForDisplay: computed,
	_sortColumn: observable,
	_sortOrder: observable,
	_handleColumnSort: action
});
customElements.define('d2l-insights-users-table', UsersTable);
