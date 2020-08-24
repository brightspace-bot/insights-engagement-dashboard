import { action, autorun, computed, decorate, observable } from 'mobx';
import OrgUnitAncestors from './orgUnitAncestors.js';

const RECORD = {
	ORG_UNIT_ID: 0,
	USER_ID: 1,
	ROLE_ID: 2
};

const USER = {
	ID: 0,
	FIRST_NAME: 1,
	LAST_NAME: 2
};

function countUnique(records, field) {
	return new Set(records.map(r => r[field])).size;
}

// this is a potted example - various bar-charts will be slight variations on this
export class Histogram {
	constructor({ id, title, field }, data) {
		this.id = id;
		this.title = title;
		this.field = field;
		this.data = data;
	}

	get isLoading() {
		return this.data.isLoading;
	}

	get series() {
		const dataByU = {};
		this.data.getRecordsInView(this.id).forEach(r => dataByU[r[this.field]] = [...dataByU[r[this.field]] || [], r]);
		return Object.keys(dataByU).sort().map(k => dataByU[k].length);
	}
}

export class Filter {
	constructor({ id, messageProvider, title, field, deltaField, threshold, countUniqueField, isApplied = false }, data) {
		this.id = id;
		this.messageProvider = messageProvider;
		this.title = title;
		this.field = field;
		this.deltaField = deltaField;
		this.threshold = threshold;
		this.countUniqueField = countUniqueField;
		this.data = data;
		this.isApplied = isApplied;
	}

	get isLoading() {
		return this.data.isLoading;
	}

	get message() {
		return this.messageProvider(this);
	}

	get stats() {
		return this.data.getStats(this.id);
	}
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

		this.orgUnitDescendants = null;

		this.cardFilters = {};
		cardFilters
			.map(params => new Filter(params, this))
			.forEach(f => this.cardFilters[f.id] = f);

		this._restore();

		// mobx will run _persist() whenever relevant state changes
		autorun(() => this._persist());

		recordProvider().then(data => {
			this.serverData = data;
			this.isLoading = false;
			this.orgUnitAncestors = new OrgUnitAncestors(data.orgUnits);
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
		let records = this.serverData.records;

		const roleFilterApplied = this.selectorFilters.roleIds.length;
		const orgUnitFilterApplied = this.selectorFilters.orgUnitIds.length;
		const semesterFilterApplied = this.selectorFilters.semesterIds.length;

		if (roleFilterApplied || orgUnitFilterApplied || semesterFilterApplied) {
			records = records.filter(record => {
				let ancestors;
				if (orgUnitFilterApplied || semesterFilterApplied) {
					ancestors = this.orgUnitAncestors.getAncestorsFor(record[RECORD.ORG_UNIT_ID]);
				}

				const roleCriterion = !roleFilterApplied
					|| this.selectorFilters.roleIds.includes(record[RECORD.ROLE_ID]);

				const orgUnitCriterion = !orgUnitFilterApplied
					|| this.selectorFilters.orgUnitIds.some(selectedId => ancestors.has(selectedId));

				const semesterCriterion = !semesterFilterApplied
					|| this.selectorFilters.semesterIds.some(selectedId => ancestors.has(selectedId));

				return roleCriterion && orgUnitCriterion && semesterCriterion;
			});
		}

		return records;
	}

	get users() {
		let users = this.serverData.users;

		const roleFilterApplied = this.selectorFilters.roleIds.length;
		const orgUnitFilterApplied = this.selectorFilters.orgUnitIds.length;
		const semesterFilterApplied = this.selectorFilters.semesterIds.length;

		if (roleFilterApplied || orgUnitFilterApplied || semesterFilterApplied) {
			const userIdsInView = this.records.map(record => record[RECORD.USER_ID]);
			users = users.filter(user => userIdsInView.includes(user[USER.ID]));
		}

		return users;
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

decorate(Histogram, {
	id: observable,
	title: observable,
	field: observable,
	series: computed
});

decorate(Filter, {
	id: observable,
	messageProvider: observable,
	title: observable,
	field: observable,
	deltaField: observable,
	threshold: observable,
	countUniqueField: observable,
	isApplied: observable,
	message: computed,
	stats: computed
});

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
