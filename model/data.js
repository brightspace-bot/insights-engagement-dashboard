import { action, autorun, computed, decorate, observable } from 'mobx';
import { CardFilter } from './cardFilter.js';
import OrgUnitAncestors from './orgUnitAncestors.js';

const RECORD = {
	ORG_UNIT_ID: 0,
	USER_ID: 1,
	ROLE_ID: 2,
	CURRENT_FINAL_GRADE: 3
};

const USER = {
	ID: 0,
	FIRST_NAME: 1,
	LAST_NAME: 2
};

function unique(array) {
	return [...new Set(array)];
}

function countUnique(records, field) {
	return new Set(records.map(r => r[field])).size;
}

export class Data {
	constructor({ recordProvider, cardFilters }) {
		this.isLoading = true;

		// for the purposes of these top level filters, "empty filters" is equivalent to "no filter applied"
		this.selectorFilters = {
			roleIds: [],
			orgUnitIds: [],
			semesterIds: []
		};

		this.serverData = {
			records: [],
			orgUnits: [],
			users: [],
			selectedOrgUnitIds: []
		};

		this._orgUnitAncestors = null;
		this._userDictionary = null;

		this.cardFilters = {};
		cardFilters
			.map(params => new CardFilter(params, this))
			.forEach(f => this.cardFilters[f.id] = f);

		this._restore();

		// mobx will run _persist() whenever relevant state changes
		autorun(() => this._persist());

		recordProvider().then(data => {
			this._orgUnitAncestors = new OrgUnitAncestors(data.orgUnits);
			this._userDictionary = new Map(data.users.map(user => [user[USER.ID], user]));
			this.isLoading = false;
			this.serverData = data;
		});
	}

	applyRoleFilters(roleIds) {
		// future work: reload data from server if necessary
		this.selectorFilters.roleIds = roleIds;
	}

	applyOrgUnitFilters(orgUnitIds) {
		this.selectorFilters.orgUnitIds = orgUnitIds;
	}

	applySemesterFilters(semesterIds) {
		this.selectorFilters.semesterIds = semesterIds;
	}

	// the reason for separating this from getRecordsInView is to try not to reapply the top level filters if
	// we don't need to.
	get records() {
		return this.serverData.records.filter(record => {
			const ancestors = this._orgUnitAncestors.getAncestorsFor(record[RECORD.ORG_UNIT_ID]);

			const roleCriterion = !this.selectorFilters.roleIds.length
				|| this.selectorFilters.roleIds.includes(record[RECORD.ROLE_ID]);

			const orgUnitCriterion = !this.selectorFilters.orgUnitIds.length
				|| this.selectorFilters.orgUnitIds.some(selectedId => ancestors.has(selectedId));

			const semesterCriterion = !this.selectorFilters.semesterIds.length
				|| this.selectorFilters.semesterIds.some(selectedId => ancestors.has(selectedId));

			return roleCriterion && orgUnitCriterion && semesterCriterion;
		});
	}

	get users() {
		const userIdsInView = unique(this.records.map(record => record[RECORD.USER_ID]));
		return userIdsInView.map(userId => this._userDictionary.get(userId));
	}

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
		return this.serverData.records.map(record => record[3]);
	}

	getRecordsInView(id) {
		// if id is omitted, all applied filters will be used
		const otherFilters = Object.values(this.cardFilters).filter(f => f.isApplied && f.id !== id);
		return this.serverData.records.filter(r => otherFilters.every(f => r[f.field] < f.threshold));
	}

	getStats(id) {
		const recordsInView = this.getRecordsInView(id);

		const filter = this.cardFilters[id];

		// NB: due to compact API response, we'll need to map field names to array indices
		const matchingRecords = recordsInView.filter(r => !filter.field || (r[filter.field] < filter.threshold));
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

	setApplied(id, isApplied) {
		if (this.cardFilters[id]) this.cardFilters[id].isApplied = isApplied;
	}

	_persist() {
		localStorage.setItem('d2l-insights-engagement-dashboard.state', JSON.stringify(
			Object.keys(this.cardFilters)
				.map(f => ({ id: f, applied: this.cardFilters[f].isApplied }))
		));
	}

	_restore() {
		// this might be better handled by url-rewriting
		const state = JSON.parse(localStorage.getItem('d2l-insights-engagement-dashboard.state') || '[]');
		state.forEach(filterState => this.setApplied(filterState.id, filterState.applied));
	}
}

decorate(Data, {
	serverData: observable,
	records: computed,
	users: computed,
	userDataForDisplay: computed,
	selectorFilters: observable,
	cardFilters: observable,
	isLoading: observable,
	setApplied: action
});
