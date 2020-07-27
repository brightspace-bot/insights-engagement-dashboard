import './simple-filter';

import {html, LitElement} from 'lit-element';
import Roles from '../model/roles';

/**
 * @fires role-selections-updated
 */
class InsightsRoleFilter extends LitElement {

	static get properties() {
		return {
			roleData: {type: Array, attribute: false}
		};
	}

	constructor() {
		super();

		this.name = 'Roles';

		this.roleData = [];
		this.roles = new Roles();
		this.roles.fetchRolesFromLms().then(() => {
			this.roleData = this.roles.getRoleDataForFilter();
		});
	}

	get selected() {
		return this.roles.getSelectedRoleIds();
	}

	render() {
		return html`
			<d2l-simple-filter
				@item-selected="${this._updateFilterSelections}"
				name="${this.name}"
				.data="${this.roleData}">
			</d2l-simple-filter>
		`;
	}

	_updateFilterSelections(event) {
		this.roles.setSelectedState(event.detail.itemId, event.detail.selected);
		this.dispatchEvent(new Event('role-selections-updated'));
	}
}
customElements.define('d2l-insights-role-filter', InsightsRoleFilter);
