import { action, decorate, observable, toJS } from 'mobx';
import { TABLE_USER } from '../components/users-table';

export class ExportData {
	constructor() {
		this.data = [];
	}

	getData() {
		return toJS(this.data).map(item => {
			const lastFirstName = item[TABLE_USER.NAME_INFO][0].split(', ');
			const userNameUserID = item[TABLE_USER.NAME_INFO][1].split(' - ');

			return [`"${lastFirstName[0]}"`,
				`"${lastFirstName[1]}"`,
				`"${userNameUserID[0]}"`,
				`"${userNameUserID[1]}"`,
				`"${item[TABLE_USER.COURSES]}"`,
				`"${item[TABLE_USER.AVG_GRADE]}"`,
				`"${item[TABLE_USER.AVG_TIME_IN_CONTENT]}"`,
				`"${item[TABLE_USER.LAST_ACCESSED_SYS]}"`];
		});
	}

	arrayToCsv() {
		const csvRows = [];
		const headers = ['FirstName', 'LastName', 'UserName', 'UserID', 'Courses', 'AvgGrade', 'AvgTimeInContent', 'lastAccessedSys'];
		csvRows.push(headers.join(','));

		for (const row of this.getData()) {
			csvRows.push(row.join(','));
		}
		return csvRows.join('\n');
	}

	downloadCsv() {
		const blob = new Blob([this.arrayToCsv()], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', 'engagement.csv');
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	setData(array) {
		this.data = array;
	}
}
decorate(ExportData, {
	data: observable,
	setData: action
});
