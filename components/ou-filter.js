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
				.tree="${this._tree}"
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

	get _tree() {
		// index by id
		// every object gets an additional three fields: an array of children, a selectedState, and an isOpen boolean
		// the children array is so we can look up both parents (provided by the server) and children directly
		const tree = {};
		this.data.serverData.orgUnits
			.filter(x => x[TYPE] !== this.data.serverData.semesterTypeId)
			.forEach(x => {
				tree[x[ID]] = [...x, [], 'none', false];
			});

		this._fillChildrenArrays(tree);

		return new Tree(tree, this.data.serverData.selectedOrgUnitIds, [COURSE_OFFERING]);
	}

	_fillChildrenArrays(tree) {
		Object.values(tree).forEach(node => this._addIdToParents(node, tree));
	}

	_addIdToParents(child, tree) {
		child[PARENTS].forEach(parentId => tree[parentId] && tree[parentId][CHILDREN].push(child[ID]));
	}
}
customElements.define('d2l-insights-ou-filter', OuFilter);
