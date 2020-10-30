import exportFromJSON from 'export-from-json';
import { TABLE_USER } from '../components/users-table';
import { toJS } from 'mobx';
import { USER } from '../consts';

export const DISCUSSION = {
	THREADS: 0,
	READS: 1,
	REPLIES: 2
};

export class ExportData {

	static userDataToCsv(data, headers) {
		const formattedData = toJS(data).map(item => {
			return [
				item[TABLE_USER.NAME_INFO][USER.LAST_NAME],
				item[TABLE_USER.NAME_INFO][USER.FIRST_NAME],
				item[TABLE_USER.NAME_INFO][USER.USERNAME],
				item[TABLE_USER.NAME_INFO][USER.ID],
				item[TABLE_USER.COURSES],
				item[TABLE_USER.AVG_GRADE],
				item[TABLE_USER.AVG_TIME_IN_CONTENT],
				item[TABLE_USER.AVG_DISCUSSION_ACTIVITY][DISCUSSION.THREADS],
				item[TABLE_USER.AVG_DISCUSSION_ACTIVITY][DISCUSSION.READS],
				item[TABLE_USER.AVG_DISCUSSION_ACTIVITY][DISCUSSION.REPLIES],
				item[TABLE_USER.LAST_ACCESSED_SYS]];
		});

		return this.exportToCsv(formattedData, headers);
	}

	static exportToCsv(formattedData, headers) {
		const jsonArrayData = formattedData.map((data) => {
			return headers.reduce((acc, val, i) => ({ ...acc, [val]: data[i] }), {});
		});
		exportFromJSON({ data: jsonArrayData, fileName: 'engagement', exportType: exportFromJSON.types.csv });
	}
}
