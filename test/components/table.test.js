import '../../components/table.js';

import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-table', () => {
	const headers = [
		'header1',
		'header2',
		'header3'
	];

	const data = [
		['First Item', 1, 'value1'],
		['Second Item', 2, 'value2'],
		['Third Item', 3, 'value3'],
		['Fourth Item', 4, 'value4']
	];

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-table');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-insights-table .columnHeaders=${headers} .data="${data}"></d2l-insights-table>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should have correct header and data', async() => {
			const el = await fixture(html`<d2l-insights-table .columnHeaders=${headers} .data="${data}"></d2l-insights-table>`);

			const headerCells = Array.from(el.shadowRoot.querySelectorAll('thead>tr>th'));
			expect(headerCells.length).to.equal(headers.length);
			headerCells.forEach((cell, idx) => {
				expect(cell.innerText).to.equal(headers[idx]);
			});

			const rows = Array.from(el.shadowRoot.querySelectorAll('tbody>tr'));
			expect(rows.length).to.equal(4);

			rows.forEach((row, idx) => {
				const cells = Array.from(row.querySelectorAll('td'));
				expect(cells.length).to.equal(3);

				cells.forEach((cell, jdx) => {
					expect(cell.innerText).to.equal(data[idx][jdx].toString());
				});
			});
		});
	});
});
