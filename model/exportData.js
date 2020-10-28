import { action, decorate, observable, toJS } from 'mobx';
import { TABLE_USER } from '../components/users-table';

export class ExportData {
	constructor() {
		this.data = [];
		this.headers = [];
	}

	setData(array) {
		this.data = array;
	}

	setHeaders(array) {
		this.headers = array;
	}

	getData() {
		return toJS(this.data).map(item => {
			const lastFirstName = item[TABLE_USER.NAME_INFO][0].split(', ');
			const userNameUserID = item[TABLE_USER.NAME_INFO][1].split(' - ');

			return [lastFirstName[0],
				lastFirstName[1],
				userNameUserID[0],
				userNameUserID[1],
				item[TABLE_USER.COURSES],
				item[TABLE_USER.AVG_GRADE],
				item[TABLE_USER.AVG_TIME_IN_CONTENT],
				item[TABLE_USER.LAST_ACCESSED_SYS]];
		});
	}

	getHeaders() {
		return toJS(this.headers);
	}

	arrayToCsv() {
		const csvRows = [];
		csvRows.push(this.getHeaders().join(','));

		for (const row of this.getData()) {
			const values = row.map(item => {
				const element = (`${item}`).replace(/"/g, ''); //replace any quotes
				return `"${element}"`; //wrap element in quotes
			});
			csvRows.push(values.join(','));
		}
		return csvRows.join('\n');
	}

	downloadCsv() {
		const blob = new Blob([this.arrayToCsv()], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const dashboardRoot = document.querySelector('d2l-insights-engagement-dashboard').shadowRoot;
		const exportCsv = dashboardRoot.querySelector('.export-csv');
		exportCsv.setAttribute('href', url);
		exportCsv.click();
	}

}
decorate(ExportData, {
	data: observable,
	headers: observable,
	setData: action,
	setHeaders: action
});
