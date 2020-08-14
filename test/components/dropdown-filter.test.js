import '../../components/dropdown-filter';

import {expect, fixture, html, oneEvent} from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-dropdown-filter', () => {
	let el;
	const name = 'test';
	const testData = [
		{
			id: '1',
			displayName: 'name 1'
		},
		{
			id: '2',
			displayName: 'name 2'
		},
	];

	beforeEach(async() => {
		el = await fixture(html`<d2l-insights-dropdown-filter name="${name}" more .data="${testData}"></d2l-insights-dropdown-filter>`);
		await new Promise(resolve => setTimeout(resolve, 0)); // allow fetch to run
		await el.updateComplete;
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			await expect(el).to.be.accessible();
		});
	});

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-dropdown-filter');
		});
	});

	describe('render', () => {
		it('should render the dropdown opener with the correct name', async() => {
			const filter = el.shadowRoot.querySelector('d2l-filter-dropdown');
			expect(filter.openerText).to.equal(name);
			expect(filter.openerTextSingle).to.equal(`${name}: 0 selected`);
			expect(filter.openerTextMultiple).to.equal(`${name}: 0 selected`);
		});

		it('should render with the correct checkbox elements', () => {
			const checkboxList = Array.from(el.shadowRoot.querySelectorAll('d2l-filter-dropdown-option'));
			expect(checkboxList.length).to.equal(2);
			checkboxList.forEach((checkbox, idx) => {
				expect(checkbox.value).to.equal(testData[idx].id);
				expect(checkbox.text).to.equal(testData[idx].displayName);
				expect(checkbox.selected).to.be.false;
			});
		});

		it('should render Load More button when `more`-attribute is specified', () => {
			const button = el.shadowRoot.querySelector('d2l-button-subtle');
			expect(button.text).to.equal('Load More');
		});

		it('should not render Load More button when no `more`-attribute', async() => {
			el = await fixture(html`<d2l-insights-dropdown-filter name="${name}" .data="${testData}"></d2l-insights-dropdown-filter>`);
			await new Promise(resolve => setTimeout(resolve, 0)); // allow fetch to run
			await el.updateComplete;

			const button = el.shadowRoot.querySelector('d2l-button-subtle');
			expect(button).to.be.null;
		});

		it('should render search pannel', () => {
			const category = el.shadowRoot.querySelector('d2l-filter-dropdown-category');
			expect(category.disableSearch).to.be.false;
		});

		it('should hide search if `disable-search` is specified', async() => {
			el = await fixture(html`<d2l-insights-dropdown-filter name="${name}" .data="${testData}" disable-search></d2l-insights-dropdown-filter>`);
			await new Promise(resolve => setTimeout(resolve, 0)); // allow fetch to run
			await el.updateComplete;

			const category = el.shadowRoot.querySelector('d2l-filter-dropdown-category');
			expect(category.disableSearch).to.be.true;
		});

		it('should return only selected items when they are de/selected', async() => {
			// everything should be deselected initially
			expect(el.selected).to.deep.equal([]);

			const checkboxes = Array.from(el.shadowRoot.querySelectorAll('d2l-filter-dropdown-option'));

			checkboxes.find(checkbox => checkbox.value === '1').click();
			checkboxes.find(checkbox => checkbox.value === '2').click();

			expect(el.selected).to.deep.equal(['1', '2']);

			checkboxes.find(checkbox => checkbox.value === '2').click();

			expect(el.selected).to.deep.equal(['1']);
		});
	});

	describe('eventing', () => {
		it('should fire a `selected` event whenever one of the checkboxes is clicked', async() => {
			let listener = oneEvent(el, 'd2l-insights-dropdown-filter-selected');
			const checkboxList = Array.from(el.shadowRoot.querySelectorAll('d2l-filter-dropdown-option'));

			checkboxList[0].click();

			let event = await listener;
			expect(event.type).to.equal('d2l-insights-dropdown-filter-selected');
			expect(event.detail).to.deep.equal({ itemId: '1', selected: true });

			// verify `selected` property changed
			expect(el.selected.length).to.equal(1);
			expect(el.selected[0]).to.equal('1');

			//  verify opener textes are changed
			let filter = el.shadowRoot.querySelector('d2l-filter-dropdown');
			expect(filter.openerText).to.equal(name);
			expect(filter.openerTextSingle).to.equal(`${name}: 1 selected`);
			expect(filter.openerTextMultiple).to.equal(`${name}: 1 selected`);

			listener = oneEvent(el, 'd2l-insights-dropdown-filter-selected');

			checkboxList[0].click();

			event = await listener;
			expect(event.type).to.equal('d2l-insights-dropdown-filter-selected');
			expect(event.detail).to.deep.equal({ itemId: '1', selected: false });

			// verify `selected` property changed
			expect(el.selected.length).to.equal(0);

			// verify opener textes are changed
			filter = el.shadowRoot.querySelector('d2l-filter-dropdown');
			expect(filter.openerText).to.equal(name);
			expect(filter.openerTextSingle).to.equal(`${name}: 0 selected`);
			expect(filter.openerTextMultiple).to.equal(`${name}: 0 selected`);
		});

		it('should fire a `load-more-click` event when `Load More`-button is clicked', async() => {
			const listener = oneEvent(el, 'd2l-insights-dropdown-filter-load-more-click');
			const button = el.shadowRoot.querySelector('d2l-button-subtle');

			button.click();
			const event = await listener;
			expect(event.type).to.equal('d2l-insights-dropdown-filter-load-more-click');
		});

		it('should fire a `searched` event when d2l-filter-dropdown-category-searched is handled', async() => {
			const listener = oneEvent(el, 'd2l-insights-dropdown-filter-searched');
			const dropdownCategorySearchedEvent = {detail: {value: 'search string'}};

			el._handleSearchedClick(dropdownCategorySearchedEvent);

			const event = await listener;
			expect(event.type).to.equal('d2l-insights-dropdown-filter-searched');
			expect(event.detail).to.deep.equal({ value: 'search string' });
		});

		it('should fire a `cleared` event when d2l-insights-dropdown-filter-selection-cleared is handled', async() => {
			const listener = oneEvent(el, 'd2l-insights-dropdown-filter-selection-cleared');

			el._clearSelectionClick();

			const event = await listener;
			expect(event.type).to.equal('d2l-insights-dropdown-filter-selection-cleared');
			expect(event.detail).to.be.null;
		});

		it('should fire a `close` event when d2l-insights-dropdown-filter-close is handled', async() => {
			const listener = oneEvent(el, 'd2l-insights-dropdown-filter-close');

			el._filterClose();

			const event = await listener;
			expect(event.type).to.equal('d2l-insights-dropdown-filter-close');
			expect(event.detail).to.be.null;
		});
	});
});
