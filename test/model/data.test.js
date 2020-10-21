import { mockOuTypes, mockRoleIds, records } from './mocks';
import { OrgUnitSelectorFilter, RoleSelectorFilter, SemesterSelectorFilter } from '../../model/selectorFilters';
import { Data } from '../../model/data.js';
import { expect } from '@open-wc/testing';
import sinon from 'sinon/pkg/sinon-esm.js';

describe('Data', () => {
	const serverData = {
		orgUnits: [
			[6606, 'root', mockOuTypes.organization, [0]],
			[1001, 'Dept 1', mockOuTypes.department, [6606]],
			[1002, 'Dept 2', mockOuTypes.department, [6606]],
			[1, 'Course 1', mockOuTypes.course, [1001]],
			[2, 'Course 2', mockOuTypes.course, [1001]],
			[3, 'Course 3', mockOuTypes.course, [1002]],
			[11, 'Semester 1', mockOuTypes.semester, [6606]],
			[12, 'Semester 2', mockOuTypes.semester, [6606]],
			[13, 'Semester 3', mockOuTypes.semester, [6606]],
			[111, 'Course 1 / Semester 1', mockOuTypes.courseOffering, [1, 11]],
			[112, 'Course 1 / Semester 2', mockOuTypes.courseOffering, [1, 12]],
			[113, 'Course 1 / Semester 3', mockOuTypes.courseOffering, [1, 13]],
			[212, 'Course 2 / Semester 2', mockOuTypes.courseOffering, [2, 12]],
			[311, 'Course 3 / Semester 1', mockOuTypes.courseOffering, [3, 11]],
			[313, 'Course 3 / Semester 3', mockOuTypes.courseOffering, [3, 13]]
		],
		records,
		users: [
			[100, 'John', 'Lennon', 'jlennon',  Date.now() - 2000000000],
			[200, 'Paul', 'McCartney', 'pmccartney', null],
			[300, 'George', 'Harrison', 'gharrison', Date.now()],
			[400, 'Ringo', 'Starr', 'rstarr', Date.now()]
		],
		selectedRolesIds: null,
		selectedSemestersIds: null,
		selectedOrgUnitIds: null,
		isDefaultView: false,
		isRecordsTruncated: false,
		isOrgUnitsTruncated: false
	};

	const TRUNCATE_IF_THIS_ROLE_IS_PRESENT = 999999;
	const recordProvider = async({ roleIds = null, semesterIds = null, orgUnitIds = null, defaultView = false }) => ({
		...serverData,
		semesterTypeId: mockOuTypes.semester,
		selectedRolesIds: roleIds,
		selectedSemestersIds: semesterIds,
		selectedOrgUnitIds: orgUnitIds,
		defaultView,
		isOrgUnitsTruncated: roleIds.includes(TRUNCATE_IF_THIS_ROLE_IS_PRESENT)
	});

	const cardFilters = [];
	let sut;
	beforeEach(async() => {
		sut = new Data({ recordProvider, cardFilters });
		await new Promise(resolve => setTimeout(resolve, 0)); // allow recordProvider to resolve
	});

	describe('reload from server', () => {
		it('maintains ou tree open state', async() => {
			const oldTree = sut.orgUnitTree;
			sut.orgUnitTree.setOpen(1001, true);
			sut.orgUnitTree.setOpen(1, true);

			// trigger a reload and allow recordProvider to resolve
			sut._selectorFilters.role = new RoleSelectorFilter({ selectedRolesIds: null, isRecordsTruncated: true });
			sut.selectedRoleIds = [mockRoleIds.student];
			await new Promise(resolve => setTimeout(resolve, 0));

			expect(sut.orgUnitTree).to.not.equal(oldTree); // make sure the the data was loaded
			expect(sut.orgUnitTree.open.sort()).to.deep.equal([1, 1001]);
			expect(sut.orgUnitTree.isPopulated(6606)).to.be.true;
		});

		it('marks the org unit tree as dynamic if the server truncated it', async() => {
			// trigger a truncated reload and allow recordProvider to resolve
			sut._selectorFilters.role = new RoleSelectorFilter({ selectedRolesIds: null, isRecordsTruncated: true });
			sut.selectedRoleIds = [mockRoleIds.student, TRUNCATE_IF_THIS_ROLE_IS_PRESENT];
			await new Promise(resolve => setTimeout(resolve, 0));

			expect(sut.orgUnitTree.isPopulated(6606)).to.be.false;
		});
	});

	describe('set selectedRoleIds', () => {
		it('should cause a reload from server if filter says it should reload', () => {
			const recordProvider = sinon.stub().resolves(serverData);
			sut.recordProvider = recordProvider;

			// set isRecordsTruncated to true to force a reload
			sut._selectorFilters.role = new RoleSelectorFilter({ selectedRolesIds: null, isRecordsTruncated: true });
			sut.selectedRoleIds = [mockRoleIds.student];

			sinon.assert.calledWithMatch(recordProvider, sinon.match({
				roleIds: [mockRoleIds.student],
				semesterIds: [],
				orgUnitIds: []
			}));
		});

		it('should not cause a reload from server if filter says it should not reload', () => {
			const recordProvider = sinon.stub().resolves(serverData);
			sut.recordProvider = recordProvider;

			// set isRecordsTruncated to false and selectedRolesIds to null to force no reload
			sut._selectorFilters.role = new RoleSelectorFilter({ selectedRolesIds: null, isRecordsTruncated: false });
			sut.selectedRoleIds = [mockRoleIds.student];

			sinon.assert.notCalled(recordProvider);
		});
	});

	describe('set selectedSemesterIds', () => {
		it('should cause a reload from server if filter says it should reload', () => {
			const recordProvider = sinon.stub().resolves(serverData);
			sut.recordProvider = recordProvider;

			// set isRecordsTruncated to true to force a reload
			sut._selectorFilters.semester = new SemesterSelectorFilter({
				selectedSemestersIds: null,
				isRecordsTruncated: true
			}, null);
			sut.selectedSemesterIds = [11];

			sinon.assert.calledWithMatch(recordProvider, sinon.match({
				roleIds: [],
				semesterIds: [11],
				orgUnitIds: []
			}));
		});

		it('should not cause a reload from server if filter says it should not reload', () => {
			const recordProvider = sinon.stub().resolves(serverData);
			sut.recordProvider = recordProvider;

			// set isRecordsTruncated to false and selectedRolesIds to null to force no reload
			sut._selectorFilters.semester = new SemesterSelectorFilter({
				selectedSemestersIds: null,
				isRecordsTruncated: false
			}, null);
			sut.selectedSemesterIds = [mockRoleIds.student];

			sinon.assert.notCalled(recordProvider);
		});
	});

	describe('set selectedOrgUnits', () => {
		it('should cause a reload from server if filter says it should reload', () => {
			const recordProvider = sinon.stub().resolves(serverData);
			sut.recordProvider = recordProvider;

			// set isRecordsTruncated to true to force a reload
			sut._selectorFilters.orgUnit = new OrgUnitSelectorFilter({
				selectedOrgUnitIds: null,
				isRecordsTruncated: true
			}, null);
			sut.selectedOrgUnitIds = [1001];

			sinon.assert.calledWithMatch(recordProvider, sinon.match({
				roleIds: [],
				semesterIds: [],
				orgUnitIds: [1001]
			}));
		});

		it('should not cause a reload from server if filter says it should not reload', () => {
			const recordProvider = sinon.stub().resolves(serverData);
			sut.recordProvider = recordProvider;

			// set isRecordsTruncated to false and selectedRolesIds to null to force no reload
			sut._selectorFilters.orgUnit = new OrgUnitSelectorFilter({
				selectedSemestersIds: null,
				isRecordsTruncated: false
			}, null);
			sut.selectedOrgUnitIds = [1001];

			sinon.assert.notCalled(recordProvider);
		});
	});

	describe('get defaultViewPopupDisplayData', () => {
		const getRecordProvider = ({ defaultViewOrgUnitIds = null, selectedOrgUnitIds = null, isDefaultView = false }) => {
			return async() => ({
				orgUnits: [
					[1, 'Course 1', mockOuTypes.course, [0]],
					[2, 'Course 2', mockOuTypes.course, [0]],
					[3, 'Course 3', mockOuTypes.course, [0]]
				],
				users: [],
				defaultViewOrgUnitIds,
				selectedOrgUnitIds,
				isDefaultView
			});
		};

		it('should return an empty array if isDefaultView is false', async() => {
			sut.recordProvider = getRecordProvider({ defaultViewOrgUnitIds: [1], selectedOrgUnitIds: [2] });
			sut.loadData({});
			await new Promise(resolve => setTimeout(resolve, 0)); // allow recordProvider to resolve

			expect(sut.defaultViewPopupDisplayData).to.deep.equal([]);
		});

		it('should return defaultViewOrgUnitIds and names if isDefaultView is true', async() => {
			sut.recordProvider = getRecordProvider({
				defaultViewOrgUnitIds: [1, 3],
				selectedOrgUnitIds: [2],
				isDefaultView: true
			});
			sut.loadData({});
			await new Promise(resolve => setTimeout(resolve, 0)); // allow recordProvider to resolve

			expect(sut.defaultViewPopupDisplayData).to.deep.equal([{ id: 1, name: 'Course 1' }, { id: 3, name: 'Course 3' }]);
		});

		it('should return selectedOrgUnitIds and names if isDefaultView is true and defaultViewOrgUnitIds is null', async() => {
			sut.recordProvider = getRecordProvider({ selectedOrgUnitIds: [2], isDefaultView: true });
			sut.loadData({});
			await new Promise(resolve => setTimeout(resolve, 0)); // allow recordProvider to resolve

			expect(sut.defaultViewPopupDisplayData).to.deep.equal([{ id: 2, name: 'Course 2' }]);
		});

		it('should return an empty array if isDefaultView is true but there are no ids to show', async() => {
			sut.recordProvider = getRecordProvider({ isDefaultView: true });
			sut.loadData({});
			await new Promise(resolve => setTimeout(resolve, 0)); // allow recordProvider to resolve

			expect(sut.defaultViewPopupDisplayData).to.deep.equal([]);
		});
	});

	describe('get records', () => {
		it('should return all records when no filters are applied', async() => {
			expect(sut.records).to.deep.equal(serverData.records);
		});

		it('should return filtered records when OU filter is applied', async() => {
			const orgUnitFilters = [1002, 2, 113];
			const expectedRecords = serverData.records.filter(record => {
				const recordOrgUnitId = record[0];
				return [1002, 3, 311, 313, 2, 212, 113].includes(recordOrgUnitId);
			});

			orgUnitFilters.forEach(x => sut.orgUnitTree.setSelected(x, true));

			expect(sut.records).to.deep.equal(expectedRecords);
		});

		it('should return filtered records when semester filter is applied', async() => {
			const semesterFilters = [12];
			const expectedRecords = serverData.records.filter(record => {
				const recordOrgUnitId = record[0];
				return [12, 112, 212].includes(recordOrgUnitId);
			});

			sut.selectedSemesterIds = semesterFilters;

			expect(sut.records).to.deep.equal(expectedRecords);
		});

		it('should return filtered records when role filter is applied', async() => {
			const roleFilters = [mockRoleIds.instructor];
			const expectedRecords = serverData.records.filter(record => {
				return roleFilters.includes(record[2]);
			});

			sut.selectedRoleIds = roleFilters;

			expect(sut.records).to.deep.equal(expectedRecords);
		});

		it('should return filtered records when all filters are applied', async() => {
			const orgUnitFilters = [1002, 2, 113];
			const semesterFilters = [12];
			const roleFilters = [mockRoleIds.instructor];
			const expectedRecords = serverData.records.filter(record =>
				record[0] === 212 && record[1] === 300
			);

			orgUnitFilters.forEach(x => sut.orgUnitTree.setSelected(x, true));
			sut.selectedSemesterIds = semesterFilters;
			sut.selectedRoleIds = roleFilters;

			expect(sut.records).to.deep.equal(expectedRecords);
		});
	});

	describe('get users', () => {
		it('should return all users if no filters are applied', async() => {
			expect(sut.users).to.deep.equal(serverData.users);
		});

		it('should return filtered users when OU filter is applied', async() => {
			const orgUnitFilters = [112, 113];
			const expectedUsers = serverData.users.filter(user => {
				const userId = user[0];
				return [100, 200, 300].includes(userId);
			});

			orgUnitFilters.forEach(x => sut.orgUnitTree.setSelected(x, true));

			expect(sut.users).to.deep.equal(expectedUsers);
		});

		it('should return filtered users when semester filter is applied', async() => {
			const semesterFilters = [13];
			const expectedUsers = serverData.users.filter(user => {
				const userId = user[0];
				return [100, 300, 400].includes(userId);
			});

			sut.selectedSemesterIds = semesterFilters;

			expect(sut.users).to.deep.equal(expectedUsers);
		});

		it('should return filtered users when role filter is applied', async() => {
			const roleFilters = [mockRoleIds.admin];
			const expectedUsers = serverData.users.filter(user => {
				const userId = user[0];
				return [100, 400].includes(userId);
			});

			sut.selectedRoleIds = roleFilters;

			expect(sut.users).to.deep.equal(expectedUsers);
		});

		it('should return filtered users when all filters are applied', async() => {
			const orgUnitFilters = [112, 113];
			const semesterFilters = [13];
			const roleFilters = [mockRoleIds.admin];
			const expectedUsers = serverData.users.filter(user => {
				const userId = user[0];
				return [100].includes(userId);
			});

			orgUnitFilters.forEach(x => sut.orgUnitTree.setSelected(x, true));
			sut.selectedSemesterIds = semesterFilters;
			sut.selectedRoleIds = roleFilters;

			expect(sut.users).to.deep.equal(expectedUsers);
		});
	});

	describe('tiCVsGrades', () => {
		it('should return the array of tuples: current final grade vs time in content, mins', async() => {
			const expected = [[33, 22], [41, 33], [66, 44], [75, 55], [0, 33], [0, 100], [0, 100], [0, 100], [0, 73], [0, 73], [58, 41], [83, 55], [50, 39], [116, 93], [100, 75], [66, 84], [0, 98], [0, 89], [0, 98], [0, 88], [0, 99], [0, 42], [0, 66]];
			expect(sut.tiCVsGrades).to.deep.equal(expected);
		});
	});

	describe('tiCVsGradesAvgValues', () => {
		it('should set and return a average time and grades', async() => {
			const expected = [29, 69];
			expect(sut.tiCVsGradesAvgValues).to.deep.equal(expected);
		});
	});
});
