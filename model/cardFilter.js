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
		return this.filter(record, this.data);
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
	message: computed,
	stats: computed
});
