const rolesEndpoint = '/d2l/api/lp/1.23/roles/';
const semestersEndpoint = '/d2l/api/ap/unstable/insights/data/semesters';
const dataEndpoint = '/d2l/api/ap/unstable/insights/data/engagement';

/**
 * @param {[Number]} roleIds
 * @param {[Number]} semesterIds
 * @param {[Number]} orgUnitIds
 */
export async function fetchData({ roleIds = [], semesterIds = [], orgUnitIds = [] }) {
	const url = new URL(dataEndpoint, window.location.origin);
	if (roleIds) {
		url.searchParams.set('selectedRolesCsv', roleIds.join(','));
	}
	if (semesterIds) {
		url.searchParams.set('selectedSemestersCsv', semesterIds.join(','));
	}
	if (orgUnitIds) {
		url.searchParams.set('selectedOrgUnitIdsCsv', orgUnitIds.join(','));
	}
	const response = await fetch(url.toString());
	return await response.json();
}

/**
 * @returns {{Identifier: string, DisplayName: string, Code: string|null}[]}
 */
export async function fetchRoles() {
	const response = await fetch(rolesEndpoint);

	/**
	 * Expected data format from Roles API
	 * @type {{Identifier: string, DisplayName: string, Code: string|null}[]}
	 */
	return await response.json();
}

/**
 * @param {Number} pageSize
 * @param {string|null} bookmark - can be null
 * @param {string|null} search - can be null
 * @returns {{PagingInfo:{Bookmark: string, HasMoreItems: boolean}, Items: {orgUnitId: number, orgUnitName: string}[]}}
 */
export async function fetchSemesters(pageSize, bookmark, search) {
	const url = new URL(semestersEndpoint, window.location.origin);
	url.searchParams.set('pageSize', pageSize.toString());
	if (bookmark) {
		url.searchParams.set('bookmark', bookmark);
	}
	if (search) {
		url.searchParams.set('search', search);
	}
	const response = await fetch(url.toString());
	return await response.json();
}
