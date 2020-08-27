import '../../components/current-final-grade-card.js';

import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-current-final-grade-card', () => {
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
});
