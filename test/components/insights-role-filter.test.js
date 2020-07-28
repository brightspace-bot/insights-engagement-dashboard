import '../../components/insights-role-filter';

import {expect, fixture, html, oneEvent} from '@open-wc/testing';
import fetchMock from 'fetch-mock/esm/client';
import {rolesEndpoint} from '../../model/roles';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-role-filter', () => {
	beforeEach(() => {
		// load in some mock data
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
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-insights-role-filter></d2l-insights-role-filter>`);
			await new Promise(resolve => setTimeout(resolve, 1500));
			await expect(el).to.be.accessible();
		});
	});

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-role-filter');
		});
	});

	describe('render', () => {
		it('should create a simple filter using the correct role data', async() => {
			const expectedFilterData = [
				{ id: '1', displayName: 'Role1' },
				{ id: '2', displayName: 'Role2' },
				{ id: '3', displayName: 'Role3' }
			];
			const el = await fixture(html`<d2l-insights-role-filter></d2l-insights-role-filter>`);
			await new Promise(resolve => setTimeout(resolve, 500));

			expect(el.shadowRoot.querySelector('d2l-simple-filter').data).to.deep.equal(expectedFilterData);
		});
	});

	describe('item selection', () => {
		it('should update the role model when an item is de/selected', async() => {
			const el = await fixture(html`<d2l-insights-role-filter></d2l-insights-role-filter>`);
			await new Promise(resolve => setTimeout(resolve, 500));

			// everything should be deselected initially
			el.roles.roleData.forEach(role => {
				expect(role.selected).to.be.false;
			});

			const checkboxes = Array.from(
				el.shadowRoot.querySelector('d2l-simple-filter').shadowRoot.querySelectorAll('d2l-input-checkbox')
			);

			checkboxes.find(checkbox => checkbox.value === '2').simulateClick();
			checkboxes.find(checkbox => checkbox.value === '3').simulateClick();

			expect(el.roles.roleData.find(role => role.Identifier === '1').selected).to.be.false;
			expect(el.roles.roleData.find(role => role.Identifier === '2').selected).to.be.true;
			expect(el.roles.roleData.find(role => role.Identifier === '3').selected).to.be.true;

			checkboxes.find(checkbox => checkbox.value === '2').simulateClick();

			expect(el.roles.roleData.find(role => role.Identifier === '1').selected).to.be.false;
			expect(el.roles.roleData.find(role => role.Identifier === '2').selected).to.be.false;
			expect(el.roles.roleData.find(role => role.Identifier === '3').selected).to.be.true;
		});

		it('should fire a role-selections-updated event when an item is selected', async() => {
			const el = await fixture(html`<d2l-insights-role-filter></d2l-insights-role-filter>`);
			await new Promise(resolve => setTimeout(resolve, 500));

			const listener = oneEvent(el, 'role-selections-updated');

			const checkboxes = Array.from(
				el.shadowRoot.querySelector('d2l-simple-filter').shadowRoot.querySelectorAll('d2l-input-checkbox')
			);

			checkboxes.find(checkbox => checkbox.value === '1').simulateClick();

			const event = await listener; // if no event is fired, this will time out after 2 seconds
			expect(event.type).to.equal('role-selections-updated');
			expect(event.target).to.equal(el);
		});
	});
});
