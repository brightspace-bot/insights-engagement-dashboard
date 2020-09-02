import { Data } from '../../model/data.js';
import { expect } from '@open-wc/testing';

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
			[3, 200, mockRoleIds.student, 0, 98, 0, 0],
			[3, 300, mockRoleIds.student, 0, 88, 0, 0],
			[3, 400, mockRoleIds.admin, 0, null, 0, 0],
			[311, 200, mockRoleIds.student, 0, 99, 0, 0],
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
		]
	};

	const recordProvider = async() => {
		return new Promise((resolve) => {
			resolve(serverData);
		});
	};

	const cardFilters = [];
	let sut;
	beforeEach(async() => {
		sut = new Data({ recordProvider, cardFilters });
		await new Promise(resolve => setTimeout(resolve, 0)); // allow recordProvider to resolve
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

		it('should return filtered records when both filters are applied', async() => {
			const orgUnitFilters = [1002, 2, 113];
			const semesterFilters = [12];
			const expectedRecords = serverData.records.filter(record => {
				const recordOrgUnitId = record[0];
				return [212].includes(recordOrgUnitId);
			});

			sut.applyOrgUnitFilters(orgUnitFilters);
			sut.applySemesterFilters(semesterFilters);

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

		it('should return filtered users when both filters are applied', async() => {
			const orgUnitFilters = [112, 113];
			const semesterFilters = [13];
			const expectedUsers = serverData.users.filter(user => {
				const userId = user[0];
				return [100, 300].includes(userId);
			});

			sut.applyOrgUnitFilters(orgUnitFilters);
			sut.applySemesterFilters(semesterFilters);

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
	});

	describe('currentFinalGrades', () => {
		it('should return the current final grades for users', async() => {
			const expected = [20, 30, 40, 50, 30, 100, 100, 100, 70, 70, 40, 50, 30, 90, 70, 80, 90, 80, 90, 80, 90, 40, 60];
			expect(sut.currentFinalGrades.toString()).to.deep.equal(expected.toString());
		});
	});

	describe('currentFinalGradesVsTimeInContent', () => {
		it('should return the array of tuples: current final grade vs time in content, mins', async() => {
			const expected = [[22, 33], [33, 41], [44, 66], [55, 75], [41, 58], [55, 83], [39, 50], [93, 116], [75, 100], [84, 66]];
			expect(sut.currentFinalGradesVsTimeInContent).to.deep.equal(expected);
		});
	});

	describe('overdueAssignments', () => {
		it('should return a number of users with overdue assignments', async() => {
			const expected = 2;
			expect(sut.usersCountsWithOverdueAssignments).to.deep.equal(expected);
		});
	});
});
