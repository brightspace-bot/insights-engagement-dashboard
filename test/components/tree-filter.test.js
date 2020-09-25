import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';
import { Tree } from '../../components/tree-filter.js';

const mockOuTypes = {
	organization: 0,
	department: 1,
	course: 2,
	courseOffering: 3,
	semester: 5
};

function assertSetsAreEqual(setA, setB) {
	expect([...setA].sort()).to.deep.equal([...setB].sort());
}

describe('Tree', () => {

	const nodes = [
		[-100, 'edge case', null, null],
		[6606, 'Org', mockOuTypes.organization, [0]],
		[1001, 'Department 1', mockOuTypes.department, [6606]],
		[1002, 'Department 2', mockOuTypes.department, [6606]],
		[1003, 'Department 3', mockOuTypes.department, [6606]],

		[2, 'Course 2', mockOuTypes.course, [1001]],
		[1, 'Course 1', mockOuTypes.course, [1001]],
		[3, 'Course 3', mockOuTypes.course, [1001, 1002]], // part of 2 departments
		[4, null, mockOuTypes.course, [1003]],

		[11, 'Semester 1', mockOuTypes.semester, [6606]],
		[12, 'Semester 2', mockOuTypes.semester, [6606]],
		[13, 'Semester 3', mockOuTypes.semester, [6606]],

		[111, 'Course 1 / Semester 1', mockOuTypes.courseOffering, [1, 11]],
		[112, 'Course 1 / Semester 2', mockOuTypes.courseOffering, [1, 12]],
		[211, 'Course 2 / Semester 1', mockOuTypes.courseOffering, [2, 11]],
		[312, 'Course 3 / Semester 2', mockOuTypes.courseOffering, [3, 12]]
	];
	const selectedIds = [111, 1003];
	const leafTypes = [mockOuTypes.courseOffering];
	const invisibleTypes = [mockOuTypes.semester];

	let sut;
	beforeEach(() => {
		sut = new Tree({ nodes, selectedIds, leafTypes, invisibleTypes });
	});

	describe('constructor', () => {
		it('should accept missing selectedIds and oldTree', () => {
			new Tree({ nodes: [[10, 'Faculty 2', 7, [6607]]], leafTypes: [3] });
		});

		it('should build a default tree', () => {
			new Tree({});
		});
	});

	describe('ids', () => {
		it('should return all node ids', () => {
			expect(sut.ids.sort()).to.deep.equal(nodes.map(x => x[0]).sort());
		});
	});

	describe('open, setOpen, isOpen', () => {
		it('should list open node ids', () => {
			sut.setOpen(2, true);
			sut.setOpen(112, true);
			sut.setOpen(1001, true);
			expect(sut.open.sort()).to.deep.equal([1001, 112, 2]);
		});

		it('should remove closed nodes from the list', () => {
			sut.setOpen(2, true);
			sut.setOpen(112, true);
			sut.setOpen(1001, true);
			sut.setOpen(112, false);
			expect(sut.open.sort()).to.deep.equal([1001, 2]);
		});

		it('should copy open state from old tree', () => {
			sut.setOpen(1, true);
			sut.setOpen(211, true);
			const newTree = new Tree({ nodes, oldTree: sut });
			expect(newTree.open.sort()).to.deep.equal([1, 211]);
		});

		it('should indicate an open node', () => {
			sut.setOpen(211, true);
			expect(sut.isOpen(211)).to.be.true;
		});

		it('should indicate a closed node', () => {
			expect(sut.isOpen(211)).to.be.false;
		});

		it('should indicate that an unknown node is closed', () => {
			expect(sut.isOpen(427224)).to.be.false;
		});
	});

	describe('rootId', () => {
		it('should return node with parent 0', () => {
			expect(sut.rootId).to.equal(6606);
		});
	});

	describe('selected, setSelected, and getState', () => {
		it('should return expected selection', () => {
			expect(sut.selected.sort()).to.deep.equal([1003, 111]);
		});

		it.skip('should return expected selection given multiple parents of some nodes', () => {
			// NOTE
			// This test would fail, because the algorithm walks down the tree through indeterminate nodes until
			// it finds all explicitly selected descendants - but this means if there is more than one
			// path to a node, it can appear twice or it can appear along with an ancestor.
			// This has only very minor performance implications, so for simplicity this behaviour
			// is allowed.
			const tree = new Tree({ nodes, invisibleTypes, selectedIds: [111, 1002] });
			expect(tree.selected.sort()).to.deep.equal([1002, 111]);
		});

		it('should set selected nodes', () => {
			const tree = new Tree({ nodes, invisibleTypes });
			tree.setSelected(111, true);
			tree.setSelected(1003, true);
			expect(tree.selected.sort()).to.deep.equal([1003, 111]);
		});

		it('should mark a parent indeterminate if some children are selected', () => {
			expect(sut.getState(1)).to.equal('indeterminate');
		});

		it('should mark a parent explicit if all children are selected', () => {
			sut.setSelected(112, true);
			expect(sut.getState(1)).to.equal('explicit');
		});

		it('should mark an ancestor explicit if all descendants are selected', () => {
			sut.setSelected(2, true);
			sut.setSelected(112, true);
			sut.setSelected(312, true);
			expect(sut.getState(1001)).to.equal('explicit');
		});

		it('should mark children explicit if their parent is selected', () => {
			expect(sut.getState(4)).to.equal('explicit');
		});

		it('should change a parent from explicit to none if all children are deselected', () => {
			sut.setSelected(4, false);
			expect(sut.getState(1003)).to.equal('none');
		});

		it('should change a parent from explicit to indeterminate if some children are deselected', () => {
			sut.setSelected(1, true);
			sut.setSelected(111, false);
			expect(sut.getState(1)).to.equal('indeterminate');
		});

		it('should return none as state for unknown node', () => {
			expect(sut.getState('2323523')).to.equal('none');
		});
	});

	describe('addNodes and isPopulated', () => {
		it('should report isPopulated as false if no children were present at initialization', () => {
			expect(sut.isPopulated(4)).to.be.false;
		});

		it('should report isPopulated as true if children were present at initialization', () => {
			expect(sut.isPopulated(1001)).to.be.true;
		});

		it('should add the given nodes', () => {
			sut.addNodes(1001, [[991, 'new1', mockOuTypes.course], [992, 'new2', mockOuTypes.courseOffering]]);

			expect(sut.getName(991)).to.equal('new1');
			expect(sut.getName(992)).to.equal('new2');
			expect(sut.getType(991)).to.equal(mockOuTypes.course);
			expect(sut.getType(992)).to.equal(mockOuTypes.courseOffering);
			expect(sut.isOpenable(991)).to.be.true;
			expect(sut.isOpenable(992)).to.be.false;
		});

		it('should add the nodes to a previously childless parent', () => {
			sut.addNodes(4, [[991, 'new1', mockOuTypes.course], [992, 'new2', mockOuTypes.courseOffering]]);
			expect(sut.getChildIds(4).sort()).to.deep.equal([991, 992]);
			expect(sut.isPopulated(4)).to.be.true;
		});

		it('should replace existing children', () => {
			sut.addNodes(1001, [[991, 'new1', mockOuTypes.course], [992, 'new2', mockOuTypes.courseOffering]]);
			expect(sut.getChildIds(1001).sort()).to.deep.equal([991, 992]);
			expect(sut.isPopulated(1001)).to.be.true;
		});

		it('should accept an empty array', () => {
			sut.addNodes(4, []);
			expect(sut.getChildIds(4)).to.deep.equal([]);
			// Callers can use isPopulated to distinguish between an empty node and a node that needs
			// to have its children added.
			expect(sut.isPopulated(4)).to.be.true;
		});

		it('should make new children visible if there is no ancestor filter', () => {
			sut.addNodes(1001, [[991, 'bnew1', mockOuTypes.course], [992, 'anew2', mockOuTypes.courseOffering]]);
			expect(sut.getChildIdsForDisplay(1001)).to.deep.equal([992, 991]);
		});

		it('should make new children visible given an ancestor filter', () => {
			sut.setAncestorFilter([12]);
			sut.addNodes(1001, [[991, 'bnew1', mockOuTypes.course], [992, 'anew2', mockOuTypes.courseOffering]]);

			expect(sut.getChildIdsForDisplay(1001)).to.deep.equal([992, 991]);
		});

		it('should select new nodes if the parent is selected', () => {
			sut.addNodes(1003, [[991, 'new1', mockOuTypes.course], [992, 'new2', mockOuTypes.courseOffering]]);
			expect(sut.getState(991)).to.equal('explicit');
			expect(sut.getState(992)).to.equal('explicit');
		});

		it('should not select new nodes if the parent is partially selected', () => {
			sut.addNodes(1001, [[991, 'new1', mockOuTypes.course], [992, 'new2', mockOuTypes.courseOffering]]);
			expect(sut.getState(991)).to.equal('none');
			expect(sut.getState(992)).to.equal('none');
		});

		it('should not select new nodes if the parent is not selected', () => {
			sut.addNodes(1002, [[991, 'new1', mockOuTypes.course], [992, 'new2', mockOuTypes.courseOffering]]);
			expect(sut.getState(991)).to.equal('none');
			expect(sut.getState(992)).to.equal('none');
		});

		it('should set the parent of new nodes', () => {
			sut.addNodes(1001, [[991, 'new1', mockOuTypes.course], [992, 'new2', mockOuTypes.courseOffering]]);
			expect(sut.getParentIds(991)).to.deep.equal([1001]);
			expect(sut.getParentIds(992)).to.deep.equal([1001]);
		});

		it('should add the new parent to existing nodes', () => {
			sut.addNodes(1001, [[4, 'already a child of 1003', mockOuTypes.course], [992, 'new2', mockOuTypes.courseOffering]]);
			expect(sut.getParentIds(4).sort()).to.deep.equal([1001, 1003]);
			expect(sut.getParentIds(992)).to.deep.equal([1001]);
		});

		it('should report the correct ancestors for a new node', () => {
			sut.addNodes(3, [[991, 'new1', mockOuTypes.course], [992, 'new2', mockOuTypes.courseOffering]]);
			assertSetsAreEqual(sut.getAncestorIds(991), new Set([1001, 1002, 3, 6606, 991]));
		});

		it('should report the correct ancestors for descendants of a node with a new parent', () => {
			sut.addNodes(1003, [[1, 'already a child of 1001', mockOuTypes.course], [992, 'new2', mockOuTypes.courseOffering]]);
			assertSetsAreEqual(sut.getAncestorIds(1), new Set([1, 1001, 1003, 6606]));
			assertSetsAreEqual(sut.getAncestorIds(112), new Set([112, 1, 1001, 1003, 12, 6606]));
		});
	});

	describe('getAncestorIds', () => {
		it('builds the ancestors map correctly', () => {
			const expectedAncestorsMap = {
				6606: [6606],
				1001: [1001, 6606],
				1002: [1002, 6606],
				1003: [1003, 6606],
				1: [1, 1001, 6606],
				2: [2, 1001, 6606],
				3: [3, 1001, 1002, 6606],
				4: [4, 1003, 6606],
				11: [11, 6606],
				12: [12, 6606],
				13: [13, 6606],
				111: [111, 1, 11, 1001, 6606],
				112: [112, 1, 12, 1001, 6606],
				211: [211, 2, 11, 1001, 6606],
				312: [312, 3, 12, 1001, 1002, 6606]
			};

			Object.keys(expectedAncestorsMap).forEach((id) => {
				const expectedAncestors = new Set(expectedAncestorsMap[id]);
				const actualAncestors = sut.getAncestorIds(Number(id));
				assertSetsAreEqual(actualAncestors, expectedAncestors);
			});
		});

		it('should not throw if an org unit has no parents', () => {
			new Tree({ nodes: [
				[6606, 'Org', mockOuTypes.organization, [0]],
				[1001, 'Department 1', mockOuTypes.department, null],
				[1002, 'Department 2', mockOuTypes.department, [6606]]
			] });
		});

		it('returns [id] if an orgUnit was not in the map', () => {
			assertSetsAreEqual(sut.getAncestorIds(12345), new Set([12345]));
		});

		it('returns an empty set for id 0', () => {
			assertSetsAreEqual(sut.getAncestorIds(0), new Set());
		});
	});

	describe('getChildIdsForDisplay and setAncestorFilter', () => {
		it('returns sorted children', () => {
			expect(sut.getChildIdsForDisplay(1001)).to.deep.equal([1, 2, 3]);
		});

		it('returns empty if the node had no children on initialization', () => {
			expect(sut.getChildIdsForDisplay(4)).to.deep.equal([]);
		});

		it('excludes nodes of invisible type', () => {
			expect(sut.getChildIdsForDisplay(6606)).to.deep.equal([1001, 1002, 1003 /* semesters omitted */]);
		});

		it('lists leaf nodes only if they match the ancestor filter', () => {
			sut.setAncestorFilter([12]);
			expect(sut.getChildIdsForDisplay(1)).to.deep.equal([112]);
		});

		it('lists non-leaf nodes only if they contain leaf nodes matching the ancestor filter', () => {
			sut.setAncestorFilter([12]);
			expect(sut.getChildIdsForDisplay(1001)).to.deep.equal([1, 3]);
		});

		it('applies ancestor filter from constructor', () => {
			const tree = new Tree({ nodes, invisibleTypes, ancestorIds: [12] });
			expect(tree.getChildIdsForDisplay(1001)).to.deep.equal([1, 3]);
		});

		it('clears the ancestor filter when given an empty list', () => {
			const tree = new Tree({ nodes, invisibleTypes, ancestorIds: [12] });
			tree.setAncestorFilter([]);
			expect(sut.getChildIdsForDisplay(1001)).to.deep.equal([1, 2, 3]);
		});

		it('clears the ancestor filter when given null', () => {
			const tree = new Tree({ nodes, invisibleTypes, ancestorIds: [12] });
			tree.setAncestorFilter(null);
			expect(sut.getChildIdsForDisplay(1001)).to.deep.equal([1, 2, 3]);
		});
	});

	describe('getName', () => {
		it('returns the node name', () => {
			expect(sut.getName(1)).to.equal('Course 1');
		});

		it('returns an empty string if the node has no name', () => {
			expect(sut.getName(4)).to.equal('');
		});

		it('returns an empty string for unknown nodes', () => {
			expect(sut.getName(864343)).to.equal('');
		});
	});

	describe('getParentIds', () => {
		it('returns the parent ids', () => {
			expect(sut.getParentIds(3).sort()).to.deep.equal([1001, 1002]);
		});

		it('returns an empty array if the node has no parents', () => {
			expect(sut.getParentIds(-100)).to.deep.equal([]);
		});

		it('returns an empty array if the node is unknown', () => {
			expect(sut.getParentIds(864343)).to.deep.equal([]);
		});
	});

	describe('getType', () => {
		it('returns the node type', () => {
			expect(sut.getType(1)).to.equal(mockOuTypes.course);
		});

		it('returns 0 if the node has no type', () => {
			expect(sut.getType(-100)).to.equal(0);
		});

		it('returns 0 for unknown nodes', () => {
			expect(sut.getType(73548)).to.equal(0);
		});
	});

	describe('hasAncestorsInList', () => {
		it('returns false if passed in orgUnit is not in the ancestors list', () => {
			expect(sut.hasAncestorsInList(12345, [6606])).to.be.false;
		});

		it('returns false if orgUnit is not in the list to check', () => {
			expect(sut.hasAncestorsInList(1001, [1002, 1003])).to.be.false;
		});

		it('returns false if orgUnit has no ancestors in the list to check', () => {
			expect(sut.hasAncestorsInList(1, [1002, 1003])).to.be.false;
		});

		it('returns true if orgUnit is in the list to check', () => {
			expect(sut.hasAncestorsInList(1001, [1001, 1002])).to.be.true;
		});

		it('returns true if orgUnit has ancestors in the list to check', () => {
			expect(sut.hasAncestorsInList(1, [1001, 1002])).to.be.true;
		});
	});

	describe('isOpenable', () => {
		it('should return true for a node that is not a leaf type', () => {
			expect(sut.isOpenable(1)).to.be.true;
		});

		it('should return false for a node that is a leaf type', () => {
			expect(sut.isOpenable(111)).to.be.false;
		});

		it('should return some boolean if the node is unknown (no error)', () => {
			expect(sut.isOpenable(2352235)).to.be.a('Boolean');
		});
	});
});

describe('d2l-insights-tree-filter', () => {
	let el;
	function node(id) {
		return el.shadowRoot.querySelector(`d2l-insights-tree-selector-node[data-id="${id}"]`);
	}
	beforeEach(async() => {
		const tree = new Tree({
			nodes: [
				[1, 'Course 1', 3, [3, 4]],
				[2, 'Course 2', 3, [3, 4]],
				[3, 'Department 1', 2, [5]],
				[5, 'Faculty 1', 7, [6607]],
				[6, 'Course 3', 3, [7, 4]],
				[7, 'Department 2', 2, [5]],
				[8, 'Course 4', 3, [5]],
				[9, 'Course 5', 3, [5]],
				[10, 'Faculty 2', 7, [6607]],
				[6607, 'Dev', 1, [0]]
			],
			selectedIds: [1, 2, 7],
			leafTypes: [3]
		});
		tree.setOpen(5, true);
		tree.setOpen(7, true);

		el = await fixture(
			html`<d2l-insights-tree-filter
				opener-text="filter"
				opener-text-selected="filter with selections"
				.tree="${tree}"
			></d2l-insights-tree-filter>`
		);
		await el.treeUpdateComplete;
	});

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-tree-selector-node');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should render with opener-text if no items are selected', async() => {
			const treeWithNoSelections = new Tree({ nodes: [
				[1, 'Course 1', 3, [3], [], 'none', false],
				[3, 'Department 1', 2, [5], [1], 'none', false],
				[5, 'Faculty 1', 7, [6607], [3], 'none', false],
				[6607, 'Dev', 1, [0], [5], 'none', false]
			], selectedIds: [], leafTypes: [3] });

			el = await fixture(
				html`<d2l-insights-tree-filter
				opener-text="filter"
				opener-text-selected="filter with selections"
				.tree="${treeWithNoSelections}"
			></d2l-insights-tree-filter>`
			);
			await el.treeUpdateComplete;

			const treeSelector = el.shadowRoot.querySelector('d2l-insights-tree-selector');
			expect(treeSelector.name).to.equal('filter');
		});

		it('should render with opener-text-selected if any items are selected', () => {
			const treeSelector = el.shadowRoot.querySelector('d2l-insights-tree-selector');
			expect(treeSelector.name).to.equal('filter with selections');
		});

		it('should render with opener-text-selected if all items are deselected but initial selections are not reset', async() => {
			const treeSelector = el.shadowRoot.querySelector('d2l-insights-tree-selector');
			node(3).simulateCheckboxClick();
			await el.treeUpdateComplete;

			node(7).simulateCheckboxClick();
			await el.treeUpdateComplete;

			expect(el.selected).to.deep.equal([]);
			expect(treeSelector.name).to.equal('filter with selections');
		});

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

		it('should return the list of open node ids', async() => {
			node(3).simulateArrowClick();
			await el.treeUpdateComplete;
			expect(el.tree.open.sort()).to.deep.equal([3, 5, 7]);
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

		it('should replace descendants in selection when ancestor selected', async() => {
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

		it('should fire d2l-insights-tree-filter-request-children on open of childless node', async() => {
			const listener = oneEvent(el, 'd2l-insights-tree-filter-request-children');
			node(10).simulateArrowClick();
			const event = await listener;
			expect(event.type).to.equal('d2l-insights-tree-filter-request-children');
			expect(event.target).to.equal(el);
			expect(event.detail.id).to.equal(10);
		});
	});
});
