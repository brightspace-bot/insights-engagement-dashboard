// this is a potted example - various bar-charts will be slight variations on this
import { computed, decorate, observable } from 'mobx';

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

decorate(Histogram, {
	id: observable,
	title: observable,
	field: observable,
	series: computed
});
