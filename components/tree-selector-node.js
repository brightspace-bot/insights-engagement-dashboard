import '@brightspace-ui/core/components/icons/icon.js';
import '@brightspace-ui/core/components/inputs/input-checkbox';

import {css, html, LitElement} from 'lit-element/lit-element.js';

/**
 * @property {string} name
 * @property {{name: string, tree:{}[], getTree: function, isOpen: boolean, selectedState: string}[]} tree - used to initialize, but will not be updated
 * @property {function} getTree - async callback which should return the tree (provide either tree or getTree)
 * @property {boolean} isOpen
 * @property {string} selectedState - may be "explicit", "implicit", "indeterminate", or "none"
 * @fires d2l-insights-tree-selector-change - value of this.selected has changed
 *
 * Note on selected-state
 * - "none" is a node that is not selected and has no selected descendents
 * - "indeterminate" is a node that has some selected descendants, but not all of them
 * - "implicit" is a node that is selected only because it has an ancestor that is selected
 * - "explicit" is a node that will be returned by the this.selected; it is selected for one of three reasons:
 *   1. The user clicked on it to select it.
 *   2. The user selected all of its descendants. So if all courses in dept1 are selected, the tree-selector
 *      marks them all as implicit and marks dept1 as explicitly selected.
 *   3. When a node was explicitly selected, the user clicked to deselect one of its children; all siblings are then
 *      marked as explicitly selected. So if dept1 is selected and the user unchecks course1, then course2, course3,
 *      etc. are explicitly selected.
 */
class TreeSelectorNode extends LitElement {
	static get properties() {
		return {
			name: { type: String },
			tree: { type: Object, attribute: false },
			getTree: { type: Object, attribute: false },
			isOpen: { type: Boolean, reflect: true, attribute: 'open' },
			selectedState: { type: String, reflect: true, attribute: 'selected-state' },
			isRoot: { type: Boolean, reflect: true, attribute: 'root' }
		};
	}

	static get styles() {
		return css`
			:host {
				display: block;
			}
			:host([hidden]) {
				display: none;
			}
			
			.node {
				display: flex;
				flex-wrap: nowrap;
			}
			
			d2l-input-checkbox {
				display: inline-block;
			}
			
			.no-open-control {
				margin-left: 33px;
			}
			.open-control {
				margin-left: 15px;
			}
			.open-control .open {
				display: none;
			}
			.open-control[open] .open {
				display: inline-block;
			}
			.open-control[open] .closed {
				display: none;
			}
			
			.subtree {
				margin-left: 30px;
			}
			.subtree[root] {
				margin-left: 0px;
			}
			.subtree[hidden] {
				display: none;
			}
		`;
	}

	constructor() {
		super();

		this.isOpen = false;
		this.selectedState = 'none';
	}

	get selected() {
		if (this.selectedState === 'explicit') {
			return [this];
		}

		return this._domChildren.flatMap(x => x.selected);
	}

	render() {
		return html`
			${this._renderNode()}
			${this._renderSubtree()}
		`;
	}

	_renderNode() {
		if (this.isRoot) {
			return html``;
		}

		return html`
			<div class="node">
				${this._renderOpenControl()}
				<d2l-input-checkbox
					?checked="${this._showSelected}"
					?indeterminate="${this._showIndeterminate}"
					@change="${this._onChange}"
				>${this.name}</d2l-input-checkbox>
			</div>
		`;
	}

	_renderOpenControl() {
		// show the open/close arrow if this is not a leaf
		if (this.isOpen || this.tree || this.getTree) {
			return html`
				<span class="open-control" ?open="${this.isOpen}" @click="${this._onArrowClick}">
					<d2l-icon class="closed" icon="tier1:arrow-expand-small"></d2l-icon>
					<d2l-icon class="open" icon="tier1:arrow-collapse-small"></d2l-icon>
				</span>
			`;
		} else {
			return html`<span class="no-open-control"></span>`;
		}
	}

	_renderSubtree() {
		if (this.tree) {
			return html`<div class="subtree" ?hidden="${!this.isRoot && !this.isOpen}" id="subtree" ?root="${this.isRoot}">${this.tree.map((x, i) => {
				const childState = this._getChildState(x, i);
				return html`<d2l-insights-tree-selector-node
					name="${x.name}"
					.tree="${x.tree}"
					.getTree="${x.getTree}"
					?open="${childState.isOpen}"
					selected-state="${this._getChildSelectedState(childState)}"
					@d2l-insights-tree-selector-change="${this._onSubtreeChange}"
					@_open-or-close="${this._onSubtreeOpenOrClose}"
				></d2l-insights-tree-selector-node>`;
			}) }</div>`;
		} else {
			return html``;
		}
	}

	get _domChildren() {
		const subtree_ = this.shadowRoot.getElementById('subtree');
		return subtree_ ? [...subtree_.children] : [];
	}

	_getChildSelectedState(childState) {
		if (this._showSelected) return 'implicit';

		const currentState = childState.selectedState || 'none';
		return currentState === 'implicit' ? 'none' : currentState;
	}

	_getChildState(x, i) {
		// take defaults from x, the provided init data
		return this._domChildren[i] || x;
	}

	async _onArrowClick() {
		this.isOpen = !this.isOpen;

		// lazy load subtree if needed
		if (this.isOpen && !this.tree && this.getTree) {
			this.tree = await this.getTree();
		}

		// This is caught by tree-selector and used to force d2l-dropdown-content to resize
		this.dispatchEvent(new CustomEvent(
			'_open-or-close',
			{bubbles: true, composed: false}
		));
	}

	_onSubtreeOpenOrClose() {
		this.dispatchEvent(new CustomEvent(
			'_open-or-close',
			{bubbles: true, composed: false}
		));
	}

	_onChange(e) {
		this.selectedState = e.target.checked ? 'explicit' : 'none';

		/**
		 * @event d2l-insights-tree-selector-change
		 */
		this.dispatchEvent(new CustomEvent(
			'd2l-insights-tree-selector-change',
			{bubbles: true, composed: false}
		));
	}

	_onSubtreeChange() {
		if (!this.isRoot) {
			const children = this._domChildren;

			// if children were implicitly selected (i.e. this node was shown selected), and
			// a node has been deselected, explicitly select the other children so just the
			// one gets unchecked
			if (this._showSelected) {
				children.forEach(x => {
					if (x.selectedState === 'implicit') {
						x.selectedState = 'explicit';
					}
				});
			}

			// update selected state of this node based on that of its children
			// if (children.every(x => x.isExplicitlySelected)) {
			if (children.every(x => x.selectedState === 'explicit')) {
				this.selectedState = 'explicit';
			} else if (children.some(x => x.selectedState === 'explicit' || x.selectedState === 'indeterminate')) {
				this.selectedState = 'indeterminate';
			} else {
				this.selectedState = 'none';
			}
		}

		/**
		 * @event d2l-insights-tree-selector-change
		 */
		this.dispatchEvent(new CustomEvent(
			'd2l-insights-tree-selector-change',
			{bubbles: true, composed: false}
		));
	}

	get _showIndeterminate() {
		// return this.isIndeterminate && !this.showSelected;
		return this.selectedState === 'indeterminate';
	}

	get _showSelected() {
		// return this.isExplicitlySelected || this.isImplicitlySelected;
		return this.selectedState === 'explicit' || this.selectedState === 'implicit';
	}
}
customElements.define('d2l-insights-tree-selector-node', TreeSelectorNode);
