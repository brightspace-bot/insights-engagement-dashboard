import './tree-selector.js';
import { css, html } from 'lit-element/lit-element.js';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';

// array indices
const ID = 0;
const NAME = 1;
const TYPE = 2;
const PARENTS = 3;
const CHILDREN = 4;
const STATE = 5;

/**
 * @property {Object} data - an instance of Data from model/data.js
 * @fires d2l-insights-ou-filter-change
 */
class OuFilter extends Localizer(MobxLitElement) {

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
			<d2l-insights-tree-selector id="ou-tree-selector"
				name="${this.localize('components.org-unit-filter.name')}"
				.tree="${this._getChildren()}"
				.search="${this._search}"
				@d2l-insights-tree-selector-change="${this._onChange}"
			></d2l-insights-tree-selector>
		</div>`;
	}

	get selected() {
		return this.shadowRoot.getElementById('ou-tree-selector').selected;
	}

	_getChildren(id) {
		// coming soon: handle truncation case (getChildren calls LMS)
		if (!id) {
			const rootOrgUnit = this.data.serverData.orgUnits.filter(x => x[PARENTS].includes(0))[0];
			id = rootOrgUnit && rootOrgUnit[ID];
		}

		if (!id) {
			return [];
		}

		const children = this._tree[id][CHILDREN].map(childId => this._tree[childId]);
		return this._formatNodes(children);
	}

	_formatNodes(children) {
		return children
			.filter(x => x[TYPE] !== this.data.serverData.semesterTypeId)
			.map(x => ({
				name: this.localize('components.org-unit-filter.org-unit-name', {orgUnitName: x[NAME], id: x[ID]}),
				// pre-load down to any selected descendents: otherwise selecting then deselecting this node
				// before opening it won't deselect them
				tree: (x[TYPE] !== 3 && x[STATE] !== 'none') ? this._getChildren(x[ID]) : null,
				getTree: (x[TYPE] !== 3 && x[STATE] === 'none') ? async() => this._getChildren(x[ID]) : null,
				selectedState: x[STATE]
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	}

	_search(filterString) {
		console.log(`search: ${filterString}`);

		return this._tree.filter(x => x.);
	}

	_markSelected(id, isExplicit) {
		const node = this._tree[id];
		node[STATE] = isExplicit || node[CHILDREN].every(childId => this._tree[childId][STATE] === 'explicit') ? 'explicit' : 'indeterminate';
		node[PARENTS].forEach(parentId => parentId !== 0 && this._markSelected(parentId));
	}

	_onChange() {
		/**
		 * @event d2l-insights-ou-filter-change
		 */
		this.dispatchEvent(new CustomEvent(
			'd2l-insights-ou-filter-change',
			{ bubbles: true, composed: false }
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
		this.data.serverData.selectedOrgUnitIds && this.data.serverData.selectedOrgUnitIds.forEach(x => this._markSelected(x, true));
	}
}
customElements.define('d2l-insights-ou-filter', OuFilter);
