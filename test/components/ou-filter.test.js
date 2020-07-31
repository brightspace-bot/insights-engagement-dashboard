import '../../components/ou-filter.js';

import {expect, fixture, html, oneEvent} from '@open-wc/testing';
import {runConstructor} from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-ou-filter', () => {
	const data = {
		serverData: {
			records: [],
			orgUnits: [
				[3, 'Department 1', 2, [5]],
				[2, 'Course 2', 3, [3, 4]],
				[1, 'Course 1', 3, [3, 4]],
				[6, 'Course 3', 3, [7, 4]],
				[9, 'Faculty 2', 7, [6607]],
				[8, 'Course 4', 3, [5]],
				[7, 'Department 2', 2, [5]],
				[4, 'Semester', 5, [6607]],
				[5, 'Faculty 1', 7, [6607]],
				[6607, 'Dev', 1, [0]]
			],
			users: [],
			selectedOrgUnitIds: [2, 7]
		}
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
		it('should render a tree-selector with the correct data including lazy-loading', async() => {
			const el = await fixture(html`<d2l-insights-ou-filter .data="${data}"></d2l-insights-ou-filter>`);
			const selector = el.shadowRoot.querySelector('d2l-insights-tree-selector');
			expect(selector.tree).to.have.length(2);

			expect(selector.tree[1]).to.include({ name: 'Faculty 2 (Id: 9)', selectedState: 'none', tree: null });
			expect(selector.tree[1]).to.have.property('getTree');
			expect(await selector.tree[1].getTree()).to.deep.equal([]);

			expect(selector.tree[0]).to.include({ name: 'Faculty 1 (Id: 5)', selectedState: 'indeterminate', getTree: null });
			const subtree = selector.tree[0].tree;
			expect(subtree).to.exist;
			expect(subtree).to.have.length(3);
			expect(subtree[0]).to.deep.equal({ name: 'Course 4 (Id: 8)', selectedState: 'none', tree: null, getTree: null });
			expect(subtree[2]).to.include({ name: 'Department 2 (Id: 7)', selectedState: 'explicit', tree: null });
			expect(subtree[2]).to.have.property('getTree');
			expect(await subtree[2].getTree()).to.deep.equal([{ name: 'Course 3 (Id: 6)', selectedState: 'none', tree: null, getTree: null }]);

			expect(subtree[1]).to.deep.equal({ name: 'Department 1 (Id: 3)', selectedState: 'indeterminate', getTree: null, tree: [
				{ name: 'Course 1 (Id: 1)', selectedState: 'none', tree: null, getTree: null },
				{ name: 'Course 2 (Id: 2)', selectedState: 'explicit', tree: null, getTree: null }]
			});
		});
	});

	describe('selection', () => {
		it('should return selected nodes', async() => {
			const el = await fixture(html`<d2l-insights-ou-filter .data="${data}"></d2l-insights-ou-filter>`);
			// on Safari only, the children don't finish rendering during the above await
			await el.shadowRoot.querySelector('d2l-insights-tree-selector').updateComplete;
			expect(el.selected.map(x => x.name)).to.deep.equal(['Course 2 (Id: 2)', 'Department 2 (Id: 7)']);
		});
	});

	describe('events', () => {
		it('should fire d2l-insights-ou-filter-change on selection change', async() => {
			const el = await fixture(html`<d2l-insights-ou-filter .data="${data}"></d2l-insights-ou-filter>`);
			await el.shadowRoot.querySelector('d2l-insights-tree-selector').updateComplete;
			const listener = oneEvent(el, 'd2l-insights-ou-filter-change');
			const childCheckbox = el.shadowRoot.querySelector('d2l-insights-tree-selector')
				.shadowRoot.querySelector('d2l-insights-tree-selector-node') // hidden root node
				.shadowRoot.querySelector('d2l-insights-tree-selector-node') // first child
				.shadowRoot.querySelector('d2l-input-checkbox');
			childCheckbox.simulateClick();
			const event = await listener;
			expect(event.type).to.equal('d2l-insights-ou-filter-change');
			expect(event.target).to.equal(el);
		});
	});
});
