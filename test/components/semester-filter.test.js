import '../../components/semester-filter';

import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import fetchMock from 'fetch-mock/esm/client';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

const endpoint = new URL('/d2l/api/ap/unstable/insights/data/semesters?pageSize=3', location.href);

describe('d2l-insights-semester-filter', () => {
	beforeEach(() => {
		fetchMock.reset();

		const mockLmsResponseData =  {
			PagingInfo: {
				Bookmark: '1326467654053_120127',
				HasMoreItems: true
			},
			Items: [
				{
					orgUnitId: 10007,
					orgUnitName: 'IPSIS Semester New'
				},
				{
					orgUnitId: 121194,
					orgUnitName: 'Fall Test Semester'
				},
				{
					orgUnitId: 120127,
					orgUnitName: 'IPSIS Test Semester 1'
				}
			]
		};

		fetchMock.get(endpoint, mockLmsResponseData);
	});

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-semester-filter');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-insights-semester-filter></d2l-insights-semester-filter>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should render semesters', async() => {
			const expectedFilterData = [
				{ id: '10007', displayName: 'IPSIS Semester New (Id: 10007)', selected: false },
				{ id: '121194', displayName: 'Fall Test Semester (Id: 121194)', selected: false },
				{ id: '120127', displayName: 'IPSIS Test Semester 1 (Id: 120127)', selected: false }
			];

			const el = await fixture(html`<d2l-insights-semester-filter></d2l-insights-semester-filter>`);
			await new Promise(resolve => setTimeout(resolve, 200)); // allow fetch to run. Add 200 ms for Firefox on OSX
			await el.updateComplete;

			expect(el.shadowRoot.querySelector('d2l-simple-filter').data).to.deep.equal(expectedFilterData);
		});
	});

	describe('selection', () => {
		let el;

		beforeEach(async() => {
			el = await fixture(html`<d2l-insights-semester-filter></d2l-insights-semester-filter>`);
			await new Promise(resolve => setTimeout(resolve, 200)); // allow fetch to run. Add 200 ms for Firefox on OSX
			await el.updateComplete;
		});

		it('should return only selected items when they are de/selected', async() => {
			// everything should be deselected initially
			expect(el.selected).to.deep.equal([]);

			const checkboxes = Array.from(
				el.shadowRoot.querySelector('d2l-simple-filter').shadowRoot.querySelectorAll('d2l-input-checkbox')
			);

			checkboxes.find(checkbox => checkbox.value === '10007').simulateClick();
			checkboxes.find(checkbox => checkbox.value === '121194').simulateClick();

			expect(el.selected).to.deep.equal(['10007', '121194']);

			checkboxes.find(checkbox => checkbox.value === '121194').simulateClick();

			expect(el.selected).to.deep.equal(['10007']);

		});

		it('should fire a d2l-insights-semester-filter-change event when an item is selected', async() => {
			const listener = oneEvent(el, 'd2l-insights-semester-filter-change');

			const checkboxes = Array.from(
				el.shadowRoot.querySelector('d2l-simple-filter').shadowRoot.querySelectorAll('d2l-input-checkbox')
			);

			checkboxes.find(checkbox => checkbox.value === '10007').simulateClick();

			const event = await listener; // if no event is fired, this will time out after 2 seconds
			expect(event.type).to.equal('d2l-insights-semester-filter-change');
			expect(event.target).to.equal(el);
		});
	});

	after(() => {
		fetchMock.reset();
	});
});

