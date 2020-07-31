import '../../components/insights-role-filter';

import {expect, fixture, html, oneEvent} from '@open-wc/testing';
import fetchMock from 'fetch-mock/esm/client';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

const rolesEndpoint = '/d2l/api/lp/1.23/roles/';

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
			await expect(el).to.be.accessible();
		});
	});

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-role-filter');
		});
	});

	describe('render', () => {
		it('should render roles in order by displayName and id', async() => {
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

			const expectedFilterData = [
				{ id: '1', displayName: 'role' },
				{ id: '2', displayName: 'Role' },
				{ id: '3', displayName: 'Role' },
				{ id: '4', displayName: 'ZZZRole' }
			];
			const el = await fixture(html`<d2l-insights-role-filter></d2l-insights-role-filter>`);
			await new Promise(resolve => setTimeout(resolve, 200)); // allow fetch to run. Add 200 ms for Firefox on OSX
			await el.updateComplete;

			expect(el.shadowRoot.querySelector('d2l-simple-filter').data).to.deep.equal(expectedFilterData);
		});
	});

	describe('item selection', () => {
		let el;

		beforeEach(async() => {
			el = await fixture(html`<d2l-insights-role-filter></d2l-insights-role-filter>`);
			await new Promise(resolve => setTimeout(resolve, 0)); // allow fetch to run
			await el.updateComplete;
		});

		it('should return only selected items when they are de/selected', async() => {

			// everything should be deselected initially
			expect(el.selected).to.deep.equal([]);

			const checkboxes = Array.from(
				el.shadowRoot.querySelector('d2l-simple-filter').shadowRoot.querySelectorAll('d2l-input-checkbox')
			);

			checkboxes.find(checkbox => checkbox.value === '2').simulateClick();
			checkboxes.find(checkbox => checkbox.value === '3').simulateClick();

			expect(el.selected).to.deep.equal(['2', '3']);

			checkboxes.find(checkbox => checkbox.value === '2').simulateClick();

			expect(el.selected).to.deep.equal(['3']);

		});

		it('should fire a d2l-insights-role-filter-change event when an item is selected', async() => {
			const listener = oneEvent(el, 'd2l-insights-role-filter-change');

			const checkboxes = Array.from(
				el.shadowRoot.querySelector('d2l-simple-filter').shadowRoot.querySelectorAll('d2l-input-checkbox')
			);

			checkboxes.find(checkbox => checkbox.value === '1').simulateClick();

			const event = await listener; // if no event is fired, this will time out after 2 seconds
			expect(event.type).to.equal('d2l-insights-role-filter-change');
			expect(event.target).to.equal(el);
		});
	});

	after(() => {
		fetchMock.reset();
	});
});