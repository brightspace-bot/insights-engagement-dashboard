import './tree-selector.js';

import 'array-flat-polyfill';
import { action, computed, decorate, observable } from 'mobx';
import { css, html } from 'lit-element/lit-element.js';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';

// node array indices
export const ID = 0; // unique node identifier (Number)
export const NAME = 1; // node name (String)
export const TYPE = 2; // Number
export const PARENTS = 3; // array of parent ids (Number); a node with parent 0 is the root

export class Tree {
	/**
	 * Type to use as the .tree property of a d2l-insights-tree-filter. Mutator methods will
	 * trigger re-rendering as needed. Call as new Tree({}) for a default empty tree.
	 * NB: this is actually a DAG, not a tree. :)
	 * @param {[][]} [nodes=[]] - Array of arrays, each with elements for each of the above constants
	 * @param {Number[]} [leafTypes=[]] - TYPE values that cannot be opened
	 * @param {Number[]} [invisibleTypes=[]] - TYPE values that should not be rendered
	 * @param {Number[]} [selectedIds] - ids to mark selected. Ancestors and descendants will be marked accordingly.
	 * @param {Number[]} [ancestorIds] - same as if passed to setAncestorFilter
	 * @param {Tree} [oldTree] - tree to copy previous state from (e.g. which nodes are open)
	 * @param {Boolean} isDynamic - if true, the tree is assumed to be incomplete, and tree-filter will fire events as needed
	 * to request children
	 * @param {Map}[extraChildren] - Map from parent node ids to arrays of nodes; these will be added to the tree before
	 * any selections are applied and the parents marked as populated. Useful for adding cached lookups to a dynamic tree.
	 */
	constructor({
		nodes = [],
		leafTypes = [],
		invisibleTypes = [],
		selectedIds,
		ancestorIds,
		oldTree,
		isDynamic = false,
		extraChildren
	}) {
		this.leafTypes = leafTypes;
		this.invisibleTypes = invisibleTypes;
		this.initialSelectedIds = selectedIds;
		this._nodes = new Map(nodes.map(x => [x[ID], x]));
		this._children = new Map();
		this._ancestors = new Map();
		this._state = new Map();
		this._open = oldTree ? new Set(oldTree.open) : new Set();
		// null for no filter, vs. empty Set() when none match
		this._visible = null;
		this._populated = isDynamic ? new Set() : null;

		// fill in children (parents are provided by the caller, and ancestors will be generated on demand)
		this._updateChildren(this.ids);

		if (extraChildren) {
			extraChildren.forEach((children, orgUnitId) => {
				this.addNodes(orgUnitId, children);
			});
		}

		if (selectedIds) {
			selectedIds.forEach(x => this.setSelected(x, true));
		}

		if (ancestorIds) {
			this.setAncestorFilter(ancestorIds);
		}
	}

	get ids() {
		return [...this._nodes.values()].map(x => x[ID]);
	}

	get isDynamic() {
		return !!this._populated;
	}

	get open() {
		return [...this._open];
	}

	get rootId() {
		if (!this._rootId) {
			this._rootId = this.ids.find(x => this._isRoot(x));
		}
		return this._rootId;
	}

	get selected() {
		return this._getSelected(this.rootId);
	}

	/**
	 * Adds nodes as children of the given parent. New nodes will be selected if the parent is.
	 * The parents of the new nodes will be set to the given parent plus any previous parents (if the node
	 * was already in the tree). The new nodes are assumed to match the ancestorFilter, if any;
	 * future changes to that filter are not supported (i.e. it is assumed the caller will reload data
	 * and create a new tree in that case). See also note on setAncestorFilter().
	 * @param {number} parentId The parent of the new nodes. The new nodes *replace* any existing children.
	 * @param newChildren Array of nodes to be added to the tree; name and type will be updated if the id already exists.
	 */
	addNodes(parentId, newChildren) {
		const parent = this._nodes.get(parentId);
		if (!parent) return;

		// add parentId to any existing parents of these nodes (before replacing the nodes and losing this info)
		newChildren.forEach(x => {
			const existingParents = this.getParentIds(x[ID]);
			const allParents = new Set([parentId, ...existingParents]);
			x[PARENTS] = [...allParents];
		});
		newChildren.forEach(x => this._nodes.set(x[ID], x));

		// replace all of parent's children
		this._children.set(parentId, new Set(newChildren.map(x => x[ID])));

		// caller should only provide visible nodes
		if (this._visible) {
			newChildren.forEach(x => this._visible.add(x[ID]));
		}
		if (this.getState(parentId) === 'explicit') {
			newChildren.forEach(x => this._state.set(x[ID], 'explicit'));
		}

		// Ancestors may need updating: if one or more of newChildren was already present (due to
		// being added under another parent), then they may also have been opened and have descendants,
		// which now need a new ancestor.
		// For simplicity and correctness, we simply reset the ancestors map, which will be
		// regenerated as needed by getAncestorIds.
		this._ancestors = new Map();

		if (this._populated) {
			this._populated.add(parentId);
		}
	}

	/**
	 * Merges the given nodes into the tree.
	 * @param {[][]} [nodes=[]] - Array of arrays, including all ancestors up to root, in the same format as for the constructor
	 */
	addTree(nodes) {
		nodes.forEach(x => this._nodes.set(x[ID], x));

		// invariant: the tree must always contain all ancestors of all nodes.
		// This means existing nodes cannot be new children of any node: we only need to update children for parents of new nodes.
		this._updateChildren(nodes.map(x => x[ID]));

		// Set selected state for ancestors and descendants if a new node should be selected because its
		// parent is.
		// This could perform poorly if the tree being merged in is large and deep, but in the expected use case
		// (search with load more), we should only be adding a handful of nodes at a time.
		nodes.forEach(node => {
			if (node[PARENTS].some(parentId => this.getState(parentId) === 'explicit')) {
				this.setSelected(node[ID], true);
			}
		});

		// caller should only provide visible nodes
		if (this._visible) {
			nodes.forEach(x => this._visible.add(x[ID]));
		}

		// refresh ancestors
		this._ancestors = new Map();
	}

	getAncestorIds(id) {
		if (id === 0) return new Set();

		if (!this._ancestors.has(id)) {
			const ancestors = new Set([
				id,
				...this.getParentIds(id).flatMap(x => [...this.getAncestorIds(x)])
			]);
			this._ancestors.set(id, ancestors);
		}

		return this._ancestors.get(id);
	}

	getChildIdsForDisplay(id) {
		return this.getChildIds(id)
			.filter(x => this._isVisible(x))
			.sort((a, b) => this._nameForSort(a).localeCompare(this._nameForSort(b)));
	}

	getChildIds(id) {
		if (!id) id = this.rootId;
		if (!id) return [];
		const children = this._children.get(id);
		return children ? [...children] : [];
	}

	getMatchingIds(searchString) {
		return this.ids
			.filter(x => this._isVisible(x))
			.filter(x => !this._isRoot(x) && this._nameForSort(x).toLowerCase().includes(searchString.toLowerCase()))
			// reverse order by id so the order is consistent and (most likely) newer items are on top
			.sort((x, y) => y - x);
	}

	getName(id) {
		const node = this._nodes.get(id);
		return (node && node[NAME]) || '';
	}

	getParentIds(id) {
		const node = this._nodes.get(id);
		return (node && node[PARENTS]) || [];
	}

	getState(id) {
		return this._state.get(id) || 'none';
	}

	getType(id) {
		const node = this._nodes.get(id);
		return (node && node[TYPE]) || 0;
	}

	/**
	 * Checks if a node has ancestors in a given list.
	 * NOTE: returns true if the node itself is in the list.
	 * @param {Number} id - the node whose ancestors we want to check
	 * @param {[Number]} listToCheck - an array of node ids which potentially has ancestors in it
	 * @returns {boolean}
	 */
	hasAncestorsInList(id, listToCheck) {
		const ancestorsSet = this.getAncestorIds(id);

		return listToCheck.some(potentialAncestor => ancestorsSet.has(potentialAncestor));
	}

	isOpen(id) {
		return this._open.has(id);
	}

	isOpenable(id) {
		return !this.leafTypes.includes(this.getType(id));
	}

	/**
	 * True iff the children of id are known (even if there are zero children).
	 * @param id
	 * @returns {boolean}
	 */
	isPopulated(id) {
		return !this._populated || this._populated.has(id);
	}

	/**
	 * Filters the visible tree to nodes which are ancestors of nodes descended from the given ids
	 * (a node is its own ancestor).
	 * NB: ignored if the tree is dynamic, so that dynamically loaded partial trees don't get
	 * hidden due to missing information. It is expected that dynamic trees only include visible
	 * nodes, and that the tree will be replaced if the ancestor filter should change.
	 * @param {Number[]} ancestorIds
	 */
	setAncestorFilter(ancestorIds) {
		if (this.isDynamic) return;

		if (!ancestorIds || ancestorIds.length === 0) {
			this._visible = null;
			return;
		}

		this._visible = new Set();

		this.ids.forEach(id => {
			if (this.hasAncestorsInList(id, ancestorIds)) {
				this._visible.add(id);
				this.getAncestorIds(id).forEach(ancestorId => this._visible.add(ancestorId));
			}
		});
	}

	setOpen(id, isOpen) {
		if (isOpen) {
			this._open.add(id);
		} else {
			this._open.delete(id);
		}
	}

	setSelected(id, isSelected) {
		// clicking on a node either fully selects or fully deselects its entire subtree
		this._setSubtreeSelected(id, isSelected);

		// parents may now be in any state, depending on siblings
		this.getParentIds(id).forEach(parentId => this._updateSelected(parentId));
	}

	_getSelected(id) {
		const state = this.getState(id);

		if (state === 'explicit') return [id];

		if (state === 'indeterminate' || this._isRoot(id)) {
			return this.getChildIds(id).flatMap(childId => this._getSelected(childId));
		}

		return [];
	}

	_isRoot(id) {
		return this.getParentIds(id).includes(0);
	}

	_isVisible(id) {
		return (this._visible === null || this._visible.has(id))
			&& !this.invisibleTypes.includes(this.getType(id));
	}

	_nameForSort(id) {
		return this.getName(id) + id;
	}

	_setSubtreeSelected(id, isSelected) {
		if (isSelected) {
			this._state.set(id, 'explicit');
		} else {
			this._state.delete(id);
		}

		this.getChildIds(id).forEach(childId => this._setSubtreeSelected(childId, isSelected));
	}

	_updateChildren(ids) {
		ids.forEach(id => {
			this.getParentIds(id).forEach(parentId => {
				if (this._children.has(parentId)) {
					this._children.get(parentId).add(id);
				} else {
					this._children.set(parentId, new Set([id]));
				}
			});
		});
	}

	_updateSelected(id) {
		// never select the root (user can clear the selection instead)
		if (this._isRoot(id)) return;

		// don't select invisible node types
		if (this.invisibleTypes.includes(this.getType(id))) return;

		// Only consider children of visible types: this node is selected if all potentially visible children are
		// Note that if this node hasn't been populated, we don't know if all children are selected,
		// so it is indeterminate at most.
		const childIds = this.getChildIds(id).filter(x => !this.invisibleTypes.includes(this.getType(x)));
		const state = (this.isPopulated(id) && childIds.every(childId => this.getState(childId) === 'explicit'))
			? 'explicit'
			: childIds.every(childId => this.getState(childId) === 'none')
				? 'none'
				: 'indeterminate' ;

		if (state === 'none') {
			this._state.delete(id);
		} else {
			this._state.set(id, state);
		}

		this.getParentIds(id).forEach(x => this._updateSelected(x));
	}
}

decorate(Tree, {
	_nodes: observable,
	_children: observable,
	_ancestors: observable,
	_state: observable,
	_open: observable,
	_visible: observable,
	_populated: observable,
	selected: computed,
	addNodes: action,
	setAncestorFilter: action,
	setOpen: action,
	setSelected: action
});

/**
 * This is an opinionated wrapper around d2l-insights-tree-selector which maintains state
 * in the above Tree class.
 * @property {Object} tree - a Tree (defined above)
 * @property {String} openerText - appears on the dropdown opener if no items are selected
 * @property {String} openerTextSelected - appears on the dropdown opener if one or more items are selected
 * @fires d2l-insights-tree-filter-select - selection has changed; selected property of this element is the list of selected ids
 * @fires d2l-insights-tree-filter-request-children - (dynamic tree only) owner should call tree.addNodes with children of event.detail.id
 * @fires d2l-insights-tree-filter-search - (dynamic tree only) owner may call this.addSearchResults with nodes and ancestors matching
 * event.detail.searchString and event.detail.bookmark (arbitrary data previously passed to this.addSearchResults)
 */
class TreeFilter extends Localizer(MobxLitElement) {

	static get properties() {
		return {
			tree: { type: Object, attribute: false },
			openerText: { type: String, attribute: 'opener-text' },
			openerTextSelected: { type: String, attribute: 'opener-text-selected' },
			searchString: { type: String, attribute: 'search-string', reflect: true },
			isLoadMoreSearch: { type: Boolean, attribute: 'load-more-search', reflect: true },
			_loadingParent: { type: Boolean, attribute: false },
			_isLoadingSearch: { type: Boolean, attribute: false }
		};
	}

	static get styles() {
		return css`
			:host {
				display: inline-block;
			}
			:host([hidden]) {
				display: none;
			}
		`;
	}

	constructor() {
		super();

		this.openerText = 'MISSING NAME';
		this.openerTextSelected = 'MISSING NAME';
		this.searchString = '';
		this.isLoadMoreSearch = false;

		this._needResize = false;
		this._searchBookmark = null;
	}

	get selected() {
		return this.tree.selected;
	}

	/**
	 * @returns {Promise} - resolves when all tree-selector-nodes, recursively, have finished updating
	 */
	get treeUpdateComplete() {
		return this.updateComplete.then(() => this.shadowRoot.querySelector('d2l-insights-tree-selector').treeUpdateComplete);
	}

	/**
	 * Adds the given children to the given parent. See Tree.addNodes().
	 * @param parent
	 * @param children
	 */
	addChildren(parent, children) {
		this._needResize = true;
		this.tree.addNodes(parent, children);
		this._loadingParent = null;
	}

	/**
	 * Merges the given nodes into the tree and may display a load more control.
	 * @param {[][]} [nodes=[]] - Array of arrays, including all ancestors up to root, in the same format as for the constructor
	 * @param {Boolean}hasMore - Will display a "load more" button in the search if true
	 * @param {Object}bookmark - Opaque data that will be sent in the search event if the user asks to load more results
	 */
	addSearchResults(nodes, hasMore, bookmark) {
		this._needResize = true;
		this.tree.addTree(nodes);
		this.isLoadMoreSearch = hasMore;
		this._searchBookmark = bookmark;
		this._isLoadingSearch = false;
	}

	render() {
		// if selections are applied when loading from server but the selected ids were truncated out of the results,
		// the visible selections in the UI (this.tree.selected) could be empty even though selections are applied.
		// In that case, we should indicate to the user that selections are applied, even if they can't see them.
		const openerText = (this.tree.selected.length || (this.tree.initialSelectedIds && this.tree.initialSelectedIds.length))
			? this.openerTextSelected
			: this.openerText;

		return html`<d2l-insights-tree-selector
				name="${openerText}"
				?search="${this._isSearch}"
				@d2l-insights-tree-selector-search="${this._onSearch}"
			>
				${this._renderSearchResults()}
				${this._renderSearchLoadingControls()}
				${this._renderChildren(this.tree.rootId)}
			</d2l-insights-tree-selector>
		</div>`;
	}

	async resize() {
		await this.updateComplete;
		const treeSelector = this.shadowRoot.querySelector('d2l-insights-tree-selector');
		treeSelector && treeSelector.resize();
	}

	async updated() {
		if (!this._needResize) return;

		await this.resize();
		this._needResize = false;
	}

	get _isSearch() {
		return this.searchString.length > 0;
	}

	_renderChildren(id, parentName, indentLevel = 0) {
		parentName = parentName || this.localize('components.tree-filter.node-name.root');

		if (!this.tree.isPopulated(id)) {
			// request children; in the meantime we can render whatever we have
			this._requestChildren(id);
		}

		return [
			...this.tree
				.getChildIdsForDisplay(id)
				.map(id => this._renderNode(id, parentName, indentLevel + 1)),

			this._loadingParent === id ? this._renderLoadingIndicator() : ''
		];
	}

	_renderNode(id, parentName, indentLevel) {
		const isOpen = this.tree.isOpen(id);
		const isOpenable = this.tree.isOpenable(id);
		const orgUnitName = this.tree.getName(id);
		const state = this.tree.getState(id);
		return html`<d2l-insights-tree-selector-node slot="tree"
					name="${this.localize('components.tree-filter.node-name', { orgUnitName, id })}"
					data-id="${id}"
					?openable="${isOpenable}"
					?open="${isOpen}"
					selected-state="${state}"
					indent-level="${indentLevel}"
					parent-name="${parentName}"
					@d2l-insights-tree-selector-node-open="${this._onOpen}"
					@d2l-insights-tree-selector-node-select="${this._onSelect}"
				>
					${isOpen ? this._renderChildren(id, orgUnitName, indentLevel) : ''}
				</d2l-insights-tree-selector-node>`;
	}

	_renderLoadingIndicator() {
		return html`<d2l-loading-spinner slot="tree"></d2l-loading-spinner>`;
	}

	_renderSearchLoadingControls() {
		if (this._isSearch && this._isLoadingSearch) {
			return html`<d2l-loading-spinner slot="search-results"></d2l-loading-spinner>`;
		}

		if (this._isSearch && this.isLoadMoreSearch)  {
			return html`<d2l-button slot="search-results"
				@click="${this._onSearchLoadMore}"
			>Load More</d2l-button>`;
		}

		return html``;
	}

	_renderSearchResults() {
		if (!this._isSearch) return html``;

		return this.tree
			.getMatchingIds(this.searchString)
			.map(id => {
				const orgUnitName = this.tree.getName(id);
				const state = this.tree.getState(id);
				return html`<d2l-insights-tree-selector-node slot="search-results"
					name="${this.localize('components.tree-filter.node-name', { orgUnitName, id })}"
					data-id="${id}"
					selected-state="${state}"
					@d2l-insights-tree-selector-node-select="${this._onSelect}"
				>
				</d2l-insights-tree-selector-node>`;
			});
	}

	_onOpen(event) {
		event.stopPropagation();
		this._needResize = true;
		this.tree.setOpen(event.detail.id, event.detail.isOpen);
	}

	_onSearch(event) {
		event.stopPropagation();
		this._needResize = true;
		this.searchString = event.detail.value;

		if (this.tree.isDynamic) {
			this._fireSearchEvent(this.searchString);
		}
	}

	_onSearchLoadMore(event) {
		event.stopPropagation();
		this._fireSearchEvent(this.searchString, this._searchBookmark);
	}

	_fireSearchEvent(searchString, bookmark) {
		this._isLoadingSearch = true;

		/**
		 * @event d2l-insights-tree-filter-search
		 */
		this.dispatchEvent(new CustomEvent(
			'd2l-insights-tree-filter-search',
			{
				bubbles: true,
				composed: false,
				detail: { searchString, bookmark }
			}
		));
	}

	_onSelect(event) {
		event.stopPropagation();
		this.tree.setSelected(event.detail.id, event.detail.isSelected);

		/**
		 * @event d2l-insights-tree-filter-select
		 */
		this.dispatchEvent(new CustomEvent(
			'd2l-insights-tree-filter-select',
			{ bubbles: true, composed: false }
		));
	}

	_requestChildren(id) {
		this._loadingParent = id;

		/**
		 * @event d2l-insights-tree-filter-request-children
		 */
		this.dispatchEvent(new CustomEvent(
			'd2l-insights-tree-filter-request-children',
			{
				bubbles: true,
				composed: false,
				detail: { id }
			}
		));
	}
}
customElements.define('d2l-insights-tree-filter', TreeFilter);
