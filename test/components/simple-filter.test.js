import '../../components/simple-filter';

import {expect, fixture, html, oneEvent} from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-simple-filter', () => {
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
		el = await fixture(html`<d2l-simple-filter name="${name}" .data="${testData}"></d2l-simple-filter>`);
		await new Promise(resolve => setTimeout(resolve, 500));
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			await expect(el).to.be.accessible();
		});
	});

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-simple-filter');
		});
	});

	describe('render', () => {
		it('should render the dropdown opener with the correct name', async() => {
			const button = el.shadowRoot.querySelector('button');
			expect(button.innerText).to.equal(name);
			// firefox doesn't expose aria attributes directly, so we need to go through the attributes list
			expect(button.attributes['aria-label'].value).to.equal(`Open ${name} filter`);
		});

		it('should render with the correct checkbox elements', () => {
			const checkboxList = Array.from(el.shadowRoot.querySelectorAll('d2l-input-checkbox'));
			expect(checkboxList.length).to.equal(2);
			checkboxList.forEach((checkbox, idx) => {
				expect(checkbox.value).to.equal(testData[idx].id);
				expect(checkbox.innerText).to.equal(testData[idx].displayName);
			});
		});
	});

	describe('eventing', () => {
		it('should fire a d2l-simple-filter-selected event whenever one of the checkboxes is clicked', async() => {
			let listener = oneEvent(el, 'd2l-simple-filter-selected');
			const checkboxList = Array.from(el.shadowRoot.querySelectorAll('d2l-input-checkbox'));

			checkboxList[0].simulateClick();

			let event = await listener;
			expect(event.type).to.equal('d2l-simple-filter-selected');
			expect(event.detail).to.deep.equal({ itemId: '1', selected: true });

			listener = oneEvent(el, 'd2l-simple-filter-selected');

			checkboxList[0].simulateClick();

			event = await listener;
			expect(event.type).to.equal('d2l-simple-filter-selected');
			expect(event.detail).to.deep.equal({ itemId: '1', selected: false });
		});
	});
});
