import {action, autorun, computed, decorate, observable} from 'mobx';

function countUnique(records, field) {
	return new Set(records.map(r => r[field])).size;
}

// this is a potted example - various bar-charts will be slight variations on this
export class Histogram {
	constructor({id, title, field}, data) {
		this.id = id;
		this.title = title;
		this.field = field;
		this.data = data;
	}

	get series() {
		const dataByU = {};
		this.data.getRecordsInView(this.id).forEach(r => dataByU[r[this.field]] = [...dataByU[r[this.field]] || [], r]);
		return Object.keys(dataByU).sort().map(k => dataByU[k].length);
	}

	get isLoading() {
		return this.data.isLoading;
	}
}

export class Filter {
	constructor({id, messageProvider, title, field, deltaField, threshold, countUniqueField, isApplied = false}, data) {
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

	get message() {
		return this.messageProvider(this);
	}

	get stats() {
		return this.data.getStats(this.id);
	}

	get isLoading() {
		return this.data.isLoading;
	}
}

export class Data {
	constructor({recordProvider, filters}) {
		this.isLoading = true;
		this.records = [];
		this.filters = {};
		filters
			.map(params => new Filter(params, this))
			.forEach(f => this.filters[f.id] = f);

		this._restore();

		// mobx will run _persist() whenever relevant state changes
		autorun(() => this._persist());

		recordProvider().then(records => {
			this.records = records;
			this.isLoading = false;
		});
	}

	setApplied(id, isApplied) {
		if (this.filters[id]) this.filters[id].isApplied = isApplied;
	}

	getStats(id) {
		const recordsInView = this.getRecordsInView(id);

		const filter = this.filters[id];

		const matchingRecords = recordsInView.filter(r => r[filter.field] < filter.threshold);
		const value = countUnique(matchingRecords, filter.countUniqueField);

		const deltaMatchingRecords = recordsInView.filter(r => r[filter.deltaField] < filter.threshold);
		const oldValue = countUnique(deltaMatchingRecords, filter.countUniqueField);

		return {
			value,
			delta: value - oldValue
		};
	}

	getRecordsInView(id) {
		// if id is omitted, all applied filters will be used
		const otherFilters = Object.values(this.filters).filter(f => f.isApplied && f.id !== id);
		return this.records.filter(r => otherFilters.every(f => r[f.field] < f.threshold));
	}

	_restore() {
		// this might be better handled by url-rewriting
		const state = JSON.parse(localStorage.getItem('d2l-insights-engagement-dashboard.state') || '[]');
		state.forEach(filterState => this.setApplied(filterState.id, filterState.applied));
	}

	_persist() {
		console.log('persist');
		localStorage.setItem('d2l-insights-engagement-dashboard.state', JSON.stringify(
			Object.keys(this.filters)
				.map(f => ({id: f, applied: this.filters[f].isApplied}))
		));
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
	records: observable,
	filters: observable,
	isLoading: observable,
	setApplied: action
});

