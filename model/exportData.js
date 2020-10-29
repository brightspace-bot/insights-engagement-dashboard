import exportFromJSON from 'export-from-json';
import { TABLE_USER } from '../components/users-table';
import { toJS } from 'mobx';

export class ExportData {

	static userDataToCsv(data, headers) {
		const formattedData = toJS(data).map(item => {
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

		return this.exportToCsv(formattedData, headers);
	}

	static exportToCsv(formattedData, headers) {
		const jsonArrayData = formattedData.map((data) => {
			const arr = headers.reduce((acc, val, i) => ({ ...acc, [val]: data[i] }), {});
			return arr;
		});
		exportFromJSON({ data: jsonArrayData, fileName: 'engagement', exportType: exportFromJSON.types.csv });
	}
}
