import '@brightspace-ui/core/components/inputs/input-checkbox';

import {css, html, LitElement} from 'lit-element/lit-element.js';

class TreeSelectorNode extends LitElement {
	/**
	 * @property {string} name
	 * @property {{name: string, tree:{}[], getTree: function, isOpen: boolean, selectedState: string}[]} tree - used to initialize, but will not be updated
	 * @property {function} getTree - async callback which should return the tree (provide either tree or getTree)
	 * @property {boolean} isOpen
	 * @property {boolean} selectedState - may be "explicit", "implicit", "indeterminate", or "none"
	 * @fires change - value of this.selected has changed
	 */
	static get properties() {
		return {
			name: { type: String },
			tree: { type: Object, attribute: false },
			getTree: { type: Object, attribute: false },
			isOpen: { type: Boolean, reflect: true, attribute: 'is-open' },
			selectedState: { type: String, reflect: true, attribute: 'selected-state' }
		};
	}

	static get styles() {
		// TODO: fix indent on childless nodes
		return css`
			:host {
				display: block;
			}
			:host([hidden]) {
				display: none;
			}
			
			d2l-input-checkbox {
				display: inline-block;
			}
			.arrow:before {
				content: "> "
			}
			.arrow[open]:before {
				content: "v "
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

	render() {
		return html`
			${this._renderNode()}
			${this._renderSubtree()}
		`;
	}

	get selected() {
		if (this.selectedState === 'explicit') {
			return [this];
		}

		return this._domChildren.flatMap(x => x.selected);
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

	get _isRoot() {
		return !this.name;
	}

	async _onArrowClick() {
		this.isOpen = !this.isOpen;

		// lazy load subtree if needed
		if (this.isOpen && !this.tree && this.getTree) {
			this.tree = await this.getTree();
		}
	}

	_onChange(e) {
		this.selectedState = e.target.checked ? 'explicit' : 'none';

		/**
		 * @event change
		 */
		this.dispatchEvent(new CustomEvent(
			'change',
			{bubbles: true, composed: false}
		));
	}

	_onSubtreeChange() {
		if (!this._isRoot) {
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
			} else if (children.some(x => x.selectedState === 'explicit')) {
				this.selectedState = 'indeterminate';
			} else {
				this.selectedState = children.some(x => x.selectedState === 'indeterminate') ? 'indeterminate' : 'none';
			}
		}

		this.dispatchEvent(new CustomEvent(
			'change',
			{bubbles: true, composed: false}
		));
	}

	_renderArrowControl() {
		// show the open/close arrow if this is not a leaf
		if (this.isOpen || this.tree || this.getTree) {
			return html`<span class="arrow" ?open="${this.isOpen}" @click="${this._onArrowClick}"></span>`;
		} else {
			return html``;
		}
	}

	_renderNode() {
		if (this._isRoot) {
			return html``;
		}

		return html`
			${this._renderArrowControl()}
			<d2l-input-checkbox
				?checked="${this._showSelected}"
				?indeterminate="${this._showIndeterminate}"
				@change="${this._onChange}"
			>${this.name}</d2l-input-checkbox>`;
	}

	_renderSubtree() {
		if (this.tree) {
			return html`<div class="subtree" ?hidden="${!this._isRoot && !this.isOpen}" id="subtree" ?root="${this._isRoot}">${this.tree.map((x, i) => {
				const childState = this._getChildState(x, i);
				return html`<d2l-insights-tree-selector-node
					name="${x.name}"
					.tree="${x.tree}"
					.getTree="${x.getTree}"
					?is-open="${childState.isOpen}"
					selected-state="${this._getChildSelectedState(childState)}"
					@change="${this._onSubtreeChange}"
				></d2l-insights-tree-selector-node>`;
			}) }</div>`;
		} else {
			return html``;
		}
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
