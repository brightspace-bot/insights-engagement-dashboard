import '../../components/ou-filter.js';

import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-ou-filter', () => {
	const orgUnits = [
		[3, 'Department 1', 2, [5]],
		[2, 'Course 2', 3, [3, 4]],
		[1, 'Course 1', 3, [3, 4]],
		[6, 'Course 3', 3, [7, 4]],
		[9, 'Faculty 2', 7, [6607]],
		[8, 'Course 4', 3, [5]],
		[99, 'Course 5', 3, [5]], // filtered out
		[7, 'Department 2', 2, [5]],
		[4, 'Semester', 52, [6607]],
		[5, 'Faculty 1', 7, [6607]],
		[6607, 'Dev', 1, [0]]
	];
	const data = {
		serverData: {
			records: [],
			orgUnits,
			users: [],
			semesterTypeId: 52
		},
		// org units after semester filter: 99 goes away entirely; 5 will be included due to its children
		orgUnits: orgUnits.filter(x => ![99, 5].includes(x[0])),
		selectedOrgUnitIds: [2, 8]
	};

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-ou-filter');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-insights-ou-filter .data="${data}"></d2l-insights-ou-filter>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should render a tree-filter with the correct data including lazy-loading', async() => {
			const el = await fixture(html`<d2l-insights-ou-filter .data="${data}"></d2l-insights-ou-filter>`);
			const selector = el.shadowRoot.querySelector('d2l-insights-tree-filter');
			expect(selector.tree.tree).to.deep.equal({
				'1': [1, 'Course 1', 3, [3, 4], [], 'none', false],
				'2': [2, 'Course 2', 3, [3, 4], [], 'explicit', false],
				'3': [3, 'Department 1', 2, [5], [2, 1], 'indeterminate', false],
				// semester is omitted
				'5': [5, 'Faculty 1', 7, [6607], [3, 7, 8], 'indeterminate', false],
				'6': [6, 'Course 3', 3, [7, 4], [], 'none', false],
				'7': [7, 'Department 2', 2, [5], [6], 'none', false],
				'8': [8, 'Course 4', 3, [5], [], 'explicit', false],
				'9': [9, 'Faculty 2', 7, [6607], [], 'none', false],
				'6607': [6607, 'Dev', 1, [0], [5, 9], 'none', false]
			});
			expect(selector.tree.leafTypes).to.deep.equal([3]);
		});

		it('should keep nodes open on redraw', async() => {
			const el = await fixture(html`<d2l-insights-ou-filter .data="${data}"></d2l-insights-ou-filter>`);
			let selector = el.shadowRoot.querySelector('d2l-insights-tree-filter');
			selector.tree.setOpen(3, true);
			selector.tree.setOpen(5, true);

			// shallow copy to force render
			el.data = { ...data };
			await el.updateComplete;
			selector = el.shadowRoot.querySelector('d2l-insights-tree-filter');
			await selector.treeUpdateComplete;

			expect(selector.tree.open).to.deep.equal([3, 5]);
		});
	});

	describe('selection', () => {
		it('should return selected nodes', async() => {
			const el = await fixture(html`<d2l-insights-ou-filter .data="${data}"></d2l-insights-ou-filter>`);
			const selector = el.shadowRoot.querySelector('d2l-insights-tree-filter');
			await selector.treeUpdateComplete;
			expect(el.selected).to.deep.equal([2, 8]);
		});
	});

	describe('events', () => {
		it('should fire d2l-insights-ou-filter-change on selection change', async() => {
			const el = await fixture(html`<d2l-insights-ou-filter .data="${data}"></d2l-insights-ou-filter>`);
			// on Safari only, the children don't finish rendering during the above await
			await new Promise(resolve => setTimeout(resolve, 500));
			const listener = oneEvent(el, 'd2l-insights-ou-filter-change');
			const childCheckbox = el.shadowRoot.querySelector('d2l-insights-tree-filter')
				.shadowRoot.querySelectorAll('d2l-insights-tree-selector-node')[1] // a child node
				.shadowRoot.querySelector('d2l-input-checkbox');
			childCheckbox.simulateClick();
			const event = await listener;
			expect(event.type).to.equal('d2l-insights-ou-filter-change');
			expect(event.target).to.equal(el);
		});
	});
});
