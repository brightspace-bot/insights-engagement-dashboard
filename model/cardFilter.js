import { computed, decorate, observable } from 'mobx';
import { RECORD } from './data';

const TiCVsGradesFilterId = 'd2l-insights-time-in-content-vs-grade-card';

export class CardFilter {
	constructor({ id, messageProvider, title, field, deltaField, threshold, countUniqueField, isApplied = false, filter }, data) {
		this.id = id;
		this.messageProvider = messageProvider;
		this.title = title;
		this.field = field;
		this.deltaField = deltaField;
		this.threshold = threshold;
		this.countUniqueField = countUniqueField;
		this.data = data;
		this.isApplied = isApplied;
		this.filter = filter;
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

	shouldInclude(record) {
		return this.filter(record);
	}

	_setTiCVsGradesCardFilter(quadrant) {
		this.data.tiCVsGradesQuadrant = quadrant;
		if (this.id === this.data.cardFilters[TiCVsGradesFilterId].id) {
			if (this.data.tiCVsGradesQuadrant === 'leftBottom') {
				this.filter = (record) => record[RECORD.TIME_IN_CONTENT] < this.data.tiCVsGradesAvgValues[0] * 60 && record[RECORD.CURRENT_FINAL_GRADE] < this.data.tiCVsGradesAvgValues[1];
			} else if (this.data.tiCVsGradesQuadrant === 'leftTop') {
				this.filter = (record) => record[RECORD.TIME_IN_CONTENT] <= this.data.tiCVsGradesAvgValues[0] * 60 && record[RECORD.CURRENT_FINAL_GRADE] >= this.data.tiCVsGradesAvgValues[1];
			} else if (this.data.tiCVsGradesQuadrant === 'rightTop') {
				this.filter = (record) => record[RECORD.TIME_IN_CONTENT] > this.data.tiCVsGradesAvgValues[0] * 60 && record[RECORD.CURRENT_FINAL_GRADE] > this.data.tiCVsGradesAvgValues[1];
			} else if (this.data.tiCVsGradesQuadrant === 'rightBottom') {
				this.filter = (record) => record[RECORD.TIME_IN_CONTENT] >= this.data.tiCVsGradesAvgValues[0] * 60 && record[RECORD.CURRENT_FINAL_GRADE] <= this.data.tiCVsGradesAvgValues[1];
			} else (this.filter = (record) => record);
		}
	}
}

decorate(CardFilter, {
	id: observable,
	messageProvider: observable,
	title: observable,
	field: observable,
	deltaField: observable,
	threshold: observable,
	countUniqueField: observable,
	isApplied: observable,
	filter: observable,
	message: computed,
	stats: computed
});
