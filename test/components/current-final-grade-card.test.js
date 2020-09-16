import '../../components/current-final-grade-card.js';

import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-current-final-grade-card', () => {
	const data = {
		currentFinalGrades: [2, 4, 12, 31, 43, 40, 55, null, 88]
	};

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-current-final-grade-card');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async function() {
			this.timeout(4000);

			const el = await fixture(html`<d2l-insights-current-final-grade-card .data="${data}"></d2l-insights-current-final-grade-card>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should render as expected', async() => {
			const el = await fixture(html`<d2l-insights-current-final-grade-card .data="${data}"></d2l-insights-current-final-grade-card>`);
			await new Promise(resolve => setTimeout(resolve, 200)); // allow fetch to run
			const title = (el.shadowRoot.querySelectorAll('div.d2l-insights-current-final-grade-title'));
			expect(title[0].innerText).to.equal('Current Grade');
			expect(el._preparedHistogramData.toString()).to.equal(data.currentFinalGrades.toString());
		});
	});

});
