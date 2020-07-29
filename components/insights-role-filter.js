import './simple-filter';

import {html, LitElement} from 'lit-element';
import Roles from '../model/roles';

/**
 * @fires d2l-insights-role-filter-change
 */
class InsightsRoleFilter extends LitElement {

	static get properties() {
		return {
			_roleData: {type: Array, attribute: false}
		};
	}

	constructor() {
		super();

		this._name = 'Roles';

		this._roleData = [];
		this._roles = new Roles();
		this._roles.fetchRolesFromLms().then(() => {
			this._roleData = this._roles.getRoleDataForFilter();
		});
	}

	get selected() {
		return this._roles.getSelectedRoleIds();
	}

	render() {
		return html`
			<d2l-simple-filter
				@item-selected="${this._updateFilterSelections}"
				name="${this._name}"
				.data="${this._roleData}">
			</d2l-simple-filter>
		`;
	}

	_updateFilterSelections(event) {
		this._roles.setSelectedState(event.detail.itemId, event.detail.selected);
		this.dispatchEvent(new Event('d2l-insights-role-filter-change'));
	}
}
customElements.define('d2l-insights-role-filter', InsightsRoleFilter);
