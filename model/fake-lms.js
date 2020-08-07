class Lms {
	async fetchRoles() {
		/**
		 * Expected data format from Roles API
		 * @type {{Identifier: string, DisplayName: string, Code: string|null}[]}
		 */
		return null;
	}

	/**
	 * @param {string|null} bookmark - can be null
	 * @param {string|null} search - can be null
	 * @returns {{PagingInfo:{Bookmark: string, HasMoreItems: boolean}, Items: {orgUnitId: number, orgUnitName: string}[]}}
	 */
	async fetchSemesters(bookmark, search) {
		let response = {
			PagingInfo: {
				Bookmark: '1326467654053_120127',
				HasMoreItems: true
			},
			Items: [
				{
					orgUnitId: 10007,
					orgUnitName: 'IPSIS Semester New'
				},
				{
					orgUnitId: 121194,
					orgUnitName: 'Fall Test Semester'
				},
				{
					orgUnitId: 120127,
					orgUnitName: 'IPSIS Test Semester 1'
				}
			]
		};
		const secondPage = {
			PagingInfo: {
				Bookmark: '1326467625687_120124',
				HasMoreItems: false
			},
			Items: [
				{
					orgUnitId: 120126,
					orgUnitName: 'IPSIS Test Semester 12'
				},
				{
					orgUnitId: 120125,
					orgUnitName: 'IPSIS Test Semester 123'
				},
				{
					orgUnitId: 120124,
					orgUnitName: 'IPSIS Test Semester 4'
				}
			]
		};
		if (bookmark) {
			response = secondPage;
		}

		if (search) {
			response.Items = response.Items
				.filter(item => item.orgUnitName.toLowerCase().includes(search.toLowerCase()));
		}

		return await new Promise(resolve =>	setTimeout(() => resolve(response), 100));
	}
}

export default Lms;
