import { computed, decorate, observable } from 'mobx';

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
		this.filter = filter || this._defaultFilter;
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

	_defaultFilter(record) {
		return record[this.field] < this.threshold;
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
