import { Data } from '../../model/data.js';
import { expect } from '@open-wc/testing';

describe('Data', () => {
	const recordProvider = async() => {
		return new Promise((resolve) => {
			resolve({
				users: [
					[100, 'John', 'Lennon'],
					[200, 'Paul', 'McCartney'],
					[300, 'George', 'Harrison'],
					[400, 'Ringo', 'Starr']
				],
				records: [[1, 101, 1, 10], [1, 102, 1, 20], [2, 102, 1, 20], [1, 103, 1, 0]]
			});
		});
	};

	const filters = [];

	describe('userDataForDisplay', () => {
		it('should return a sorted array of lastFirstName', async() => {
			const expected = [
				['Harrison, George'],
				['Lennon, John'],
				['McCartney, Paul'],
				['Starr, Ringo']
			];

			const sut = new Data({ recordProvider, filters });
			await new Promise(resolve => setTimeout(resolve, 0)); // allow recordProvider to resolve
			expect(sut.userDataForDisplay).to.deep.equal(expected);
		});
	});

	describe('overdueAssignments', () => {
		it('should return a number of users with overdue assignments', async() => {
			const expected = 2;

			const sut = new Data({ recordProvider, filters });
			await new Promise(resolve => setTimeout(resolve, 0)); // allow recordProvider to resolve
			expect(sut.usersNumWithOverdueAssignments).to.deep.equal(expected);
		});
	});
});
