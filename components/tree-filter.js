import 'array-flat-polyfill';
import './tree-selector.js';

import { action, computed, decorate, observable } from 'mobx';
import { css, html } from 'lit-element/lit-element.js';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';

// array indices
export const ID = 0;
export const NAME = 1;
export const TYPE = 2;
export const PARENTS = 3;
export const CHILDREN = 4;
export const STATE = 5;
export const OPEN = 6;

export class Tree {
	/**
	 * @param tree - a map from ids to arrays, each of which has fields defined by the above constants; may be modified at any time
	 * @param selectedIds - array of ids which are selected initially (won't be modified)
	 * @param leafTypes - array of values in the TYPE column; nodes of these types cannot be expanded
	 */
	constructor(tree, selectedIds, leafTypes) {
		this.tree = tree;
		this.leafTypes = leafTypes;
		selectedIds.forEach(x => this.setSelected(x, true));
	}

	get rootId() {
		const rootOrgUnit = Object.values(this.tree).find(x => this._isRoot(x));
		return rootOrgUnit && rootOrgUnit[ID];
	}

	get selected() {
		return this._getSelected(this.rootId);
	}

	getChildren(id) {
		// coming soon: handle truncation case (getChildren has a callback which calls LMS)
		if (!id) id = this.rootId;
		if (!id) return [];

		return this.tree[id][CHILDREN]
			.map(id => this.tree[id])
			.sort((a, b) => this._nameForSort(a).localeCompare(this._nameForSort(b)));
	}

	setOpen(id, isOpen) {
		this.tree[id][OPEN] = isOpen;
	}

	getMatching(searchString) {
		return Object.values(this.tree).filter(x =>
			!this._isRoot(x) && this._nameForSort(x) && this._nameForSort(x).toLowerCase().includes(searchString.toLowerCase())
		);
	}

	setSelected(id, isSelected) {
		const node = this.tree[id];
		if (!node) return;

		// clicking on a node either fully selects or fully deselects its entire subtree
		this._setSubtreeSelected(id, isSelected);

		// parents may now be in any state, depending on siblings
		node[PARENTS].forEach(parentId => this._updateSelected(parentId));
	}

	_getSelected(id) {
		const node = this.tree[id];
		if (!node) return [];

		if (node[STATE] === 'explicit') return [id];

		if (node[STATE] === 'indeterminate' || this._isRoot(node)) return node[CHILDREN].flatMap(childId => this._getSelected(childId));

		return [];
	}

	_setSubtreeSelected(id, isSelected) {
		const node = this.tree[id];
		if (!node) return;

		node[STATE] = isSelected ? 'explicit' : 'none';

		node[CHILDREN].forEach(childId => this._setSubtreeSelected(childId, isSelected));
	}

	_isRoot(x) {
		return x[PARENTS].includes(0);
	}

	_nameForSort(x) {
		return x[NAME] + x[ID];
	}

	_updateSelected(id) {
		const node = this.tree[id];
		// never select the root (user can clear the selection instead)
		if (!node || this._isRoot(node)) return;

		node[STATE] = node[CHILDREN].every(childId => this.tree[childId][STATE] === 'explicit')
			? 'explicit'
			: node[CHILDREN].every(childId => this.tree[childId][STATE] === 'none')
				? 'none'
				: 'indeterminate' ;

		node[PARENTS].forEach(parentId => this._updateSelected(parentId));
	}
}

decorate(Tree, {
	tree: observable,
	rootId: computed,
	selected: computed,
	setOpen: action,
	setSelected: action
});

/**
 * This is an opinionated wrapper around d2l-insights-tree-selector which maintains state
 * in the above Tree class.
 * @property {Object} tree - a Tree (defined above)
 * @property {String} name - appears on the dropdown opener
 * @fires d2l-insights-tree-filter-select - selection has changed; selected property of this element is the list of selected ids
 */
class TreeFilter extends Localizer(MobxLitElement) {

	static get properties() {
		return {
			tree: { type: Object, attribute: false },
			name: { type: String },
			searchString: { type: String, attribute: 'search-string', reflect: true }
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

		this.name = 'MISSING NAME';
		this.searchString = '';

		this._needResize = false;
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

	render() {
		return html`<d2l-insights-tree-selector
				name="${this.name}"
				?search="${this._isSearch}"
				@d2l-insights-tree-selector-search="${this._onSearch}"
			>
				${this._renderSearchResults()}
				${this._renderChildren()}
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
		return this.tree
			.getChildren(id)
			.map(x => this._renderNode(x, parentName, indentLevel + 1));
	}

	_renderNode(x, parentName, indentLevel) {
		const isOpen = x[OPEN];
		return html`<d2l-insights-tree-selector-node slot="tree"
					name="${this.localize('components.tree-filter.node-name', { orgUnitName: x[NAME], id: x[ID] })}"
					data-id="${x[ID]}"
					?openable="${!this.tree.leafTypes.includes(x[TYPE])}"
					?open="${isOpen}"
					selected-state="${x[STATE]}"
					indent-level="${indentLevel}"
					parent-name="${parentName}"
					@d2l-insights-tree-selector-node-open="${this._onOpen}"
					@d2l-insights-tree-selector-node-select="${this._onSelect}"
				>
					${isOpen ? this._renderChildren(x[ID], x[NAME], indentLevel) : ''}
				</d2l-insights-tree-selector-node>`;
	}

	_renderSearchResults() {
		if (!this._isSearch) return html``;

		return this.tree
			.getMatching(this.searchString)
			.map(x => html`<d2l-insights-tree-selector-node slot="search-results"
				name="${this.localize('components.tree-filter.node-name', { orgUnitName: x[NAME], id: x[ID] })}"
				data-id="${x[ID]}"
				selected-state="${x[STATE]}"
				@d2l-insights-tree-selector-node-select="${this._onSelect}"
			>
			</d2l-insights-tree-selector-node>`);
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
}
customElements.define('d2l-insights-tree-filter', TreeFilter);
