import '../../components/tree-selector-node.js';

import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

const tree = [
	{ name: 'child1' },
	{ name: 'child2', tree:[{ name: 'c2child1' }], selectedState: 'explicit' },
	{ name: 'child3', getTree: async() => [], isOpen: true }
];

function getOpenControl(el) {
	return el.shadowRoot.querySelector('.open-control');
}

function getCheckbox(el) {
	return el.shadowRoot.querySelector('d2l-input-checkbox');
}

function getSubtree(el) {
	return el.shadowRoot.querySelector('.subtree');
}

describe('d2l-insights-tree-selector-node', () => {
	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-tree-selector-node');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="some node"></d2l-insights-tree-selector-node>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should not render top-level node if root', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node root></d2l-insights-tree-selector-node>`);
			expect(getCheckbox(el)).to.not.exist;
		});

		it('should render a childless node without a dropdown control', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="leaf"></d2l-insights-tree-selector-node>`);
			expect(getOpenControl(el)).to.not.exist;
		});

		it('should render with a dropdown control given a subtree', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" .tree="${tree}"></d2l-insights-tree-selector-node>`);
			expect(getOpenControl(el)).to.exist;
		});

		it('should render with a dropdown control given a tree provider', async() => {
			const getTree = async() => tree;
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" .getTree="${getTree}"></d2l-insights-tree-selector-node>`);
			expect(getOpenControl(el)).to.exist;
		});

		it('should render as not selected', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" selected-state="none"></d2l-insights-tree-selector-node>`);
			expect(getCheckbox(el).checked).to.be.false;
			expect(getCheckbox(el).indeterminate).to.be.false;
		});

		it('should render as indeterminate', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" selected-state="indeterminate"></d2l-insights-tree-selector-node>`);
			expect(getCheckbox(el).checked).to.be.false;
			expect(getCheckbox(el).indeterminate).to.be.true;
		});

		it('should render as checked if explicit', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" selected-state="explicit"></d2l-insights-tree-selector-node>`);
			expect(getCheckbox(el).checked).to.be.true;
			expect(getCheckbox(el).indeterminate).to.be.false;
		});

		it('should render as checked if implicit', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" selected-state="implicit"></d2l-insights-tree-selector-node>`);
			expect(getCheckbox(el).checked).to.be.true;
			expect(getCheckbox(el).indeterminate).to.be.false;
		});

		it('should render as closed by default', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" .tree="${tree}"></d2l-insights-tree-selector-node>`);
			expect(getSubtree(el).hidden).to.be.true;
		});

		it('should render as open if specified', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" .tree="${tree}" open></d2l-insights-tree-selector-node>`);
			expect(getSubtree(el).hidden).to.be.false;
		});

		[true, false].forEach(isRoot =>
			it(`should render children as specified (isRoot = ${isRoot})`, async() => {
				const el = await fixture(html`<d2l-insights-tree-selector-node name="node" .tree="${tree}" ?root="${isRoot}">
					</d2l-insights-tree-selector-node>`);
				const renderedChildren = el.shadowRoot.querySelectorAll('d2l-insights-tree-selector-node');
				expect(renderedChildren).to.have.length(3);
				expect(renderedChildren.item(0).name).to.equal('child1');
				expect(renderedChildren.item(0).selectedState).to.equal('none');
				expect(renderedChildren.item(0).tree).to.not.exist;
				expect(renderedChildren.item(0).getTree).to.not.exist;
				expect(renderedChildren.item(0).isOpen).to.be.false;
				expect(renderedChildren.item(1).name).to.equal('child2');
				expect(renderedChildren.item(1).selectedState).to.equal('explicit');
				expect(renderedChildren.item(1).tree).to.exist;
				expect(renderedChildren.item(1).getTree).to.not.exist;
				expect(renderedChildren.item(2).name).to.equal('child3');
				expect(renderedChildren.item(2).tree).to.not.exist;
				expect(renderedChildren.item(2).getTree).to.exist;
				expect(renderedChildren.item(2).isOpen).to.be.true;
			})
		);

		it('should mark children implicitly selected if selected (even if they are explicit in the data)', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" .tree="${tree}" selected-state="explicit"></d2l-insights-tree-selector-node>`);
			const [...renderedChildren] = el.shadowRoot.querySelectorAll('d2l-insights-tree-selector-node');
			renderedChildren.forEach(x => expect(x.selectedState).to.equal('implicit'));
		});

		it('should mark children implicitly selected if implicitly selected (even if they are explicit in the data)', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" .tree="${tree}" selected-state="implicit"></d2l-insights-tree-selector-node>`);
			const [...renderedChildren] = el.shadowRoot.querySelectorAll('d2l-insights-tree-selector-node');
			renderedChildren.forEach(x => expect(x.selectedState).to.equal('implicit'));
		});
	});

	describe('open and close', () => {
		it('should open on click', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" .tree="${tree}"></d2l-insights-tree-selector-node>`);
			getOpenControl(el).click();
			await el.updateComplete;
			expect(el.isOpen).to.be.true;
			expect(getSubtree(el).hidden).to.be.false;
		});

		it('should close on click', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" .tree="${tree}" open></d2l-insights-tree-selector-node>`);
			getOpenControl(el).click();
			await el.updateComplete;
			expect(el.isOpen).to.be.false;
			expect(getSubtree(el).hidden).to.be.true;
		});

		it('should maintain open state of children', async() => {
			// child3 is open to start, and we'll open child2; close this node then open again; child2&3 should still be open
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" .tree="${tree}" open></d2l-insights-tree-selector-node>`);
			const [...renderedChildren] = el.shadowRoot.querySelectorAll('d2l-insights-tree-selector-node');
			renderedChildren[1].isOpen = true;
			await renderedChildren[1].updateComplete;
			getOpenControl(el).click();
			await el.updateComplete;
			getOpenControl(el).click();
			await el.updateComplete;
			expect(el.isOpen).to.be.true;
			expect(renderedChildren[0].isOpen).to.be.false;
			expect(renderedChildren[1].isOpen).to.be.true;
			expect(renderedChildren[2].isOpen).to.be.true;
		});
	});

	describe('selection', () => {
		it('should select', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node"></d2l-insights-tree-selector-node>`);
			getCheckbox(el).simulateClick();
			await el.updateComplete;
			expect(el.selected.map(x => x.name)).to.deep.equal(['node']);
		});

		it('should select if it was indeterminate', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" selected-state="indeterminate"></d2l-insights-tree-selector-node>`);
			getCheckbox(el).simulateClick();
			await el.updateComplete;
			expect(el.selected.map(x => x.name)).to.deep.equal(['node']);
		});

		it('should deselect', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" selected-state="explicit"></d2l-insights-tree-selector-node>`);
			getCheckbox(el).simulateClick();
			await el.updateComplete;
			expect(el.selected.map(x => x.name)).to.deep.equal([]);
		});

		it('should mark children implicitly selected when selected', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" .tree="${tree}"></d2l-insights-tree-selector-node>`);
			getCheckbox(el).simulateClick();
			await el.updateComplete;
			const [...renderedChildren] = el.shadowRoot.querySelectorAll('d2l-insights-tree-selector-node');
			renderedChildren.forEach(x => expect(x.selectedState).to.equal('implicit'));
			expect(el.selected.map(x => x.name)).to.deep.equal(['node']);
		});

		it('should mark children not selected when deselected', async() => {
			// Note that this includes child2, which was explicitly selected to begin with: that state should be discarded
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" .tree="${tree}"></d2l-insights-tree-selector-node>`);
			getCheckbox(el).simulateClick();
			await el.updateComplete;
			getCheckbox(el).simulateClick();
			await el.updateComplete;
			const [...renderedChildren] = el.shadowRoot.querySelectorAll('d2l-insights-tree-selector-node');
			renderedChildren.forEach(x => expect(x.selectedState).to.equal('none'));
			expect(el.selected.map(x => x.name)).to.deep.equal([]);
		});

		it('should be marked indeterminate if some children are selected', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" .tree="${tree}"></d2l-insights-tree-selector-node>`);
			const [...renderedChildren] = el.shadowRoot.querySelectorAll('d2l-insights-tree-selector-node');
			await renderedChildren[0].updateComplete;
			getCheckbox(renderedChildren[0]).simulateClick();
			await el.updateComplete;
			expect(getCheckbox(el).checked).to.be.false;
			expect(getCheckbox(el).indeterminate).to.be.true;
			expect(el.selected.map(x => x.name)).to.deep.equal(['child1', 'child2']);
		});

		it('should select just this node if all children are selected', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" .tree="${tree}"></d2l-insights-tree-selector-node>`);
			const [...renderedChildren] = el.shadowRoot.querySelectorAll('d2l-insights-tree-selector-node');
			await renderedChildren[0].updateComplete;
			await renderedChildren[2].updateComplete;
			getCheckbox(renderedChildren[0]).simulateClick();
			getCheckbox(renderedChildren[2]).simulateClick();
			await el.updateComplete;
			expect(getCheckbox(el).checked).to.be.true;
			expect(getCheckbox(el).indeterminate).to.be.false;
			expect(el.selected.map(x => x.name)).to.deep.equal(['node']);
		});

		it('should select all other children if this node was selected and one child is deselected', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" .tree="${tree}" selected-state="explicit"></d2l-insights-tree-selector-node>`);
			const [...renderedChildren] = el.shadowRoot.querySelectorAll('d2l-insights-tree-selector-node');
			await renderedChildren[0].updateComplete;
			getCheckbox(renderedChildren[0]).simulateClick();
			await el.updateComplete;
			expect(renderedChildren[0].selectedState).to.equal('none');
			expect(renderedChildren[1].selectedState).to.equal('explicit');
			expect(renderedChildren[2].selectedState).to.equal('explicit');
			expect(el.selected.map(x => x.name)).to.deep.equal(['child2', 'child3']);
		});
	});

	describe('events', () => {
		async function expectEvent(el, clickTarget = el) {
			const listener = oneEvent(el, 'd2l-insights-tree-selector-change');
			getCheckbox(clickTarget).simulateClick();
			const event = await listener;
			expect(event.type).to.equal('d2l-insights-tree-selector-change');
			expect(event.target).to.equal(el);
		}

		it('should fire d2l-insights-tree-selector-change on selection', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node"></d2l-insights-tree-selector-node>`);
			await expectEvent(el);
		});

		it('should fire d2l-insights-tree-selector-change on deselection', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" selected-state="explicit"></d2l-insights-tree-selector-node>`);
			await expectEvent(el);
		});

		it('should fire d2l-insights-tree-selector-change on child selection', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" selected-state="explicit"></d2l-insights-tree-selector-node>`);
			const [...renderedChildren] = el.shadowRoot.querySelectorAll('d2l-insights-tree-selector-node');
			await expectEvent(el, renderedChildren[0]);
		});

		it('should fire d2l-insights-tree-selector-change on child deselection', async() => {
			const el = await fixture(html`<d2l-insights-tree-selector-node name="node" selected-state="explicit"></d2l-insights-tree-selector-node>`);
			const [...renderedChildren] = el.shadowRoot.querySelectorAll('d2l-insights-tree-selector-node');
			await expectEvent(el, renderedChildren[1]);
		});
	});
});
