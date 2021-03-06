// adding variables here to match signature of real LMS. The filters don't actually work though.
// eslint-disable-next-line no-unused-vars
export async function fetchData({ roleIds, semesterIds, orgUnitIds, defaultView = false }) {
	const demoData = {
		records: [
			[1, 100, 500, 1, 55, 1000, null, 0, 0, 0],
			[1, 200, 600, 0, 33, 2000, Date.now() - 2093, 0, 0, 0],
			[1, 300, 500, 0, null, 1000, null, 0, 0, 0],
			[1, 400, 500, 0, 30, 5000, null, 0, 0, 0],
			[1, 500, 500, 0, 65, 5000, null, 2, 0, 40],
			[1, 500, 600, 0, 51, 4000, null, 0, 0, 0],
			[2, 100, 500, 0, 60, 1100, null, 2, 4, 0],
			[2, 200, 700, 1, 38, 4000, null, 0, 0, 0],
			[1, 200, 700, 1, 71, 4000, null, 0, 0, 0],
			[1, 100, 700, 1, 81, 1000, null, 3, 2, 1],
			[2, 100, 700, 1, 91, 1200, null, 1, 33, 1],
			[2, 300, 500, 0, 9, 7200, null, 1, 3, 5],
			[2, 300, 700, 0, 3, 0, 289298332, 0, 0, 0],
			[2, 400, 700, 0, 100, 7200, Date.now() - 432000001, 0, 0, 0],
			[2, 500, 700, 0, 88, 4000, null, 4, 4, 1],
			[8, 200, 700, 0, null, 0, null, 55, 2, 3],
			[6, 600, 700, 0, 95, 2000, Date.now() - 8560938122, 0, 0, 0],
			[1, 400, 700, 1, 75, 2000, null, 2, 1, 4]
		],
		orgUnits: [
			[1, 'Course 1', 3, [3, 4]],
			[2, 'Course 2', 3, [3, 10]],
			[6, 'Course 3 has a surprisingly long name, but nonetheless this kind of thing is bound to happen sometimes and we do need to design for it. Is that not so?', 3, [7, 4]],
			[8, 'ZCourse 4', 3, [5]],
			[3, 'Department 1', 2, [5]],
			[7, 'Department 2 has a longer name', 2, [5]],
			[4, 'Semester 1', 25, [6606]],
			[10, 'Semester 2', 25, [6606]],
			[5, 'Faculty 1', 7, [6606]],
			[9, 'Faculty 2', 7, [6606, 10]],
			[6606, 'Dev', 1, [0]]
		],
		users: [ // some of which are out of order
			[100,  'ATest', 'AStudent', 'AStudent', Date.now() - 2000000000],
			[300,  'CTest', 'CStudent', 'CStudent', 1603193037132],
			[200,  'BTest', 'BStudent', 'BStudent', Date.now()],
			[400,  'DTest', 'DStudent', 'DStudent', null],
			[500,  'ETest', 'EStudent', 'EStudent', Date.now()],
			[600,  'GTest', 'GStudent', 'GStudent', Date.now()],
			[700,  'FTest', 'FStudent', 'FStudent', Date.now()],
			[800,  'HTest', 'HStudent', 'HStudent', Date.now()],
			[900,  'ITest', 'IStudent', 'IStudent', Date.now()],
			[1000, 'KTest', 'KStudent', 'KStudent', Date.now()],
			[1100, 'JTest', 'JStudent', 'JStudent', Date.now()]
		],
		semesterTypeId: 25,
		numDefaultSemesters: 4,
		selectedSemestersIds: semesterIds,
		selectedRolesIds: roleIds,
		selectedOrgUnitIds: orgUnitIds,
		defaultViewOrgUnitIds: defaultView ? [1, 2] : null,
		isDefaultView: defaultView
	};
	return new Promise(resolve => setTimeout(() => resolve(demoData), 100));
}

/**
 * @returns {{Identifier: string, DisplayName: string, Code: string|null}[]}
 */
export async function fetchRoles() {
	const demoData = [
		{ Identifier: '500', DisplayName: 'Administrator' },
		{ Identifier: '600', DisplayName: 'Instructor' },
		{ Identifier: '700', DisplayName: 'Student' },

		{ Identifier: '578', DisplayName: 'End User' },
		{ Identifier: '579', DisplayName: 'Resource Creator' },
		{ Identifier: '581', DisplayName: 'Blank Role' },
		{ Identifier: '582', DisplayName: 'Blank Role 2' },
		{ Identifier: '583', DisplayName: 'Admin (co)' },
		{ Identifier: '590', DisplayName: 'LR Admin' },
		{ Identifier: '591', DisplayName: 'LR Power User' },
		{ Identifier: '592', DisplayName: 'LR Contributor' },
		{ Identifier: '593', DisplayName: 'LR User' },
		{ Identifier: '594', DisplayName: 'LR Guest' },
		{ Identifier: '597', DisplayName: 'D2LMonitor' },
		{ Identifier: '952', DisplayName: 'SIS Integration' },
		{ Identifier: '953', DisplayName: 'AllSection AllGroup' },
		{ Identifier: '954', DisplayName: 'AllSection NoGroup' },
		{ Identifier: '955', DisplayName: 'NoSection AllGroup' },
		{ Identifier: '956', DisplayName: 'NoSection NoGroup' },
		{ Identifier: '9000', DisplayName: 'LYNC_TEST_PERSONAL' },
		{ Identifier: '11590', DisplayName: 'IPSCT_Student' },
		{ Identifier: '11591', DisplayName: 'IPSCT_Admin' },
		{ Identifier: '11598', DisplayName: 'IPSCT_Manage' },
		{ Identifier: '11599', DisplayName: 'IPSCT_Security' }
	];

	return new Promise(resolve =>	setTimeout(() => resolve(demoData), 100));
}

/**
 * @param pageSize
 * @param {string|null} bookmark - can be null
 * @param {string|null} search - can be null
 * @returns {{PagingInfo:{Bookmark: string, HasMoreItems: boolean}, Items: {orgUnitId: number, orgUnitName: string}[]}}
 */
export async function fetchSemesters(pageSize, bookmark, search) {
	const response = {
		PagingInfo: {
			Bookmark: '0',
			HasMoreItems: false
		},
		Items: [
			{
				orgUnitId: 4,
				orgUnitName: 'Semester 1'
			},
			{
				orgUnitId: 10,
				orgUnitName: 'Semester 2'
			},
			{
				orgUnitId: 10007,
				orgUnitName: 'IPSIS Semester New'
			},
			{
				orgUnitId: 121194,
				orgUnitName: 'Fall Test Semester'
			},
			{
				orgUnitId: 120127,
				orgUnitName: 'IPSIS Test Semester 1'
			},
			{
				orgUnitId: 120126,
				orgUnitName: 'IPSIS Test Semester 12'
			},
			{
				orgUnitId: 120125,
				orgUnitName: 'IPSIS Test Semester 123'
			},
			{
				orgUnitId: 120124,
				orgUnitName: 'IPSIS Test Semester 4'
			},
			{
				orgUnitId: 1201240,
				orgUnitName: 'IPSIS Test Semester 42'
			}
		]
	};

	response.Items = response.Items.map((item, index) => Object.assign(item, { index }));

	const index = parseInt(bookmark || '-1');
	response.Items = response.Items.slice(index + 1);

	if (search) {
		response.Items = response.Items
			.filter(item => item.orgUnitName.toLowerCase().includes(search.toLowerCase()));
	}
	response.PagingInfo.HasMoreItems = response.Items.length > pageSize;
	response.Items = response.Items.slice(0, pageSize);
	response.PagingInfo.Bookmark = response.Items[response.Items.length - 1].index.toString();

	return new Promise(resolve =>	setTimeout(() => resolve(response), 100));
}

