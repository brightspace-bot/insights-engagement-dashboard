import { action, autorun, computed, decorate, observable } from 'mobx';
import { OrgUnitSelectorFilter, RoleSelectorFilter, SemesterSelectorFilter } from './selectorFilters.js';

import { CardFilter } from './cardFilter.js';
import OrgUnitAncestors from './orgUnitAncestors';

export const RECORD = {
	ORG_UNIT_ID: 0,
	USER_ID: 1,
	ROLE_ID: 2,
	OVERDUE: 3,
	CURRENT_FINAL_GRADE: 4,
	TIME_IN_CONTENT: 5
};

export const USER = {
	ID: 0,
	FIRST_NAME: 1,
	LAST_NAME: 2
};

export const ORG_UNIT = {
	ID: 0,
	NAME: 1,
	TYPE: 2,
	ANCESTORS: 3
};

function unique(array) {
	return [...new Set(array)];
}

function countUnique(records, field) {
	return new Set(records.map(r => r[field])).size;
}
const TiCVsGradesFilterId = 'd2l-insights-time-in-content-vs-grade-card';
const OverdueAssignmentsFilterId = 'd2l-insights-overdue-assignments-card';

export class Data {
	constructor({ recordProvider, cardFilters }) {
		this.recordProvider = recordProvider;
		this._orgUnitAncestors = null;
		this._userDictionary = null;
		this._recordsLength = 0;

		// @observables
		this.tiCVsGradesQuadNum = -1;
		this.avgTimeInContent = 0;
		this.avgGrades = 0;
		this.isLoading = true;
		this.serverData = {
			records: [],
			orgUnits: [],
			users: [],
			isRecordsTruncated: false,
			isOrgUnitsTruncated: false,
			semesterTypeId: null,
			selectedOrgUnitIds: [],
			selectedRolesIds: [],
			selectedSemestersIds: [],
			defaultViewOrgUnitIds: null
		};

		this._selectorFilters = {
			role: new RoleSelectorFilter(this.serverData),
			semester: new SemesterSelectorFilter(this.serverData, this._orgUnitAncestors),
			orgUnit: new OrgUnitSelectorFilter(this.serverData, this._orgUnitAncestors)
		};

		this.cardFilters = {};

		// additional setup
		cardFilters
			.map(params => new CardFilter(params, this))
			.forEach(f => this.cardFilters[f.id] = f);

		this._restore();

		// mobx will run _persist() whenever relevant state changes
		autorun(() => this._persist());

		this.loadData({ defaultView: true });
	}

	loadData({ newRoleIds = null, newSemesterIds = null, newOrgUnitIds = null, defaultView = false }) {
		const filters = {
			roleIds: newRoleIds || this._selectorFilters.role.selected,
			semesterIds: newSemesterIds || this._selectorFilters.semester.selected,
			orgUnitIds: newOrgUnitIds || this._selectorFilters.orgUnit.selected,
			defaultView
		};
		this.recordProvider(filters).then(data => this.onServerDataReload(data));
	}

	// @action
	onServerDataReload(newServerData) {
		this._orgUnitAncestors = new OrgUnitAncestors(newServerData.orgUnits);
		this._userDictionary = new Map(newServerData.users.map(user => [user[USER.ID], user]));
		this.isLoading = false;
		this.serverData = newServerData;

		this._selectorFilters = {
			role: new RoleSelectorFilter(this.serverData),
			semester: new SemesterSelectorFilter(this.serverData, this._orgUnitAncestors),
			orgUnit: new OrgUnitSelectorFilter(this.serverData, this._orgUnitAncestors)
		};
	}

	set selectedRoleIds(newRoleIds) {
		if (this._selectorFilters.role.shouldReloadFromServer(newRoleIds)) {
			this.loadData({ newRoleIds });
		} else {
			this._selectorFilters.role.selected = newRoleIds;
		}
	}

	get selectedRoleIds() {
		return this._selectorFilters.role.selected;
	}

	set selectedSemesterIds(newSemesterIds) {
		if (this._selectorFilters.semester.shouldReloadFromServer(newSemesterIds)) {
			this.loadData({ newSemesterIds });
		} else {
			this._selectorFilters.semester.selected = newSemesterIds;
		}
	}

	get selectedSemesterIds() {
		return this._selectorFilters.semester.selected;
	}

	set selectedOrgUnitIds(newOrgUnitIds) {
		if (this._selectorFilters.orgUnit.shouldReloadFromServer(newOrgUnitIds)) {
			this.loadData({ newOrgUnitIds });
		} else {
			this._selectorFilters.orgUnit.selected = newOrgUnitIds;
		}
	}

	get selectedOrgUnitIds() {
		return this._selectorFilters.orgUnit.selected;
	}

	// @computed
	get records() {
		return this.serverData.records.filter(record => {
			return Object.values(this._selectorFilters).every(filter => filter.shouldInclude(record));
		});
	}

	// @computed
	get users() {
		const userIdsInView = unique(this.getRecordsInView().map(record => record[RECORD.USER_ID]));
		return userIdsInView.map(userId => this._userDictionary.get(userId));
	}

	// @computed
	// just the ous matching the semester filter
	get orgUnits() {
		return this.serverData.orgUnits.filter(x => this._selectorFilters.semester.shouldIncludeOrgUnitId(x[ORG_UNIT.ID]));
	}

	// @computed
	get userDataForDisplay() {
		// map to a 2D userData array, with column 0 as the lastFirstName
		// then sort by lastFirstName

		return this.users
			.map(user => [`${user[USER.LAST_NAME]}, ${user[USER.FIRST_NAME]}`])
			.sort((user1, user2) => {
				return user1[0].localeCompare(user2[0]);
			});
	}

	get currentFinalGrades() {
		//keep in count students with 0 grade, but remove with null
		return this.getRecordsInView()
			.filter(record => record[RECORD.CURRENT_FINAL_GRADE] !== null && record[RECORD.CURRENT_FINAL_GRADE] !== undefined)
			.map(record => [record[RECORD.TIME_IN_CONTENT], record[RECORD.CURRENT_FINAL_GRADE]])
			.filter(item => item[0] || item[1])
			.map(item => (item[1] ? Math.floor(item[1] / 10) * 10 : 0))
			.map(item => (item === 100 ? 90 : item)); // put grade 100 in bin 90-100
	}

	get tiCVsGrades() {
		return this.getRecordsInView(TiCVsGradesFilterId)
			.filter(record => record[RECORD.CURRENT_FINAL_GRADE] !== null && record[RECORD.CURRENT_FINAL_GRADE] !== undefined)
			.map(record => [record[RECORD.TIME_IN_CONTENT], record[RECORD.CURRENT_FINAL_GRADE]])
			.filter(item => item[0] || item[1])
			.map(item => [item[0] !== 0 ? Math.floor(item[0] / 60) : 0, item[1]]); //keep in count students either without grade or without time in content
	}

	setTiCVsGradesCardFilter(quadNum) {
		this.cardFilters[TiCVsGradesFilterId]._setTiCVsGradesCardFilter(quadNum);
	}

	get checkIfNeedChangeTiCVsGradesAvgValues() {
		return !(this._recordsLength === this.records.length);
	}

	get tiCVsGradesAvgValues() {
		return [this.avgTimeInContent, this.avgGrades];
	}

	setTiCVsGradesAvgValues() {
		//avg values will change if records length changes
		this._recordsLength = this.records.length;

		const arrayOfTimeInContent =  this.tiCVsGrades.map(item => item[0]);
		this.avgTimeInContent = arrayOfTimeInContent.length ? Math.floor(arrayOfTimeInContent.reduce((a, b) => a + b, 0) / arrayOfTimeInContent.length) : 0;

		const arrayOfGrades = this.tiCVsGrades.map(item => item[1]);
		this.avgGrades = arrayOfGrades.length ? Math.floor(arrayOfGrades.reduce((a, b) => a + b, 0) / arrayOfGrades.length) : 0;
	}

	get usersCountsWithOverdueAssignments() {
		return this.getRecordsInView(OverdueAssignmentsFilterId)
			.reduce((acc, record) => {
				if (!acc.has(record[RECORD.USER_ID]) && record[RECORD.OVERDUE] !== 0) {
					acc.add(record[RECORD.USER_ID]);
				}
				return acc;
			}, 	new Set()).size;
	}

	getRecordsInView(id) {
		// if id is omitted, all applied filters will be used
		const otherFilters = Object.values(this.cardFilters).filter(f => f.isApplied && f.id !== id);
		return this.records.filter(r => otherFilters.every(f => f.shouldInclude(r)));
	}

	getStats(id) {
		const recordsInView = this.getRecordsInView(id);

		const filter = this.cardFilters[id];

		// NB: due to compact API response, we'll need to map field names to array indices
		const matchingRecords = recordsInView.filter(r => !filter.filter || filter.shouldInclude(r));
		const value = countUnique(matchingRecords, filter.countUniqueField);

		let delta = null;
		if (filter.deltaField) {
			const deltaMatchingRecords = recordsInView.filter(r => r[filter.deltaField] < filter.threshold);
			const oldValue = countUnique(deltaMatchingRecords, filter.countUniqueField);
			delta = value - oldValue;
		}

		return {
			value,
			delta
		};
	}

	// @action
	setApplied(id, isApplied) {
		if (this.cardFilters[id]) this.cardFilters[id].isApplied = isApplied;
	}

	_persist() {
		localStorage.setItem('d2l-insights-engagement-dashboard.state', JSON.stringify(
			Object.keys(this.cardFilters)
				.map(f => ({ id: f, applied: this.cardFilters[f].isApplied, filter: String(this.cardFilters[f].filter) }))
		));

		localStorage.setItem('d2l-insights-engagement-dashboard.tiCVsGradesQuadNum', JSON.stringify(
			this.tiCVsGradesQuadNum
		));

		localStorage.setItem('d2l-insights-engagement-dashboard.tiCVsGradesAvgValues', JSON.stringify(
			Object.values([this.avgGrades, this.avgTimeInContent])
		));
	}

	_restore() {
		// this might be better handled by url-rewriting
		const state = JSON.parse(localStorage.getItem('d2l-insights-engagement-dashboard.state') || '[]');
		state.forEach(filterState => this.setApplied(filterState.id, filterState.applied));
		state.forEach(filterState => this.cardFilters[filterState.id].filter = eval(filterState.filter));

		this.tiCVsGradesQuadNum = JSON.parse(localStorage.getItem('d2l-insights-engagement-dashboard.tiCVsGradesQuadNum') || -1);
		const avgValues = JSON.parse(localStorage.getItem('d2l-insights-engagement-dashboard.tiCVsGradesAvgValues') || '[0, 0]');
		this.avgGrades = avgValues[0];
		this.avgTimeInContent = avgValues[1];
	}
}

decorate(Data, {
	serverData: observable,
	records: computed,
	users: computed,
	orgUnits: computed,
	userDataForDisplay: computed,
	usersCountsWithOverdueAssignments: computed,
	tiCVsGrades: computed,
	currentFinalGrades: computed,
	cardFilters: observable,
	isLoading: observable,
	tiCVsGradesQuadNum: observable,
	avgGrades: observable,
	avgTimeInContent: observable,
	onServerDataReload: action,
	setApplied: action,
	setTiCVsGradesCardFilter: action,
	setTiCVsGradesAvgValues: action
});
