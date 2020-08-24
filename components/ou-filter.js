
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
				name="${this.localize('components.org-unit-filter.name')}"
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
		const tree = {};
		this.data.serverData.orgUnits
			.filter(x => x[TYPE] !== this.data.serverData.semesterTypeId)
			.forEach(x => {
				tree[x[ID]] = [...x, [], 'none', false];
			});

		// fill in arrays of children, so we can look up both parents and children directly
		Object.values(tree).forEach(x => x[PARENTS].forEach(y => tree[y] && tree[y][CHILDREN].push(x[ID])));

		return new Tree(tree, this.data.serverData.selectedOrgUnitIds, [COURSE_OFFERING]);
	}
}
customElements.define('d2l-insights-ou-filter', OuFilter);
