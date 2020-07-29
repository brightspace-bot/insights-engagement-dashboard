import Roles from '../../model/roles';
import {expect} from '@open-wc/testing';
import fetchMock from 'fetch-mock/esm/client';

const rolesEndpoint = '/d2l/api/lp/1.23/roles/';

describe('roles', () => {
	let sut;

	beforeEach(async() => {
		fetchMock.reset();

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

		fetchMock.get(rolesEndpoint, mockLmsResponseData);
		sut = new Roles();
		await sut.fetchRolesFromLms();
	});

	describe('fetchRolesFromLMS', () => {
		it('should fetch roles from LMS, add a `selected` field, and sort them by name and id', async() => {
			fetchMock.reset();

			const mockLmsResponseData = [
				{
					Identifier: '4',
					DisplayName: 'ZZZRole',
					Code: null
				},
				{
					Identifier: '3',
					DisplayName: 'Role',
					Code: null
				},
				{
					Identifier: '2',
					DisplayName: 'Role',
					Code: null
				},
				{
					Identifier: '1',
					DisplayName: 'role', // localeCompare causes lowercase to come before uppercase
					Code: null
				}
			];

			fetchMock.get(rolesEndpoint, mockLmsResponseData);

			const sut = new Roles();
			await sut.fetchRolesFromLms();

			expect(sut._roleData.length).to.equal(4);
			sut._roleData.forEach((role, idx) => {
				// verify order
				expect(Number(role.Identifier)).to.equal(idx + 1);
				expect(role.selected).to.be.false;
			});
		});
	});

	describe('getRoleDataForFilter', () => {
		it('should return data in the correct format', () => {
			const expected = [
				{ id: '1', displayName: 'Role1' },
				{ id: '2', displayName: 'Role2' },
				{ id: '3', displayName: 'Role3' }
			];

			const actual = sut.getRoleDataForFilter();
			expect(actual).to.deep.equal(expected);
		});
	});

	describe('get/set selected', () => {
		it('should only return the selected role ids', () => {
			// nothing should be selected initially
			expect(sut.getSelectedRoleIds()).to.deep.equal([]);

			sut.setSelectedState('1', true);
			sut.setSelectedState('3', true);

			expect(sut.getSelectedRoleIds()).to.deep.equal(['1', '3']);

			sut.setSelectedState('2', true);
			sut.setSelectedState('3', false);

			expect(sut.getSelectedRoleIds()).to.deep.equal(['1', '2']);

			sut.setSelectedState('1', false);
			sut.setSelectedState('2', false);

			expect(sut.getSelectedRoleIds()).to.deep.equal([]);
		});
	});
});
