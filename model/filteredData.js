import { computed, decorate, observable } from 'mobx';
import { RECORD } from '../consts';

function unique(array) {
	return [...new Set(array)];
}

/**
 * A wrapper for Data that can add and exclude filters. Allows building up collections of
 * filters, some of which depend not just on individual row values but on aggregates across
 * the results of other filters.
 */
export class FilteredData {
	constructor(data, _filters, _filterId) {
		this._data = data;
		this._filters = new Map(_filters.map(filter => [filter.id, filter]));
		this._filterId = _filterId;
		this.__ticVsGradesQuadrant = 'leftBottom';
		this.avgTimeInContent = 0;
		this.avgGrades = 0;
	}

	filter(filter) {
		return new FilteredData(this._data, [this._filters, filter], this._filterId);
	}

	excluding(filterId) {
		return new FilteredData(this._data, this._filters, filterId);
	}

	get isLoading() {
		return this._data.isLoading;
	}

	get records() {
		// if filterId is not set, all applied filters will be used
		const otherFilters = Object.values(this._filters).filter(f => f.isApplied && f.id !== this._filterId);
		return this._data.records.filter(r => otherFilters.every(f => f.filter(r, this)));
	}

	// @computed
	get users() {
		const userIdsInView = unique(this.records.map(record => record[RECORD.USER_ID]));
		return userIdsInView.map(userId => this._data.userDictionary.get(userId));
	}

	get recordsByUser() {
		const recordsByUser = new Map();
		this.records.forEach(r => {
			if (!recordsByUser.has(r[RECORD.USER_ID])) {
				recordsByUser.set(r[RECORD.USER_ID], []);
			}
			recordsByUser.get(r[RECORD.USER_ID]).push(r);
		});
		return recordsByUser;
	}

	getFilter(id) {
		return this._filters.get(id);
	}

	// these tic vs grade methods are here temporarily; having this class will allow
	// a refactor to build a ticvsgrades filter that depends on a FilteredData with just the other filters
	get tiCVsGrades() {
		return this.records
			.filter(record => record[RECORD.CURRENT_FINAL_GRADE] !== null && record[RECORD.CURRENT_FINAL_GRADE] !== undefined)
			.map(record => [record[RECORD.TIME_IN_CONTENT], record[RECORD.CURRENT_FINAL_GRADE]])
			.filter(item => item[0] || item[1])
			.map(item => [item[0] !== 0 ? Math.floor(item[0] / 60) : 0, item[1]]); //keep in count students either without grade or without time in content
	}

	setTiCVsGradesQuadrant(quadrant) {
		this._ticVsGradesQuadrant = quadrant;
	}

	get tiCVsGradesAvgValues() {
		const arrayOfTimeInContent =  this.tiCVsGrades.map(item => item[0]);
		this.avgTimeInContent = arrayOfTimeInContent.length ? Math.floor(arrayOfTimeInContent.reduce((a, b) => a + b, 0) / arrayOfTimeInContent.length) : 0;

		const arrayOfGrades = this.tiCVsGrades.map(item => item[1]);
		this.avgGrades = arrayOfGrades.length ? Math.floor(arrayOfGrades.reduce((a, b) => a + b, 0) / arrayOfGrades.length) : 0;
		return [this.avgTimeInContent, this.avgGrades];
	}
}
decorate(FilteredData, {
	_data: observable,
	_filters: observable,
	_ticVsGradesQuadrant: observable,
	records: computed,
	recordsByUser: computed,
	tiCVsGrades: computed,
	tiCVsGradesAvgValues: computed,
	users: computed
});
