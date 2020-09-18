import '../../components/time-in-content-vs-grade-card';

import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-time-in-content-vs-grade-card', () => {
	const data = {
		tiCVsGrades: [[22, 33], [33, 41]]
	};

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-time-in-content-vs-grade-card');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-insights-time-in-content-vs-grade-card .data="${data}"></d2l-insights-time-in-content-vs-grade-card>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should render as expected', async() => {
			const el = await fixture(html`<d2l-insights-time-in-content-vs-grade-card .data="${data}"></d2l-insights-time-in-content-vs-grade-card>`);
			const title = (el.shadowRoot.querySelectorAll('div.d2l-insights-time-in-content-vs-grade-title'));
			expect(title[0].innerText).to.equal('Time in Content vs. Grade');
			expect(el._preparedPlotData).to.equal(data.tiCVsGrades);
		});
	});
});
