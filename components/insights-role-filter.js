import './dropdown-filter';

import {html, LitElement} from 'lit-element';
import FakeLms from '../model/fake-lms';
import Lms from '../model/lms';
import {Localizer} from '../locales/localizer';

/**
 * @property {{id: string, displayName: string}[]} _filterData
 * @fires d2l-insights-role-filter-change
 * @fires d2l-insights-role-filter-close
 */
class InsightsRoleFilter extends Localizer(LitElement) {

	static get properties() {
		return {
			isDemo: { type: Boolean, attribute: 'demo' },
			_filterData: { type: Array, attribute: false }
		};
	}

	constructor() {
		super();

		this.isDemo = false;
		/** @type {{id: string, displayName: string}[]} */
		this._filterData = [];
	}

	async firstUpdated() {
		this._lms = this.isDemo ? new FakeLms() : new Lms();
		const data = await this._lms.fetchRoles();
		this._setRoleData(data);
	}

	get selected() {
		return this.shadowRoot.querySelector('d2l-insights-dropdown-filter').selected;
	}

	_setRoleData(roleData) {
		roleData.sort((role1, role2) => {
			// NB: it seems that localeCompare is pretty slow, but that's ok in this case, since there
			// shouldn't usually be many roles, and loading/sorting roles is only expected to happen infrequently.
			return role1.DisplayName.localeCompare(role2.DisplayName)
				|| role1.Identifier.localeCompare(role2.Identifier);
		});

		this._setFilterData(roleData);
	}

	_setFilterData(roleData) {
		this._filterData = roleData.map(obj => {
			return {id: obj.Identifier, displayName: obj.DisplayName};
		});
	}

	render() {
		return html`
			<d2l-insights-dropdown-filter
				disable-search
				name="${this.localize('components.insights-role-filter.name')}"
				.data="${this._filterData}"

				@d2l-insights-dropdown-filter-selected="${this._updateFilterSelections}"
				@d2l-insights-dropdown-filter-selection-cleared="${this._updateFilterSelections}"
				@d2l-insights-dropdown-filter-close="${this._filterClose}"
			>
			</d2l-insights-dropdown-filter>
		`;
	}

	_updateFilterSelections() {
		/**
		 * @event d2l-insights-role-filter-change
		 */
		this.dispatchEvent(new Event('d2l-insights-role-filter-change'));
	}

	_filterClose() {
		this.dispatchEvent(new Event('d2l-insights-role-filter-close'));
	}

}
customElements.define('d2l-insights-role-filter', InsightsRoleFilter);
