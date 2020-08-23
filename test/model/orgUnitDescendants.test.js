import { expect } from '@open-wc/testing';
import OrgUnitDescendants from '../../model/orgUnitDescendants';

const mockOuTypes = {
	organization: 0,
	department: 1,
	course: 2,
	courseOffering: 3,
	semester: 5
};

describe('orgUnitDescendants', () => {
	const serverData = [
		[6606, 'Org', mockOuTypes.organization, [0]],
		[1001, 'Department 1', mockOuTypes.department, [6606]],
		[1002, 'Department 2', mockOuTypes.department, [6606]],
		[1003, 'Department 3', mockOuTypes.department, [6606]],

		[1, 'Course 1', mockOuTypes.course, [1001]],
		[2, 'Course 2', mockOuTypes.course, [1001]],
		[3, 'Course 3', mockOuTypes.course, [1001, 1002]], // part of 2 departments
		[4, 'Course 4', mockOuTypes.course, [1003]],

		[11, 'Semester 1', mockOuTypes.semester, [6606]],
		[12, 'Semester 2', mockOuTypes.semester, [6606]],
		[13, 'Semester 3', mockOuTypes.semester, [6606]],

		[111, 'Course 1 / Semester 1', mockOuTypes.semester, [1, 11]],
		[112, 'Course 1 / Semester 2', mockOuTypes.semester, [1, 12]],
		[211, 'Course 2 / Semester 1', mockOuTypes.semester, [2, 11]],
		[312, 'Course 3 / Semester 2', mockOuTypes.semester, [3, 12]]
	];

	const sut = new OrgUnitDescendants(serverData);

	describe('constructor', () => {
		it('builds the descendants tree correctly', () => {
			// each key should list only its immediate children
			const expectedChildren = {
				6606: [1001, 1002, 1003, 11, 12, 13],
				1001: [1, 2, 3],
				1002: [3],
				1003: [4],
				1: [111, 112],
				2: [211],
				3: [312],
				4: [],
				11: [111, 211],
				12: [112, 312],
				13: [],
				111: [],
				112: [],
				211: [],
				312: []
			};

			Object.keys(expectedChildren).forEach((orgUnit) => {
				const expectedDescendants = expectedChildren[orgUnit];
				const actualDescendants = [...sut.graph[orgUnit].children];
				expect(actualDescendants).to.deep.equal(expectedDescendants);
				expect(sut.graph[orgUnit].visited).to.be.false;
			});
		});
	});

	describe('getAllDescendantsFor', () => {
		it('gets all descendants for a given org unit', () => {
			const expectedFullDescendantsTree = {
				// it wouldn't actually make sense for someone to call this function with the root OU, but this first
				// test is here for the sake of completeness
				6606: [6606, 1001, 1, 111, 112, 2, 211, 3, 312, 1002, 1003, 4, 11, 12, 13],
				1001: [1001, 1, 111, 112, 2, 211, 3, 312],
				1002: [1002, 3, 312],
				1003: [1003, 4],
				1: [1, 111, 112],
				2: [2, 211],
				3: [3, 312],
				11: [11, 111, 211],
				12: [12, 112, 312],
				13: [13],
				111: [111],
				112: [112],
				211: [211],
				312: [312]
			};

			Object.keys(expectedFullDescendantsTree).forEach((orgUnit) => {
				const expectedDescendants = expectedFullDescendantsTree[orgUnit];
				const actualDescendants = sut.getAllDescendantsFor(Number(orgUnit));
				expect(actualDescendants).to.deep.equal(expectedDescendants);
			});
		});

		it('returns an array with only the arg if it is not in the OU graph', () => {
			expect(sut.getAllDescendantsFor(999999)).to.deep.equal([999999]);
		});
	});

	describe('getOrgIdsInView', () => {
		it('returns null if both input arrays are empty', () => {
			expect(sut.getOrgUnitIdsInView([], [])).to.be.null;
		});

		it('returns a set with all descendants for given orgUnits', () => {
			const orgUnitsToSearch = [1, 1002];
			const expectedDescendants = [1, 111, 112, 1002, 3, 312];
			expect([...sut.getOrgUnitIdsInView(orgUnitsToSearch, [])]).to.deep.equal(expectedDescendants);
		});

		it('returns a set with all descendants for given semesters', () => {
			const semestersToSearch = [11, 12];
			const expectedDescendants = [11, 111, 211, 12, 112, 312];
			expect([...sut.getOrgUnitIdsInView([], semestersToSearch)]).to.deep.equal(expectedDescendants);
		});

		it('returns a set that is the intersection of descendants for given orgUnits and semesters', () => {
			const orgUnitsToSearch = [1, 1002];
			const semestersToSearch = [11, 12];
			const expectedDescendants = [111, 112, 312];
			expect([...sut.getOrgUnitIdsInView(orgUnitsToSearch, semestersToSearch)]).to.deep.equal(expectedDescendants);
		});
	});
});
