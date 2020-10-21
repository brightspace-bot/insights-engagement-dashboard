import { expect } from '@open-wc/testing';
import { FilteredData } from '../../model/filteredData.js';
import { records } from './mocks';

class TestFilter {
	constructor(id, filter) {
		this.isApplied = false;
		this.id = id;
		this._filter = filter;
	}

	filter(record) {
		return this._filter(record);
	}
}

function sortById(a, b) {
	return a[0] - b[0];
}

describe('FilteredData', () => {
	const serverData = {
		records,
		userDictionary: new Map([
			[100, [100, 'John', 'Lennon', 'jlennon',  Date.now() - 2000000000]],
			[200, [200, 'Paul', 'McCartney', 'pmccartney', null]],
			[300, [300, 'George', 'Harrison', 'gharrison', Date.now()]],
			[400, [400, 'Ringo', 'Starr', 'rstarr', Date.now()]]
		]),
		isLoading: true
	};

	let sut;
	beforeEach(() => {
		sut = new FilteredData(serverData)
			.filter(new TestFilter('f1', r => r[4] > 0))
			.filter(new TestFilter('f2', r => r[0] < 10))
			.filter(new TestFilter('f3', r => r[1] === 200));
	});

	describe('excluding', () => {
		it('should return a FilteredData without the specified filter', () => {
			const actual = sut.excluding('f2');
			expect(actual.getFilter('f2')).to.be.undefined;
			expect(actual.filters.map(f => f.id)).to.deep.equal(['f1', 'f3']);
		});
	});

	describe('get records', () => {
		it('should return all records when no filters are applied', () => {
			expect(sut.records).to.deep.equal(serverData.records);
		});

		it('should return all records when filters are cleared', () => {
			sut.getFilter('f1').isApplied = true;
			sut.getFilter('f2').isApplied = true;
			sut.clearFilters();
			expect(sut.records).to.deep.equal(serverData.records);
		});

		it('should return filtered records if a filter is applied', () => {
			sut.getFilter('f1').isApplied = true;
			const expectedRecords = serverData.records.filter(record => record[4] > 0);

			expect(sut.records).to.deep.equal(expectedRecords);
		});

		it('should return filtered records if multiple filters are applied', () => {
			sut.getFilter('f1').isApplied = true;
			sut.getFilter('f2').isApplied = true;
			const expectedRecords = serverData.records.filter(record => record[4] > 0 && record[0] < 10);

			expect(sut.records).to.deep.equal(expectedRecords);
		});
	});

	describe('get recordsByUser', () => {
		it('should return all records when no filters are applied', () => {
			expect(sut.recordsByUser.get(100)).to.deep.equal(serverData.records.filter(r => r[1] === 100));
		});

		it('should return filtered records if a filter is applied', () => {
			sut.getFilter('f1').isApplied = true;
			const expectedRecords = serverData.records.filter(record => record[4] > 0 && record[1] === 200);

			expect(sut.recordsByUser.get(200)).to.deep.equal(expectedRecords);
		});
	});

	describe('get users', () => {
		it('should return all users if no filters are applied', () => {
			expect(sut.users.sort(sortById)).to.deep.equal([...serverData.userDictionary.values()].sort(sortById));
		});

		it('should return filtered users when a filter is applied', () => {
			sut.getFilter('f3').isApplied = true;
			const expectedUsers = [[200, 'Paul', 'McCartney', 'pmccartney', null]];

			expect(sut.users.sort(sortById)).to.deep.equal(expectedUsers);
		});
	});
});
