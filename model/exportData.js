import { TABLE_USER } from '../components/users-table';
import { toJS } from 'mobx';

export class ExportData {

	static dataFormatter(data) {
		return toJS(data).map(item => {
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

	static arrayToCsv(formattedData, headers) {
		const csvRows = [];
		csvRows.push(headers.join(','));

		for (const row of formattedData) {
			const values = row.map(item => {
				const element = (`${item}`).replace(/"/g, ''); //replace any quotes
				return `"${element}"`; //wrap element in quotes
			});
			csvRows.push(values.join(','));
		}
		return csvRows.join('\n');
	}

	static downloadCsv(arrayToCsv) {
		const blob = new Blob([arrayToCsv], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const dashboardRoot = document.querySelector('d2l-insights-engagement-dashboard').shadowRoot;
		const exportCsv = dashboardRoot.querySelector('.export-csv');
		exportCsv.setAttribute('href', url);
		exportCsv.click();
	}
}
