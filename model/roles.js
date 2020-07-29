const rolesEndpoint = '/d2l/api/lp/1.23/roles/';

class Roles {
	async fetchRolesFromLms() {
		const response = await fetch(rolesEndpoint);

		/**
		 * Expected data format from Roles API
		 * @type {{Identifier: string, DisplayName: string, Code: string|null}[]}
		 */
		const responseData = await response.json();

		this._roleData = responseData.map(obj => {
			return {...obj, selected: false};
		});

		this._roleData.sort((role1, role2) => {
			// NB: it seems that localeCompare is pretty slow, but that's ok in this case, since there
			// shouldn't usually be many roles, and loading/sorting roles is only expected to happen infrequently.
			return role1.DisplayName.localeCompare(role2.DisplayName)
				|| role1.Identifier.localeCompare(role2.Identifier);
		});
	}

	/**
	 * @returns {{displayName: (string), id: (string)}[]}
	 */
	getRoleDataForFilter() {
		return this._roleData.map(obj => {
			return {id: obj.Identifier, displayName: obj.DisplayName};
		});
	}

	getSelectedRoleIds() {
		return this._roleData.filter(role => role.selected).map(role => role.Identifier);
	}

	setSelectedState(roleId, selected) {
		this._roleData.find(role => role.Identifier === roleId).selected = selected;
	}
}

export default Roles;
