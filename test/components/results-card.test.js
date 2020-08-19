import '../../components/users-table.js';

import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

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
			runConstructor('d2l-insights-results-card');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-insights-results-card .data="${data}"></d2l-insights-results-card>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should render the proper value for users', async() => {
			const el = await fixture(html`<d2l-insights-results-card .data="${data}"></d2l-insights-results-card>`);
			await new Promise(resolve => setTimeout(resolve, 200)); // allow fetch to run
			expect(el.shadowRoot.querySelector('d2l-labs-summary-card').value).to.deep.equal('4');
		});
	});
});
