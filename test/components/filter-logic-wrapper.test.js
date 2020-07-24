import '../../components/filter-logic-wrapper';

import {expect, fixture, html} from '@open-wc/testing';
import {runConstructor} from '@brightspace-ui/core/tools/constructor-test-helper';

describe('filter-logic-wrapper', () => {
	const testData = [
		{
			id: '1',
			displayName: 'first item'
		},
		{
			id: '2',
			displayName: 'second item'
		},
		{
			id: '3',
			displayName: 'THIRD item'
		}];

	let filter, filterOptions;

	beforeEach(async() => {
		filter = await fixture(html`<d2l-filter-logic-wrapper .allData="${testData}"></d2l-filter-logic-wrapper>`);
		// inner elements exist even if filter dropdown is closed. No need to manually open it
		filterOptions = Array.from(filter.shadowRoot.querySelectorAll('d2l-filter-dropdown-option'));
	});

	describe('constructor / initialization', () => {
		it('should construct', () => {
			runConstructor('d2l-filter-logic-wrapper');
		});

		describe('should start with everything visible and unselected', () => {
			it('should have correct data model', () => {
				verifyDataSelected(filter.allData, [false, false, false]);

				expect(filter.visibleData).to.deep.equal(filter.allData);
			});

			it('should have correct DOM', () => {
				expect(filterOptions.length).to.equal(testData.length);

				// this checks that the DOM element order is the same as the data model order
				filterOptions.forEach((opt, idx) => {
					expect(opt.value).to.equal(testData[idx].id);
					expect(opt.text).to.equal(testData[idx].displayName);
					expect(opt.selected).to.equal(false);
				});
			});
		});
	});

	describe('selection', () => {
		it('should update when an item is selected and deselected', () => {

			// unfortunately the only way to de/select a d2l-filter-dropdown-option is to literally click() it.
			// it should be achievable directly via props but it's not (correct visual behaviour but missing eventing)
			const option1 = filterOptions.find(opt => opt.value === '1');
			option1.click();

			verifyFilterOptionsValues(filterOptions, [
				['1', 'first item', true],
				['2', 'second item', false],
				['3', 'THIRD item', false]
			]);

			verifyDataSelected(filter.allData, [true, false, false]);
			verifyDataSelected(filter.visibleData, [true, false, false]);

			option1.click();

			verifyFilterOptionsValues(filterOptions, [
				['1', 'first item', false],
				['2', 'second item', false],
				['3', 'THIRD item', false]
			]);
			verifyDataSelected(filter.allData, [false, false, false]);
			verifyDataSelected(filter.visibleData, [false, false, false]);
		});
	});

	describe('search', () => {
		it('should only show items that match search term', async() => {
			await applySearchTerm(filter, 'seco');

			filterOptions = Array.from(filter.shadowRoot.querySelectorAll('d2l-filter-dropdown-option'));
			verifyFilterOptionsValues(filterOptions, [['2', 'second item', false]]);

			verifyDataSelected(filter.allData, [false, false, false]);
			verifyDataSelected(filter.visibleData, [false]);

			// matching should be case insensitive
			await applySearchTerm(filter, 'FIR');

			filterOptions = Array.from(filter.shadowRoot.querySelectorAll('d2l-filter-dropdown-option'));
			verifyFilterOptionsValues(filterOptions, [['1', 'first item', false]]);

			verifyDataSelected(filter.allData, [false, false, false]);
			verifyDataSelected(filter.visibleData, [false]);

			await applySearchTerm(filter, 'third item');

			filterOptions = Array.from(filter.shadowRoot.querySelectorAll('d2l-filter-dropdown-option'));
			verifyFilterOptionsValues(filterOptions, [['3', 'THIRD item', false]]);

			verifyDataSelected(filter.allData, [false, false, false]);
			verifyDataSelected(filter.visibleData, [false]);
		});

		it('should show everything after the search term is cleared', async() => {
			const option3 = filterOptions.find(opt => opt.value === '3');
			option3.click();

			await applySearchTerm(filter, 'second');
			await applySearchTerm(filter, '');

			filterOptions = Array.from(filter.shadowRoot.querySelectorAll('d2l-filter-dropdown-option'));
			expect(filterOptions.length).to.equal(3);

			verifyDataSelected(filter.allData, [false, false, true]);
			verifyDataSelected(filter.visibleData, [false, false, true]);
		});

		it('should not affect the selected status of each option', async() => {
			const option2 = filterOptions.find(opt => opt.value === '2');
			option2.click();

			await applySearchTerm(filter, 'second');

			filterOptions = Array.from(filter.shadowRoot.querySelectorAll('d2l-filter-dropdown-option'));
			verifyFilterOptionsValues(filterOptions, [['2', 'second item', true]]);

			verifyDataSelected(filter.allData, [false, true, false]);
			verifyDataSelected(filter.visibleData, [true]);

			await applySearchTerm(filter, 'first');

			filterOptions = Array.from(filter.shadowRoot.querySelectorAll('d2l-filter-dropdown-option'));
			verifyFilterOptionsValues(filterOptions, [['1', 'first item', false]]);

			verifyDataSelected(filter.allData, [false, true, false]);
			verifyDataSelected(filter.visibleData, [false]);
		});
	});

	describe('clear selection', () => {
		it('should clear all selections, including non-visible ones, but should not affect visibility', async() => {
			const clearButton = filter.shadowRoot.querySelector('d2l-filter-dropdown')
				.shadowRoot.querySelector('d2l-button-subtle');

			const option2 = filterOptions.find(opt => opt.value === '2');
			const option3 = filterOptions.find(opt => opt.value === '3');
			option2.click();
			option3.click();

			await applySearchTerm(filter, 'second');

			clearButton.click();

			filterOptions = Array.from(filter.shadowRoot.querySelectorAll('d2l-filter-dropdown-option'));
			expect(filterOptions.length).to.equal(1);
			expect(filterOptions[0].value).to.equal('2');
			expect(filterOptions[0].selected).to.be.false;

			verifyDataSelected(filter.allData, [false, false, false]);
			verifyDataSelected(filter.visibleData, [false]);
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			await new Promise(resolve => setTimeout(resolve, 1500));
			await expect(filter).to.be.accessible();
		});
	});
});

/**
 * @param {[Node]} filterOptions
 * @param {[[string, string, boolean]]} expected - param 1: value, param 2: text, param 3: selected
 */
function verifyFilterOptionsValues(filterOptions, expected) {
	expect(filterOptions.length).to.equal(expected.length);
	filterOptions.forEach((opt, idx) => {
		expect(opt.value).to.equal(expected[idx][0]);
		expect(opt.text).to.equal(expected[idx][1]);
		expect(opt.selected).to.equal(expected[idx][2]);
	});
}

/**
 * @param {[Object]} data
 * @param {[boolean]} expected
 */
function verifyDataSelected(data, expected) {
	data.forEach((obj, idx) => {
		expect(obj.selected).to.equal(expected[idx]);
	});
}

async function applySearchTerm(filter, searchTerm) {
	filter.searchTerm = searchTerm;
	// it takes a bit for search to be applied and run through the animation
	await new Promise(resolve => setTimeout(resolve, 100));
}
