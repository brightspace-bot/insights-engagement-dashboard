import '../../components/users-table.js';

import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-users-table', () => {
	const data = {
		userDataForDisplay: [
			['01Last, 01First'],
			['02Last, 02First'],
			['03Last, 03First'],
			['04Last, 04First'],
			['05Last, 05First'],
			['06Last, 06First'],
			['07Last, 07First'],
			['08Last, 08First'],
			['09Last, 09First'],
			['10Last, 10First'],
			['11Last, 11First'],
			['12Last, 12First'],
			['13Last, 13First'],
			['14Last, 14First'],
			['15Last, 15First'],
			['16Last, 16First'],
			['17Last, 17First'],
			['18Last, 18First'],
			['19Last, 19First'],
			['20Last, 20First'],
			['21Last, 21First'],
			['22Last, 22First'],
			['23Last, 23First']
		]
	};

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-users-table');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-insights-users-table .data="${data}"></d2l-insights-users-table>`);
			// give it a second to make sure inner table and paging controls load in
			await new Promise(resolve => setTimeout(resolve, 200));
			await el.updateComplete;

			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should display the correct total users count', async() => {
			const el = await fixture(html`<d2l-insights-users-table .data="${data}"></d2l-insights-users-table>`);
			const totalUsersText = el.shadowRoot.querySelectorAll('.table-total-users')[0];
			expect(totalUsersText.innerText).to.equal('Total Users: 23');
		});
	});

	describe('pagination', () => {
		describe('when there are users in the table', () => {
			let el;
			let pageSizeSelector;
			let pageSelector;
			let innerTable;

			before(async() => {
				el = await fixture(html`<d2l-insights-users-table .data="${data}"></d2l-insights-users-table>`);
				innerTable = el.shadowRoot.querySelector('d2l-insights-table');
				await innerTable.updateComplete;
				pageSelector = el.shadowRoot.querySelector('d2l-labs-pagination');
				pageSizeSelector = pageSelector.shadowRoot.querySelector('select');
			});

			it('should show the first 20 users in order on the first page, if there are more than 20 users', () => {
				// the default page size is 20
				expect(pageSelector.selectedCountOption).to.equal(20);
				expect(pageSelector.maxPageNumber).to.equal(2);
				expect(pageSelector.pageNumber).to.equal(1);

				// since there are 23 users, the first (default) page should show the first 20 users, in order, on it
				const displayedUsers = Array.from(innerTable.shadowRoot.querySelectorAll('tbody > tr > td:first-child'));
				expect(displayedUsers.length).to.equal(20);
				displayedUsers.forEach((user, idx) => {
					expect(user.innerText).to.equal(data.userDataForDisplay[idx][0]);
				});
			});

			it('should show the correct number of users on the last page', async() => {
				pageSelector.shadowRoot.querySelector('d2l-button-icon[text="Next page"]').click();
				await innerTable.updateComplete;

				expect(pageSelector.pageNumber).to.equal(2);

				const displayedUsers = Array.from(innerTable.shadowRoot.querySelectorAll('tbody > tr > td:first-child'));
				expect(displayedUsers.length).to.equal(3);
				displayedUsers.forEach((user, idx) => {
					expect(user.innerText).to.equal(data.userDataForDisplay[idx + 20][0]);
				});
			});

			it('should change number of users shown and total number of pages if the page size changes', async() => {
				pageSizeSelector.value = '10';
				pageSizeSelector.dispatchEvent(new Event('change'));
				await innerTable.updateComplete;

				expect(pageSelector.selectedCountOption).to.equal(10);
				expect(pageSelector.maxPageNumber).to.equal(3);
				expect(pageSelector.pageNumber).to.equal(1);

				let displayedUsers = Array.from(innerTable.shadowRoot.querySelectorAll('tbody > tr > td:first-child'));
				expect(displayedUsers.length).to.equal(10);
				displayedUsers.forEach((user, idx) => {
					expect(user.innerText).to.equal(data.userDataForDisplay[idx][0]);
				});

				pageSelector.shadowRoot.querySelector('d2l-button-icon[text="Next page"]').click();
				await innerTable.updateComplete;

				expect(pageSelector.pageNumber).to.equal(2);

				displayedUsers = Array.from(innerTable.shadowRoot.querySelectorAll('tbody > tr > td:first-child'));
				expect(displayedUsers.length).to.equal(10);
				displayedUsers.forEach((user, idx) => {
					expect(user.innerText).to.equal(data.userDataForDisplay[idx + 10][0]);
				});

				pageSelector.shadowRoot.querySelector('d2l-button-icon[text="Next page"]').click();
				await innerTable.updateComplete;

				expect(pageSelector.pageNumber).to.equal(3);

				displayedUsers = Array.from(innerTable.shadowRoot.querySelectorAll('tbody > tr > td:first-child'));
				expect(displayedUsers.length).to.equal(3);
				displayedUsers.forEach((user, idx) => {
					expect(user.innerText).to.equal(data.userDataForDisplay[idx + 20][0]);
				});
			});

			it('should show all users on a single page if there are fewer users than the page size', async() => {
				pageSizeSelector.value = '50';
				pageSizeSelector.dispatchEvent(new Event('change'));
				await innerTable.updateComplete;

				expect(pageSelector.selectedCountOption).to.equal(50);
				expect(pageSelector.maxPageNumber).to.equal(1);
				expect(pageSelector.pageNumber).to.equal(1);

				const displayedUsers = Array.from(innerTable.shadowRoot.querySelectorAll('tbody > tr > td:first-child'));
				expect(displayedUsers.length).to.equal(23);
				displayedUsers.forEach((user, idx) => {
					expect(user.innerText).to.equal(data.userDataForDisplay[idx][0]);
				});

			});

			it('should show zero pages if there are no users to display', async() => {
				el.data = { userDataForDisplay: [] };
				await innerTable.updateComplete;

				expect(pageSelector.selectedCountOption).to.equal(50);
				expect(pageSelector.maxPageNumber).to.equal(0);
				expect(pageSelector.pageNumber).to.equal(0);

				const displayedUsers = Array.from(innerTable.shadowRoot.querySelectorAll('tbody > tr > td:first-child'));
				expect(displayedUsers.length).to.equal(0);
			});
		});

	});
});
