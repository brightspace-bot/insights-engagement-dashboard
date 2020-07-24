const roles = [
	{
		'Identifier': '578',
		'DisplayName': 'End User',
		'Code': 'End User'
	},
	{
		'Identifier': '595',
		'DisplayName': 'Student',
		'Code': null
	},
	{
		'Identifier': '596',
		'DisplayName': 'Instructor',
		'Code': null
	},
	{
		'Identifier': '597',
		'DisplayName': 'D2LMonitor',
		'Code': null
	},
	{
		'Identifier': '579',
		'DisplayName': 'Resource Creator',
		'Code': null
	},
	{
		'Identifier': '580',
		'DisplayName': 'Administrator',
		'Code': null
	}
];

class Roles {
	constructor() {
		// load roles
		this.roles = roles.map(obj => {
			return {...obj, selected: false};
		});
	}

	/**
	 * @returns {{displayName: (string), id: (string)}[]}
	 */
	getRoleDataForFilter() {
		return this.roles.map(obj => {
			return {id: obj.Identifier, displayName: obj.DisplayName};
		});
	}

	getSelectedRoleIds() {
		return this.roles.filter(role => role.selected).map(role => role.Identifier);
	}

	setSelectedState(roleId, selected) {
		this.roles.find(role => role.Identifier === roleId).selected = selected;
	}
}

export default Roles;
