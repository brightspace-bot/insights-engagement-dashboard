import '../../components/users-table.js';

import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-users-table', () => {
	const data = {
		// returns [ ['0First', '0Last'], ['1First', '1Last'], ..., ['22First', '22Last'] ]
		userDataForDisplay: Array.from({ length: 23 }, (val, idx) => [`${idx}First`, `${idx}Last`])
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
			const totalUsersText = el.shadowRoot.querySelectorAll('.d2l-insights-users-table-total-users')[0];
			expect(totalUsersText.innerText).to.equal('Total Users: 23');
		});
	});

	describe('pagination', () => {
		describe('when there are users in the table', () => {
			let el;
			let pageSizeSelector;
			let pageSelector;
			let innerTable;

			before(async function() {
				this.timeout(10000);

				el = await fixture(html`<d2l-insights-users-table .data="${data}"></d2l-insights-users-table>`);
				innerTable = el.shadowRoot.querySelector('d2l-insights-table');
				await new Promise(resolve => setTimeout(resolve, 200));
				await innerTable.updateComplete;
				pageSelector = el.shadowRoot.querySelector('d2l-labs-pagination');
				await pageSelector.updateComplete;
				pageSizeSelector = pageSelector.shadowRoot.querySelector('select');
			});

			// this test is randomly very flaky. When testing locally, I was able to reproduce the error by
			// minimizing my browser, so I think the browsers are also being minimized on the Sauce servers.
			// I don't see any options to force maximized windows though, so I'm increasing timeout in before instead
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
				pageSelector
					.shadowRoot.querySelector('d2l-button-icon[text="Next page"]')
					.shadowRoot.querySelector('button')
					.click();
				await new Promise(resolve => setTimeout(resolve, 200));
				await innerTable.updateComplete;
				await pageSelector.updateComplete;

				expect(pageSelector.pageNumber).to.equal(2);

				const displayedUsers = Array.from(innerTable.shadowRoot.querySelectorAll('tbody > tr > td:first-child > div'));
				expect(displayedUsers.length).to.equal(3);
				displayedUsers.forEach((user, idx) => {
					expect(user.innerText).to.equal(data.userDataForDisplay[idx + 20][0]);
				});
			});

			it('should change number of users shown and total number of pages if the page size changes', async() => {
				pageSizeSelector.value = '10';
				pageSizeSelector.dispatchEvent(new Event('change'));
				await new Promise(resolve => setTimeout(resolve, 200));
				await innerTable.updateComplete;
				await pageSelector.updateComplete;

				expect(pageSelector.selectedCountOption).to.equal(10);
				expect(pageSelector.maxPageNumber).to.equal(3);
				expect(pageSelector.pageNumber).to.equal(1);

				let displayedUsers = Array.from(innerTable.shadowRoot.querySelectorAll('tbody > tr > td:first-child > div'));
				expect(displayedUsers.length).to.equal(10);
				displayedUsers.forEach((user, idx) => {
					expect(user.innerText).to.equal(data.userDataForDisplay[idx][0]);
				});

				pageSelector
					.shadowRoot.querySelector('d2l-button-icon[text="Next page"]')
					.shadowRoot.querySelector('button')
					.click();
				await new Promise(resolve => setTimeout(resolve, 200));
				await innerTable.updateComplete;
				await pageSelector.updateComplete;

				expect(pageSelector.pageNumber).to.equal(2);

				displayedUsers = Array.from(innerTable.shadowRoot.querySelectorAll('tbody > tr > td:first-child > div'));
				expect(displayedUsers.length).to.equal(10);
				displayedUsers.forEach((user, idx) => {
					expect(user.innerText).to.equal(data.userDataForDisplay[idx + 10][0]);
				});

				pageSelector
					.shadowRoot.querySelector('d2l-button-icon[text="Next page"]')
					.shadowRoot.querySelector('button')
					.click();
				await new Promise(resolve => setTimeout(resolve, 200));
				await innerTable.updateComplete;
				await pageSelector.updateComplete;

				expect(pageSelector.pageNumber).to.equal(3);

				displayedUsers = Array.from(innerTable.shadowRoot.querySelectorAll('tbody > tr > td:first-child > div'));
				expect(displayedUsers.length).to.equal(3);
				displayedUsers.forEach((user, idx) => {
					expect(user.innerText).to.equal(data.userDataForDisplay[idx + 20][0]);
				});
			});

			it('should show all users on a single page if there are fewer users than the page size', async() => {
				pageSizeSelector.value = '50';
				pageSizeSelector.dispatchEvent(new Event('change'));
				await new Promise(resolve => setTimeout(resolve, 200));
				await innerTable.updateComplete;
				await pageSelector.updateComplete;

				expect(pageSelector.selectedCountOption).to.equal(50);
				expect(pageSelector.maxPageNumber).to.equal(1);
				expect(pageSelector.pageNumber).to.equal(1);

				const displayedUsers = Array.from(innerTable.shadowRoot.querySelectorAll('tbody > tr > td:first-child > div'));
				expect(displayedUsers.length).to.equal(23);
				displayedUsers.forEach((user, idx) => {
					expect(user.innerText).to.equal(data.userDataForDisplay[idx][0]);
				});

			});

			it('should show zero pages if there are no users to display', async() => {
				el.data = { userDataForDisplay: [] };
				await new Promise(resolve => setTimeout(resolve, 200));
				await innerTable.updateComplete;
				await pageSelector.updateComplete;

				expect(pageSelector.selectedCountOption).to.equal(50);
				expect(pageSelector.maxPageNumber).to.equal(0);
				expect(pageSelector.pageNumber).to.equal(0);

				const displayedUsers = Array.from(innerTable.shadowRoot.querySelectorAll('tbody > tr > td:first-child > div'));
				expect(displayedUsers.length).to.equal(0);
			});

			it('should show 5 skeleton rows with zero pages if loading', async() => {
				el.data = { userDataForDisplay: [], isLoading: true };
				el.skeleton = true;
				await new Promise(resolve => setTimeout(resolve, 200));
				await innerTable.updateComplete;
				await pageSelector.updateComplete;

				expect(pageSelector.selectedCountOption).to.equal(50);
				expect(pageSelector.maxPageNumber).to.equal(0);
				expect(pageSelector.pageNumber).to.equal(0);

				const displayedUsers = Array.from(innerTable.shadowRoot.querySelectorAll('tbody > tr > td:first-child > div[skeleton]'));
				expect(displayedUsers.length).to.equal(5);
			});
		});
	});
});
