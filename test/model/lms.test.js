import { fetchRelevantChildren, fetchRoles } from '../../model/lms';
import { expect } from '@open-wc/testing';
import fetchMock from 'fetch-mock/esm/client';

const rolesEndpoint = '/d2l/api/lp/1.23/roles/';

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
	});
});
