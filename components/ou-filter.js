import './tree-selector.js';
import {css, html} from 'lit-element/lit-element.js';
import { MobxLitElement } from '@adobe/lit-mobx';

// array indices
const ID = 0;
const NAME = 1;
const TYPE = 2;
const PARENTS = 3;
const CHILDREN = 4;
const STATE = 5;

const SEMESTER_TYPE = 5;

class OuFilter extends MobxLitElement {

	static get properties() {
		return {
			data: { type: Object, attribute: false }
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

	render() {
		this._prepareData();

		return html`<div class="ou-filter" ?loading="${this.data.isLoading}">
			<d2l-insights-tree-selector id="ou-tree-selector" .tree="${this._getChildren()}" @change="${this._onChange}">
		</div>`;
	}

	get selected() {
		return this.shadowRoot.getElementById('ou-tree-selector')
			.selected;
	}

	_getChildren(id) {
		console.log(`GET CHILDREN ${id}`);
		// TODO: handle truncation case (getChildren calls LMS)
		if (!id) {
			const rootOrgUnit = this.data.serverData.orgUnits.filter(x => x[PARENTS].includes(0))[0];
			id = rootOrgUnit && rootOrgUnit[ID];
		}

		if (!id) {
			return [];
		}

		return this._tree[id][CHILDREN]
			.map(childId => this._tree[childId])
			.filter(x => x[TYPE] !== SEMESTER_TYPE)
			.map(x => ({
				name: `${x[NAME]} (${x[ID]})`,
				// pre-load down to any selected descendents: otherwise selecting then deselecting this node
				// before opening it won't deselect them
				// we could open them here, too, if desired
				tree: (x[TYPE] !== 3 && x[STATE] === 'indeterminate') ? this._getChildren(x[ID]) : null,
				getTree: (x[TYPE] === 3 || x[STATE] === 'indeterminate') ? null : async() => this._getChildren(x[ID]),
				selectedState: x[STATE]
			}));
	}

	_markSelected(id, isExplicit) {
		const node = this._tree[id];
		node[STATE] = isExplicit || node[CHILDREN].every(childId => this._tree[childId][STATE] === 'explicit') ? 'explicit' : 'indeterminate';
		node[PARENTS].forEach(parentId => parentId !== 0 && this._markSelected(parentId));
	}

	_onChange() {
		this.dispatchEvent(new CustomEvent(
			'change',
			{bubbles: true, composed: false}
		));
	}

	_prepareData() {
		// index by id
		// every object gets an additional two fields: an array of children, and a selectedState
		this._tree = {};
		this.data.serverData.orgUnits.forEach(x => {
			this._tree[x[ID]] = [...x, [], 'none'];
		});

		// fill in arrays of children, so we can look up both parents and children directly
		this.data.serverData.orgUnits.forEach(x => x[PARENTS].forEach(y => y !== 0 && this._tree[y][CHILDREN].push(x[ID])));

		// mark selected states
		this.data.serverData.selectedOrgUnitIds.forEach(x => this._markSelected(x, true));
	}
}
customElements.define('d2l-insights-ou-filter', OuFilter);
