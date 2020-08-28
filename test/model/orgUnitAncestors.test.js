import { expect } from '@open-wc/testing';
import OrgUnitAncestors from '../../model/orgUnitAncestors';

const mockOuTypes = {
	organization: 0,
	department: 1,
	course: 2,
	courseOffering: 3,
	semester: 5
};

/**
 * @param {Set} setA
 * @param {Set} setB
 * @returns {boolean}
 */
function setsAreEqual(setA, setB) {
	if (setA.size !== setB.size) {
		return false;
	}

	setA.forEach(item => {
		if (!setB.has(item)) {
			return false;
		}
	});
	return true;
}

describe('orgUnitAncestors', () => {
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

	const sut = new OrgUnitAncestors(serverData);

	describe('constructor / getAncestorsFor', () => {
		it('builds the ancestors map correctly', () => {
			const expectedAncestorsMap = {
				6606: [6606],
				1001: [1001, 6606],
				1002: [1002, 6606],
				1003: [1003, 6606],
				1: [1, 1001, 6606],
				2: [2, 1001, 6606],
				3: [3, 1001, 1002, 6606],
				4: [4, 1003, 6606],
				11: [11, 6606],
				12: [12, 6606],
				13: [13, 6606],
				111: [111, 1, 11, 1001, 6606],
				112: [112, 1, 12, 1001, 6606],
				211: [211, 2, 11, 1001, 6606],
				312: [312, 3, 12, 1001, 1002, 6606]
			};

			Object.keys(expectedAncestorsMap).forEach((orgUnit) => {
				const expectedAncestors = new Set(expectedAncestorsMap[orgUnit]);
				const actualAncestors = sut.getAncestorsFor(Number(orgUnit));
				expect(setsAreEqual(actualAncestors, expectedAncestors)).to.be.true;
			});
		});

		it('returns undefined if an orgUnit was not in the map', () => {
			expect(sut.getAncestorsFor(12345)).to.be.undefined;
		});
	});

	describe('hasAncestorsInList', () => {
		it('returns false if passed in orgUnit is not in the ancestors list', () => {
			expect(sut.hasAncestorsInList(12345, [6606])).to.be.false;
		});

		it('returns false if orgUnit is not in the list to check', () => {
			expect(sut.hasAncestorsInList(1001, [1002, 1003])).to.be.false;
		});

		it('returns false if orgUnit has no ancestors in the list to check', () => {
			expect(sut.hasAncestorsInList(1, [1002, 1003])).to.be.false;
		});

		it('returns true if orgUnit is in the list to check', () => {
			expect(sut.hasAncestorsInList(1001, [1001, 1002])).to.be.true;
		});

		it('returns true if orgUnit has ancestors in the list to check', () => {
			expect(sut.hasAncestorsInList(1, [1001, 1002])).to.be.true;
		});
	});
});
