import '../../components/tree-selector.js';

import {expect, fixture, html, oneEvent} from '@open-wc/testing';
import {runConstructor} from '@brightspace-ui/core/tools/constructor-test-helper.js';

const tree = [
	{ name: 'child1' },
	{ name: 'child2', tree:[{ name: 'c2child1' }], selectedState: 'explicit' },
	{ name: 'child3', getTree: async() => [], isOpen: true }
];

describe('d2l-insights-tree-selector', () => {
	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-tree-selector');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector name="choose!" .tree="${tree}"></d2l-insights-tree-selector>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should render a node with the given tree', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector name="choose!" .tree="${tree}"></d2l-insights-tree-selector>`);
			const node = el.shadowRoot.querySelector('d2l-insights-tree-selector-node');
			expect(node.tree).to.deep.equal(tree);
			expect(node.isRoot).to.be.true;
		});

		it('should render a dropbdown with the given name', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector name="choose!" .tree="${tree}"></d2l-insights-tree-selector>`);
			expect(el.shadowRoot.querySelector('.d2l-dropdown-opener').textContent).to.equal('choose!');
		});
	});

	describe('selection', () => {
		it('should return selected nodes', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector name="choose!" .tree="${tree}"></d2l-insights-tree-selector>`);
			expect(el.selected.map(x => x.name)).to.deep.equal(['child2']);
		});
	});

	describe('events', () => {
		it('should fire d2l-insights-tree-selector-change on selection change', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector name="choose!" .tree="${tree}"></d2l-insights-tree-selector>`);
			const listener = oneEvent(el, 'd2l-insights-tree-selector-change');
			const childCheckbox = el.shadowRoot.querySelector('d2l-insights-tree-selector-node')
				.shadowRoot.querySelector('d2l-insights-tree-selector-node')
				.shadowRoot.querySelector('d2l-input-checkbox');
			childCheckbox.simulateClick();
			const event = await listener;
			expect(event.type).to.equal('d2l-insights-tree-selector-change');
			expect(event.target).to.equal(el);
		});
	});
});
