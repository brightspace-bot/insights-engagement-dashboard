import { CHILDREN, ID, PARENTS, Tree, TYPE } from './tree-filter.js';
import { css, html } from 'lit-element/lit-element.js';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';

const COURSE_OFFERING = 3;

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
		return html`<div class="ou-filter" ?loading="${this.data.isLoading}">
			<d2l-insights-tree-filter
				.tree="${this._getTree()}"
				opener-text="${this.localize('components.org-unit-filter.name-all-selected')}"
				opener-text-selected="${this.localize('components.org-unit-filter.name-some-selected')}"
				@d2l-insights-tree-filter-select="${this._onChange}"
			>
			</d2l-insights-tree-filter>
		</div>`;
	}

	get selected() {
		return this.shadowRoot.querySelector('d2l-insights-tree-filter').selected;
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

	_getTree() {
		// on redraw (e.g. new server data), ensure open nodes stay open so the user doesn't have
		// to go open a parent again when selecting several children
		const openNodes = new Set((this._tree && this._tree.open) || []);

		// index all org units by id for quick lookup while building the filtered tree
		const fullTree = {};
		this.data.serverData.orgUnits
			.filter(x => x[TYPE] !== this.data.serverData.semesterTypeId)
			.forEach(x => fullTree[x[ID]] = x);

		// Now build tree filtered by selected semesters. For each matching org unit, make sure its ancestors
		// are included even if they don't match the semester filter themselves (e.g. a course offering is
		// in the current semester, but the course template is not).
		// Every object gets an additional three fields: an array of children, a selectedState, and an isOpen boolean.
		// The children array is so we can look up both parents (provided by the server), and children directly.
		const filteredTree = {};
		this.data.orgUnits
			.filter(x => x[TYPE] !== this.data.serverData.semesterTypeId)
			.forEach(x => {
				this._addNodeIfNew(x, filteredTree, fullTree, openNodes);
			});

		this._tree = new Tree(
			filteredTree,
			this.data.selectedOrgUnitIds,
			[COURSE_OFFERING]
		);
		return this._tree;
	}

	_addNodeIfNew(node, filteredTree, fullTree, openNodes) {
		if (!node || filteredTree[node[ID]]) return;

		filteredTree[node[ID]] = [...node, [], 'none', openNodes.has(node[ID])];
		node[PARENTS].forEach(parentId => {
			this._addNodeIfNew(fullTree[parentId], filteredTree, fullTree, openNodes);
			if (filteredTree[parentId]) {
				filteredTree[parentId][CHILDREN].push(node[ID]);
			}
		});
	}
}
customElements.define('d2l-insights-ou-filter', OuFilter);
