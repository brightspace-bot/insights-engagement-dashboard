import '@brightspace-ui/core/components/inputs/input-checkbox';

import {css, html, LitElement} from 'lit-element/lit-element.js';

class TreeSelectorNode extends LitElement {

	static get properties() {
		return {
			// todo: https://github.com/BrightspaceUI/guide/wiki/LitElement-Best-Practices-&-Gotchas#-do-use-correct-casing-for-attributes-and-properties
			name: { type: String },
			// an array of objects with properties name, [children], getChildren, isOpen, isExplicitlySelected
			// used to initialize, but not updated after
			tree: { type: Object, attribute: false },
			getChildren: { type: Object, attribute: false },
			// if true, children are loaded (if needed) and shown; if false, children are rendered but hidden
			isOpen: { type: Boolean, reflect: true },
			// "explicit", "implicit", "indeterminate", or "none"
			selectedState: { type: String, reflect: true }
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

	_getChildSelectedState(i) {
		if (this._showSelected) return 'implicit';

		const currentState = (this._domChildren[i] || {}).selectedState || 'none';
		return currentState === 'implicit' ? 'none' : currentState;
	}

	get _isRoot() {
		return !this.name;
	}

	async _onArrowClick() {
		this.isOpen = !this.isOpen;

		// lazy load children if needed
		if (this.isOpen && !this.tree && this.getChildren) {
			this.tree = await this.getChildren();
		}
	}

	_onChange(e) {
		this.selectedState = e.target.checked ? 'explicit' : 'none';

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
		if (this.isOpen || this.tree || this.getChildren) {
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
			return html`<div class="subtree" ?hidden="${!this._isRoot && !this.isOpen}" id="subtree" ?root="${this._isRoot}">${this.tree.map((x, i) =>
				html`<d2l-insights-tree-selector-node
					name="${x.name}"
					.tree="${x.children}"
					.getChildren="${x.getChildren}"
					?isOpen="${x.isOpen}"
					selectedState="${this._getChildSelectedState(i)}"
					@change="${this._onSubtreeChange}"
				></d2l-insights-tree-selector-node>`
			)}</div>`;
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
