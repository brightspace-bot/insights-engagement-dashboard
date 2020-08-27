import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';
import { Tree } from '../../components/tree-filter.js';

describe('d2l-insights-tree-filter', () => {
	let el;
	function node(id) {
		return el.shadowRoot.querySelector(`d2l-insights-tree-selector-node[data-id="${id}"]`);
	}
	beforeEach(async() => {
		const tree = new Tree({
			'1': [1, 'Course 1', 3, [3, 4], [], 'none', false],
			'2': [2, 'Course 2', 3, [3, 4], [], 'none', false],
			'3': [3, 'Department 1', 2, [5], [1, 2], 'none', false],
			'5': [5, 'Faculty 1', 7, [6607], [3, 7, 8, 9], 'none', true],
			'6': [6, 'Course 3', 3, [7, 4], [], 'none', false],
			'7': [7, 'Department 2', 2, [5], [6], 'none', true],
			'8': [8, 'Course 4', 3, [5], [], 'none', false],
			'9': [9, 'Course 5', 3, [5], [], 'none', false],
			'10': [10, 'Faculty 2', 7, [6607], [], 'none', false],
			'6607': [6607, 'Dev', 1, [0], [5, 10], 'none', false]
		}, [1, 2, 7], [3]);

		el = await fixture(html`<d2l-insights-tree-filter name="filter" .tree="${tree}"></d2l-insights-tree-filter>`);
		await el.treeUpdateComplete;
	});

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-tree-selector-node');
		});

		describe('Tree', () => {
			it('should accept null selectedIds', () => {
				new Tree({ '10': [10, 'Faculty 2', 7, [6607], [], 'none', false] }, null, [3]);
			});
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		// NB: visual diffs should be the main check on the expected layout
		it('should render nodes closed by default', async() => {
			expect(node(3).isOpen).to.be.false;
		});

		it('should render nodes open if specified', async() => {
			expect(node(5).isOpen).to.be.true;
		});

		it('should render as selected: children of selected nodes and nodes with all children selected', async() => {
			const selectedNodes = el.shadowRoot.querySelectorAll('d2l-insights-tree-selector-node[selected-state="explicit"]');
			// NB: 1 and 2 are dot rendered at all because their parent is closed
			expect([...selectedNodes].map(x => x.dataId).sort()).to.deep.equal([3, 6, 7]);
		});

		it('should render as indeterminate nodes with some but not all children selected', async() => {
			const indeterminateNodes = el.shadowRoot.querySelectorAll('d2l-insights-tree-selector-node[selected-state="indeterminate"]');
			expect([...indeterminateNodes].map(x => x.dataId).sort()).to.deep.equal([5]);
		});

		it('should correctly mark level and parent name', async() => {
			expect(node(5).indentLevel).to.equal(1);
			expect(node(5).parentName).to.equal('root');

			expect(node(3).indentLevel).to.equal(2);
			expect(node(3).parentName).to.equal('Faculty 1');

			expect(node(6).indentLevel).to.equal(3);
			expect(node(6).parentName).to.equal('Department 2');
		});
	});

	describe('open and close', () => {
		it('should open a node on click', async() => {
			node(3).simulateArrowClick();
			await el.treeUpdateComplete;
			expect(node(3).isOpen).to.be.true;
		});

		it('should close on click', async() => {
			node(7).simulateArrowClick();
			await el.treeUpdateComplete;
			expect(node(7).isOpen).to.be.false;
		});

		it('should maintain open state of children', async() => {
			// Faculty 1 and Department 2 are open to start; close Department 1 then open again; Department 2 should still be open
			node(5).simulateArrowClick();
			await el.treeUpdateComplete;
			node(5).simulateArrowClick();
			await el.treeUpdateComplete;
			expect(node(3).isOpen).to.be.false;
			expect(node(7).isOpen).to.be.true;
		});
	});

	describe('selection', () => {
		it('should return selected nodes', async() => {
			expect(el.selected.sort()).to.deep.equal([3, 7]);
		});

		it('should select', async() => {
			node(9).simulateCheckboxClick();
			await el.treeUpdateComplete;
			expect(el.selected.sort()).to.deep.equal([3, 7, 9]);
		});

		it('should replace descendants when ancestor selected', async() => {
			node(5).simulateCheckboxClick();
			await el.treeUpdateComplete;
			expect(el.selected.sort()).to.deep.equal([5]);
		});

		it('should deselect', async() => {
			node(7).simulateCheckboxClick();
			await el.treeUpdateComplete;
			expect(el.selected.sort()).to.deep.equal([3]);
		});

		it('should select parent when all children selected', async() => {
			node(8).simulateCheckboxClick();
			node(9).simulateCheckboxClick();
			await el.treeUpdateComplete;
			expect(el.selected.sort()).to.deep.equal([5]);
		});

		it('should select all other children if a node was selected and one child is deselected', async() => {
			node(5).simulateCheckboxClick();
			await el.treeUpdateComplete;
			// open dept 1 so that course 1 gets rendered - then deselect course 1
			node(3).simulateArrowClick();
			await el.treeUpdateComplete;
			node(1).simulateCheckboxClick();
			await el.treeUpdateComplete;
			expect(el.selected.sort()).to.deep.equal([2, 7, 8, 9]);
		});
	});

	describe('search', () => {
		it('should render search results', async() => {
			el.searchString = '1'; // matches Course 1, Department 1, and Faculty 1 - as well as Faculty 2 (Id: 10)
			await el.treeUpdateComplete;
			const selector = el.shadowRoot.querySelector('d2l-insights-tree-selector');
			expect(selector.isSearch).to.be.true;

			const resultNodes = el.shadowRoot.querySelectorAll('d2l-insights-tree-selector-node[slot="search-results"]');
			expect(resultNodes.length).to.equal(4);
			expect([...resultNodes].map(x => x.dataId).sort()).to.deep.equal([1, 10, 3, 5]);
		});

		it('should clear search results', async() => {
			el.searchString = '1';
			await el.treeUpdateComplete;
			el.searchString = '';
			await el.treeUpdateComplete;

			const selector = el.shadowRoot.querySelector('d2l-insights-tree-selector');
			expect(selector.isSearch).to.be.false;

			const resultNodes = el.shadowRoot.querySelectorAll('d2l-insights-tree-selector-node[slot="search-results"]');
			expect(resultNodes.length).to.equal(0);
		});

		it('should handle a search event', async() => {
			const selector = el.shadowRoot.querySelector('d2l-insights-tree-selector');
			selector.simulateSearch('forastring');
			await el.treeUpdateComplete;
			expect(el.searchString).to.equal('forastring');
		});
	});

	describe('events', () => {
		async function expectEvent(id) {
			const listener = oneEvent(el, 'd2l-insights-tree-filter-select');
			node(id).simulateCheckboxClick();
			const event = await listener;
			expect(event.type).to.equal('d2l-insights-tree-filter-select');
			expect(event.target).to.equal(el);
		}

		it('should fire d2l-insights-tree-filter-select on selection', async() => {
			await expectEvent(9);
		});

		it('should fire d2l-insights-tree-filter-select on selection from indeterminate', async() => {
			await expectEvent(5);
		});

		it('should fire d2l-insights-tree-selector-change on deselection', async() => {
			await expectEvent(3);
		});
	});
});
