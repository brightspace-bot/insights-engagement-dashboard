import {expect} from '@open-wc/testing';
import fetchMock from 'fetch-mock/esm/client';
import Lms from '../../model/lms';

const rolesEndpoint = '/d2l/api/lp/1.23/roles/';

describe('Lms', () => {
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

			const sut = new Lms();
			expect(await sut.fetchRoles()).to.deep.equal(mockLmsResponseData);
		});
	});

	after(() => {
		fetchMock.reset();
	});
});
