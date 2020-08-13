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
	async fetchSemesters(pageSize, bookmark, search) {
		const response = {
			PagingInfo: {
				Bookmark: '0',
				HasMoreItems: false
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
				},
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
				},
				{
					orgUnitId: 1201240,
					orgUnitName: 'IPSIS Test Semester 42'
				}
			]
		};

		response.Items = response.Items.map((item, index) => Object.assign(item, {index}));

		const index = parseInt(bookmark || '-1');
		response.Items = response.Items.slice(index + 1);

		if (search) {
			response.Items = response.Items
				.filter(item => item.orgUnitName.toLowerCase().includes(search.toLowerCase()));
		}
		response.PagingInfo.HasMoreItems = response.Items.length > pageSize;
		response.Items = response.Items.slice(0, pageSize);
		response.PagingInfo.Bookmark = response.Items[response.Items.length - 1].index.toString();

		return await new Promise(resolve =>	setTimeout(() => resolve(response), 100));
	}
}

export default Lms;
