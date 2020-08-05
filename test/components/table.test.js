import '../../components/table.js';

import {expect, fixture, html} from '@open-wc/testing';
import {runConstructor} from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-table', () => {
	const data = {
		serverData: {
			users: [
				[1, 'First1', 'Last1'],
				[2, 'First2', 'Last2'],
				[3, 'First3', 'Last3']
			]
		}
	};

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-table');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-insights-table .data="${data}"></d2l-insights-table>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should have a row for each user, and it should contain correct data', async() => {
			const el = await fixture(html`<d2l-insights-table .data="${data}"></d2l-insights-table>`);
			const rows = Array.from(el.shadowRoot.querySelectorAll('tbody>tr'));
			expect(rows.length).to.equal(3);
			rows.forEach((row, idx) => {
				const cells = Array.from(row.querySelectorAll('td'));
				const lastFirstNameCell = cells[0];
				const expectedUser = data.serverData.users[idx];

				expect(lastFirstNameCell.innerText).to.equal(`${expectedUser[2]}, ${expectedUser[1]}`);
			});
		});
	});
});
