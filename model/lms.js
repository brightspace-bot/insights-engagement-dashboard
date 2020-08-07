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

	/**
	 * @param {string|null} bookmark - can be null
	 * @param {string|null} search - can be null
	 * @returns {{PagingInfo:{Bookmark: string, HasMoreItems: boolean}, Items: {orgUnitId: number, orgUnitName: string}[]}}
	 */
	async fetchSemesters(bookmark, search) {
		const url = new URL('/d2l/api/ap/unstable/insights/data/semesters', location.href);
		url.searchParams.set('pageSize', 3);
		if (bookmark) {
			url.searchParams.set('bookmark', bookmark);
		}
		if (search) {
			url.searchParams.set('search', search);
		}
		const response = await fetch(url);
		return await response.json();
	}
}

export default Lms;
