import '../../components/users-table.js';

import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

const data = {
	// returns [
	//   [['0Last, 0First', 'user0 - 0'], '', '', ''],
	//   [['1Last, 1First', 'user1 - 1'], '', '', ''],
	//   ...,
	//   [['22Last, 22First', 'user22 - 22'], '', '', ''],
	// ]
	userDataForDisplay: Array.from(
		{ length: 23 },
		(val, idx) => [[`${idx}Last, ${idx}First`, `user${idx} - ${idx}`], Math.floor(Math.random() * 10), '', '']
	)
};

describe('d2l-insights-users-table', () => {

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

			async function finishUpdate() {
				await new Promise(resolve => setTimeout(resolve, 200));
				await innerTable.updateComplete;
				await pageSelector.updateComplete;
			}

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
			// I don't see any options to force maximized windows though, so I'm increasing timeout in `before` instead
			it('should show the first 20 users in order on the first page, if there are more than 20 users', () => {
				// the default page size is 20
				expect(pageSelector.selectedCountOption).to.equal(20);
				expect(pageSelector.maxPageNumber).to.equal(2);
				expect(pageSelector.pageNumber).to.equal(1);

				// since there are 23 users, the first (default) page should show the first 20 users, in order, on it
				verifyUserInfoColumn(innerTable, 20, 0);
				verifyCourseCountColumn(innerTable, 20, 0);
			});

			it('should show the correct number of users on the last page', async() => {
				pageSelector
					.shadowRoot.querySelector('d2l-button-icon[text="Next page"]')
					.shadowRoot.querySelector('button')
					.click();
				await finishUpdate();

				expect(pageSelector.pageNumber).to.equal(2);

				verifyUserInfoColumn(innerTable, 3, 20);
				verifyCourseCountColumn(innerTable, 3, 20);
			});

			it('should change number of users shown and total number of pages if the page size changes', async() => {
				pageSizeSelector.value = '10';
				pageSizeSelector.dispatchEvent(new Event('change'));
				await finishUpdate();

				expect(pageSelector.selectedCountOption).to.equal(10);
				expect(pageSelector.maxPageNumber).to.equal(3);
				expect(pageSelector.pageNumber).to.equal(1);

				verifyUserInfoColumn(innerTable, 10, 0);
				verifyCourseCountColumn(innerTable, 10, 0);

				pageSelector
					.shadowRoot.querySelector('d2l-button-icon[text="Next page"]')
					.shadowRoot.querySelector('button')
					.click();
				await finishUpdate();

				expect(pageSelector.pageNumber).to.equal(2);

				verifyUserInfoColumn(innerTable, 10, 10);
				verifyCourseCountColumn(innerTable, 10, 10);

				pageSelector
					.shadowRoot.querySelector('d2l-button-icon[text="Next page"]')
					.shadowRoot.querySelector('button')
					.click();
				await finishUpdate();

				expect(pageSelector.pageNumber).to.equal(3);

				verifyUserInfoColumn(innerTable, 3, 20);
				verifyCourseCountColumn(innerTable, 3, 20);
			});

			it('should show all users on a single page if there are fewer users than the page size', async() => {
				pageSizeSelector.value = '50';
				pageSizeSelector.dispatchEvent(new Event('change'));
				await finishUpdate();

				expect(pageSelector.selectedCountOption).to.equal(50);
				expect(pageSelector.maxPageNumber).to.equal(1);
				expect(pageSelector.pageNumber).to.equal(1);

				verifyUserInfoColumn(innerTable, 23, 0);
				verifyCourseCountColumn(innerTable, 23, 0);
			});

			it('should show zero pages if there are no users to display', async() => {
				el.data = { userDataForDisplay: [] };
				await finishUpdate();

				expect(pageSelector.selectedCountOption).to.equal(50);
				expect(pageSelector.maxPageNumber).to.equal(0);
				expect(pageSelector.pageNumber).to.equal(0);

				verifyUserInfoColumn(innerTable, 0, 0);
				verifyCourseCountColumn(innerTable, 0, 0);
			});

			it('should show 20 skeleton rows with zero pages if loading', async() => {
				el.data = { userDataForDisplay: [], isLoading: true };
				el.skeleton = true;
				await finishUpdate();

				expect(pageSelector.selectedCountOption).to.equal(50);
				expect(pageSelector.maxPageNumber).to.equal(0);
				expect(pageSelector.pageNumber).to.equal(0);

				const displayedUsers = Array.from(innerTable.shadowRoot.querySelectorAll('tbody > tr > td:first-child'));
				expect(displayedUsers.length).to.equal(20);
			});
		});
	});
});

function verifyUserInfoColumn(table, expectedNumDisplayedRows, startRowNum) {
	const displayedUserInfo = Array.from(table.shadowRoot.querySelectorAll('tbody > tr > td:first-child'));
	expect(displayedUserInfo.length).to.equal(expectedNumDisplayedRows);
	displayedUserInfo.forEach((cell, rowIdx) => {
		const mainText = cell.querySelector('div:first-child');
		const subText = cell.querySelector('div:last-child');
		expect(mainText.innerText).to.equal(data.userDataForDisplay[rowIdx + startRowNum][0][0]);
		expect(subText.innerText).to.equal(data.userDataForDisplay[rowIdx + startRowNum][0][1]);
	});
}

function verifyCourseCountColumn(table, expectedNumDisplayedRows, startRowNum) {
	const displayedUserInfo = Array.from(table.shadowRoot.querySelectorAll('tbody > tr > td:nth-child(2)'));
	expect(displayedUserInfo.length).to.equal(expectedNumDisplayedRows);
	displayedUserInfo.forEach((cell, rowIdx) => {
		const mainText = cell.querySelector('div');
		expect(mainText.innerText).to.equal(data.userDataForDisplay[rowIdx + startRowNum][1].toString());
	});
}
