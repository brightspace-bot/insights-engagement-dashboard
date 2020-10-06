import { fetchCachedChildren, fetchRelevantChildren, fetchRoles } from '../../model/lms';
import { expect } from '@open-wc/testing';
import fetchMock from 'fetch-mock/esm/client';

const rolesEndpoint = '/d2l/api/ap/unstable/insights/data/roles';

describe('Lms', () => {
	afterEach(() => {
		fetchMock.reset();
	});

	describe('fetchRoles', () => {
		it('should fetch roles from LMS', async() => {
			const mockLmsResponseData = [
				{
					Identifier: '1',
					DisplayName: 'Role1',
					Code: null
				},
				{
					Identifier: '2',
					DisplayName: 'Role2',
					Code: null
				},
				{
					Identifier: '3',
					DisplayName: 'Role3',
					Code: null
				}
			];

			fetchMock.reset();
			fetchMock.get(rolesEndpoint, mockLmsResponseData);

			expect(await fetchRoles()).to.deep.equal(mockLmsResponseData);
		});
	});

	describe('fetchRelevantChildren', () => {
		it('should fetch children from the LMS without a semester filter', async() => {
			const mockLmsResponseData = {
				Items: [2, 4, 7, 8, 9] // not representative; just for matching
			};

			fetchMock.get('path:/d2l/api/ap/unstable/insights/data/orgunits/6612/children', mockLmsResponseData);

			expect(await fetchRelevantChildren(6612)).to.deep.equal(mockLmsResponseData.Items);
		});

		it('should fetch children from the LMS with a semester filter', async() => {
			const mockLmsResponseData = {
				Items: [2, 4, 7, 8, 9] // not representative; just for matching
			};

			fetchMock.get(
				'end:/d2l/api/ap/unstable/insights/data/orgunits/6612/children?selectedSemestersCsv=4%2C500%2C8',
				mockLmsResponseData
			);

			expect(await fetchRelevantChildren(6612, [4, 500, 8])).to.deep.equal(mockLmsResponseData.Items);
		});

		it('should cache by semester ids', async() => {
			const mockLmsResponseData1 = {
				Items: [2, 4, 7, 8, 9] // not representative; just for matching
			};
			const mockLmsResponseData2 = {
				Items: [10, 11, 100] // not representative; just for matching
			};

			fetchMock.get(
				'end:/d2l/api/ap/unstable/insights/data/orgunits/9619/children?selectedSemestersCsv=4%2C500%2C8',
				mockLmsResponseData1
			);
			await fetchRelevantChildren(9619, [4, 500, 8]);

			fetchMock.get(
				'end:/d2l/api/ap/unstable/insights/data/orgunits/6612/children?selectedSemestersCsv=4%2C500%2C8',
				mockLmsResponseData2
			);
			await fetchRelevantChildren(6612, [4, 500, 8]);

			expect([...fetchCachedChildren([4, 500, 8])]).to.deep.equal([
				[6612, mockLmsResponseData2.Items],
				[9619, mockLmsResponseData1.Items]
			]);
		});

		it('should treat null as empty array in cache key', async() => {
			const mockLmsResponseData = {
				Items: [2, 4, 7, 8, 9] // not representative; just for matching
			};

			fetchMock.get(
				'end:/d2l/api/ap/unstable/insights/data/orgunits/6612/children?selectedSemestersCsv=',
				mockLmsResponseData
			);

			await fetchRelevantChildren(6612, []);

			expect([...fetchCachedChildren(null)]).to.deep.equal([
				[6612, mockLmsResponseData.Items]
			]);
		});
	});
});
