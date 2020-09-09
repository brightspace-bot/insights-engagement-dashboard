import { OrgUnitSelectorFilter, RoleSelectorFilter, SemesterSelectorFilter } from '../../model/selectorFilters';
import { Data } from '../../model/data.js';
import { expect } from '@open-wc/testing';
import sinon from 'sinon/pkg/sinon-esm.js';

const mockOuTypes = {
	organization: 0,
	department: 1,
	course: 2,
	courseOffering: 3,
	semester: 5
};

const mockRoleIds = {
	admin: 100,
	instructor: 200,
	student: 300
};

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
		records: [
			[6606, 100, mockRoleIds.student, 0, 22, 2000], // this user has a cascading admin role on dept and sem levels
			[6606, 200, mockRoleIds.student, 0, 33, 2500],
			[6606, 300, mockRoleIds.student, 0, 44, 4000],
			[6606, 400, mockRoleIds.student, 0, 55, 4500], // this user has a cascading admin role on dept and sem levels

			// semesters
			[11, 100, mockRoleIds.admin, 0, null, 0],
			[12, 100, mockRoleIds.admin, 0, null, 0],
			[13, 100, mockRoleIds.admin, 0, null, 0],

			[11, 200, mockRoleIds.student, 0, 33, 0],
			[12, 200, mockRoleIds.instructor, 0, null, 0],

			[11, 300, mockRoleIds.student, 0, 100, 0],
			[12, 300, mockRoleIds.student, 0, 100, 0],
			[13, 300, mockRoleIds.student, 0, 100, 0],

			[11, 400, mockRoleIds.admin, 0, null, 0],
			[12, 400, mockRoleIds.admin, 0, null, 0],
			[13, 400, mockRoleIds.admin, 0, null, 0],

			// dept 1
			[1001, 100, mockRoleIds.admin, 0, null, 0],
			[1001, 200, mockRoleIds.student, 0, 73, 0],
			[1001, 300, mockRoleIds.student, 0, 73, 0],
			// courses
			[1, 100, mockRoleIds.admin, 0, null, 0],
			[1, 200, mockRoleIds.instructor, 0, null, 0],
			[1, 300, mockRoleIds.student, 1, 41, 3500],
			[2, 100, mockRoleIds.admin, 0, null, 0],
			[2, 200, mockRoleIds.student, 0, 55, 5000],
			[2, 300, mockRoleIds.student, 0, 39, 3000],
			// course 1 offerings
			[111, 100, mockRoleIds.admin, 0, null, 0],
			[111, 200, mockRoleIds.student, 1, 93, 7000],
			[112, 100, mockRoleIds.admin, 0, null, 0],
			[112, 200, mockRoleIds.instructor, 0, null, 0], // this person was promoted from student to instructor
			[113, 100, mockRoleIds.admin, 0, null, 0],
			[113, 300, mockRoleIds.student, 0, 75, 6000],
			// course 2 offerings
			[212, 100, mockRoleIds.admin, 0, null, 0],
			[212, 200, mockRoleIds.student, 0, 84, 4000],
			[212, 300, mockRoleIds.instructor, 0, null, 0],

			// dept 2
			[1002, 200, mockRoleIds.student, 0, 98, 0],
			[1002, 300, mockRoleIds.student, 0, 89, 0],
			[1002, 400, mockRoleIds.admin, 0, null, 0],
			[3, 200, mockRoleIds.student, 0, 98, 0],
			[3, 300, mockRoleIds.student, 0, 88, 0],
			[3, 400, mockRoleIds.admin, 0, null, 0],
			[311, 200, mockRoleIds.student, 0, 99, 0],
			[311, 300, mockRoleIds.student, 0, 42, 0],
			[311, 400, mockRoleIds.admin, 0, null, 0],
			[313, 300, mockRoleIds.student, 0, 66, 0],
			[313, 400, mockRoleIds.admin, 0, null, 0],
			[6606, 100, mockRoleIds.student, 0, null, 0], // this user has a cascading admin role on dept and sem levels
			[6606, 200, mockRoleIds.student, 0, null, 0],
			[6606, 300, mockRoleIds.student, 0, null, 0],
			[6606, 400, mockRoleIds.student, 0, null, 0], // this user has a cascading admin role on dept and sem levels
		],
		users: [
			[100, 'John', 'Lennon'],
			[200, 'Paul', 'McCartney'],
			[300, 'George', 'Harrison'],
			[400, 'Ringo', 'Starr']
		],
		selectedRolesIds: null,
		selectedSemestersIds: null,
		selectedOrgUnitIds: null,
		isRecordsTruncated: false,
		isOrgUnitsTruncated: false
	};

	const recordProvider = async({ roleIds = null, semesterIds = null, orgUnitIds = null }) => {
		return new Promise((resolve) => {
			resolve({
				...serverData,
				selectedRolesIds: roleIds,
				selectedSemestersIds: semesterIds,
				selectedOrgUnitIds: orgUnitIds
			});
		});
	};

	const cardFilters = [];
	let sut;
	beforeEach(async() => {
		sut = new Data({ recordProvider, cardFilters });
		await new Promise(resolve => setTimeout(resolve, 0)); // allow recordProvider to resolve
	});

	describe('applyRoleFilter', () => {
		it('should cause a reload from server if filter says it should reload', () => {
			const recordProvider = sinon.stub().resolves(serverData);
			sut.recordProvider = recordProvider;

			// set isRecordsTruncated to true to force a reload
			sut._selectorFilters.role = new RoleSelectorFilter({ selectedRolesIds: null, isRecordsTruncated: true });
			sut.applyRoleFilters([mockRoleIds.student]);

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
			sut.applyRoleFilters([mockRoleIds.student]);

			sinon.assert.notCalled(recordProvider);
		});
	});

	describe('applySemesterFilter', () => {
		it('should cause a reload from server if filter says it should reload', () => {
			const recordProvider = sinon.stub().resolves(serverData);
			sut.recordProvider = recordProvider;

			// set isRecordsTruncated to true to force a reload
			sut._selectorFilters.semester = new SemesterSelectorFilter({
				selectedSemestersIds: null,
				isRecordsTruncated: true
			}, null);
			sut.applySemesterFilters([11]);

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
			sut.applySemesterFilters([mockRoleIds.student]);

			sinon.assert.notCalled(recordProvider);
		});
	});

	describe('applyOrgUnitFilter', () => {
		it('should cause a reload from server if filter says it should reload', () => {
			const recordProvider = sinon.stub().resolves(serverData);
			sut.recordProvider = recordProvider;

			// set isRecordsTruncated to true to force a reload
			sut._selectorFilters.orgUnit = new OrgUnitSelectorFilter({
				selectedOrgUnitIds: null,
				isRecordsTruncated: true
			}, null);
			sut.applyOrgUnitFilters([1001]);

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
			sut.applyOrgUnitFilters([1001]);

			sinon.assert.notCalled(recordProvider);
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

			sut.applyOrgUnitFilters(orgUnitFilters);

			expect(sut.records).to.deep.equal(expectedRecords);
		});

		it('should return filtered records when semester filter is applied', async() => {
			const semesterFilters = [12];
			const expectedRecords = serverData.records.filter(record => {
				const recordOrgUnitId = record[0];
				return [12, 112, 212].includes(recordOrgUnitId);
			});

			sut.applySemesterFilters(semesterFilters);

			expect(sut.records).to.deep.equal(expectedRecords);
		});

		it('should return filtered records when role filter is applied', async() => {
			const roleFilters = [mockRoleIds.instructor];
			const expectedRecords = serverData.records.filter(record => {
				return roleFilters.includes(record[2]);
			});

			sut.applyRoleFilters(roleFilters);

			expect(sut.records).to.deep.equal(expectedRecords);
		});

		it('should return filtered records when all filters are applied', async() => {
			const orgUnitFilters = [1002, 2, 113];
			const semesterFilters = [12];
			const roleFilters = [mockRoleIds.instructor];
			const expectedRecords = serverData.records.filter(record =>
				record[0] === 212 && record[1] === 300
			);

			sut.applyOrgUnitFilters(orgUnitFilters);
			sut.applySemesterFilters(semesterFilters);
			sut.applyRoleFilters(roleFilters);

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

			sut.applyOrgUnitFilters(orgUnitFilters);

			expect(sut.users).to.deep.equal(expectedUsers);
		});

		it('should return filtered users when semester filter is applied', async() => {
			const semesterFilters = [13];
			const expectedUsers = serverData.users.filter(user => {
				const userId = user[0];
				return [100, 300, 400].includes(userId);
			});

			sut.applySemesterFilters(semesterFilters);

			expect(sut.users).to.deep.equal(expectedUsers);
		});

		it('should return filtered users when role filter is applied', async() => {
			const roleFilters = [mockRoleIds.admin];
			const expectedUsers = serverData.users.filter(user => {
				const userId = user[0];
				return [100, 400].includes(userId);
			});

			sut.applyRoleFilters(roleFilters);

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

			sut.applyOrgUnitFilters(orgUnitFilters);
			sut.applySemesterFilters(semesterFilters);
			sut.applyRoleFilters(roleFilters);

			expect(sut.users).to.deep.equal(expectedUsers);
		});
	});

	describe('userDataForDisplay', () => {
		it('should return a sorted array of lastFirstName', async() => {
			const expected = [
				['Harrison, George'],
				['Lennon, John'],
				['McCartney, Paul'],
				['Starr, Ringo']
			];

			expect(sut.userDataForDisplay).to.deep.equal(expected);
		});

		it('should only display users in view', async() => {
			const roleFilters = [mockRoleIds.instructor];
			const expectedUsers = [
				['Harrison, George'],
				['McCartney, Paul']
			];

			sut.applyRoleFilters(roleFilters);

			expect(sut.userDataForDisplay).to.deep.equal(expectedUsers);
		});
	});

	describe('currentFinalGrades', () => {
		it('should return the current final grades for users', async() => {
			const expected = [20, 30, 40, 50, 30, 100, 100, 100, 70, 70, 40, 50, 30, 90, 70, 80, 90, 80, 90, 80, 90, 40, 60];
			expect(sut.currentFinalGrades.toString()).to.deep.equal(expected.toString());
		});
	});

	describe('currentFinalGradesVsTimeInContent', () => {
		it('should return the array of tuples: current final grade vs time in content, mins', async() => {
			const expected = [[33, 22], [41, 33], [66, 44], [75, 55], [0, 33], [0, 100], [0, 100], [0, 100], [0, 73], [0, 73], [58, 41], [83, 55], [50, 39], [116, 93], [100, 75], [66, 84], [0, 98], [0, 89], [0, 98], [0, 88], [0, 99], [0, 42], [0, 66]];
			expect(sut.currentFinalGradesVsTimeInContent).to.deep.equal(expected);
		});
	});

	describe('overdueAssignments', () => {
		it('should return a number of users with overdue assignments', async() => {
			const expected = 2;
			expect(sut.usersCountsWithOverdueAssignments).to.deep.equal(expected);
		});
	});

	describe('avgTimeInContent', () => {
		it('should return a average time in content', async() => {
			const expected = 29;
			expect(sut.avgTimeInContent).to.deep.equal(expected);
		});
	});

	describe('avgGrade', () => {
		it('should return a average current grade', async() => {
			const expected = 69;
			expect(sut.avgGrade).to.deep.equal(expected);
		});
	});
});
