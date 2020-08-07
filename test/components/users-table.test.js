import '../../components/users-table.js';

import {expect, fixture, html} from '@open-wc/testing';
import {runConstructor} from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-users-table', () => {
	const data = {
		userDataForDisplay: [
			'Lennon, John',
			'McCartney, Paul',
			'Harrison, George',
			'Starr, Ringo'
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
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should calculate and display the correct number of users', async() => {
			const el = await fixture(html`<d2l-insights-users-table .data="${data}"></d2l-insights-users-table>`);
			const totalUsersText = el.shadowRoot.querySelectorAll('.table-controls-item')[0];
			expect(totalUsersText.innerText).to.equal('Total Users: 4');
		});
	});
});
