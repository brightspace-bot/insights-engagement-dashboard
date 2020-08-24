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
			[6606, 100, mockRoleIds.student], // this user has a cascading admin role on dept and sem levels
			[6606, 200, mockRoleIds.student],
			[6606, 300, mockRoleIds.student],
			[6606, 400, mockRoleIds.student], // this user has a cascading admin role on dept and sem levels

			// semesters
			[11, 100, mockRoleIds.admin],
			[12, 100, mockRoleIds.admin],
			[13, 100, mockRoleIds.admin],

			[11, 200, mockRoleIds.student],
			[12, 200, mockRoleIds.instructor],

			[11, 300, mockRoleIds.student],
			[12, 300, mockRoleIds.student],
			[13, 300, mockRoleIds.student],

			[11, 400, mockRoleIds.admin],
			[12, 400, mockRoleIds.admin],
			[13, 400, mockRoleIds.admin],

			// dept 1
			[1001, 100, mockRoleIds.admin],
			[1001, 200, mockRoleIds.student],
			[1001, 300, mockRoleIds.student],
			// courses
			[1, 100, mockRoleIds.admin],
			[1, 200, mockRoleIds.instructor],
			[1, 300, mockRoleIds.student],
			[2, 100, mockRoleIds.admin],
			[2, 200, mockRoleIds.student],
			[2, 300, mockRoleIds.student],
			// course 1 offerings
			[111, 100, mockRoleIds.admin],
			[111, 200, mockRoleIds.student],
			[112, 100, mockRoleIds.admin],
			[112, 200, mockRoleIds.instructor], // this person was promoted from student to instructor
			[113, 100, mockRoleIds.admin],
			[113, 300, mockRoleIds.student],
			// course 2 offerings
			[212, 100, mockRoleIds.admin],
			[212, 200, mockRoleIds.student],
			[212, 300, mockRoleIds.instructor],

			// dept 2
			[1002, 200, mockRoleIds.student],
			[1002, 300, mockRoleIds.student],
			[1002, 400, mockRoleIds.admin],
			[3, 200, mockRoleIds.student],
			[3, 300, mockRoleIds.student],
			[3, 400, mockRoleIds.admin],
			[311, 200, mockRoleIds.student],
			[311, 300, mockRoleIds.student],
			[311, 400, mockRoleIds.admin],
			[313, 300, mockRoleIds.student],
			[313, 400, mockRoleIds.admin],
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
});
