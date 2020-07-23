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

function getRoles() {
	return roles.map(obj => {
		return {
			id: obj.Identifier,
			displayName: obj.DisplayName,
			// TODO: move these attributes to filter component
			selected: false
		};
	});
}

export default getRoles;
