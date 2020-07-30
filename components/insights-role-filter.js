import './simple-filter';

import {html, LitElement} from 'lit-element';
import Lms from '../model/lms';

/**
 * @property {{id: string, displayName: string}[]} _filterData
 * @fires d2l-insights-role-filter-change - detail includes the list of selected role ids
 */
class InsightsRoleFilter extends LitElement {

	static get properties() {
		return {
			_filterData: {type: Array, attribute: false}
		};
	}

	constructor() {
		super();

		this._name = 'Roles';
		this._roleData = [];

		const lms = new Lms();
		lms.fetchRoles().then(data => this._setRoleData(data));
	}

	get selected() {
		return this._roleData.filter(role => role.selected).map(role => role.Identifier);
	}

	_setRoleData(roleData) {
		roleData.sort((role1, role2) => {
			// NB: it seems that localeCompare is pretty slow, but that's ok in this case, since there
			// shouldn't usually be many roles, and loading/sorting roles is only expected to happen infrequently.
			return role1.DisplayName.localeCompare(role2.DisplayName)
				|| role1.Identifier.localeCompare(role2.Identifier);
		});

		this._roleData = roleData.map(obj => {
			return {...obj, selected: false};
		});
		this._setFilterData(); // triggers re-render
	}

	/**
	 * @returns {{displayName: (string), id: (string)}[]}
	 */
	_setFilterData() {
		this._filterData = this._roleData.map(obj => {
			return {id: obj.Identifier, displayName: obj.DisplayName};
		});
	}

	_setSelectedState(roleId, selected) {
		this._roleData.find(role => role.Identifier === roleId).selected = selected;
	}

	render() {
		return html`
			<d2l-simple-filter
				@d2l-simple-filter-selected="${this._updateFilterSelections}"
				name="${this._name}"
				.data="${this._filterData}">
			</d2l-simple-filter>
		`;
	}

	_updateFilterSelections(event) {
		this._setSelectedState(event.detail.itemId, event.detail.selected);
		this.dispatchEvent(new Event('d2l-insights-role-filter-change'));
	}
}
customElements.define('d2l-insights-role-filter', InsightsRoleFilter);
