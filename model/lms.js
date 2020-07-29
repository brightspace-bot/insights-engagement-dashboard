const rolesEndpoint = '/d2l/api/lp/1.23/roles/';

class Lms {
	async fetchRoles() {
		const response = await fetch(rolesEndpoint);

		/**
		 * Expected data format from Roles API
		 * @type {{Identifier: string, DisplayName: string, Code: string|null}[]}
		 */
		return await response.json();
	}
}

export default Lms;
