import '../../components/time-in-content-vs-grade-card';

import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-time-in-content-vs-grade-card', () => {
	const data = {
		tiCVsGrades: [[22, 33], [33, 41]],
		tiCVsGradesAvgValues: [11, 22]
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

		it('should exclude chart form tabindex when data is loading', async() => {
			const loadingData = Object.assign({}, data, { isLoading: true });
			const el = await fixture(html`<d2l-insights-time-in-content-vs-grade-card .data="${loadingData}"></d2l-insights-time-in-content-vs-grade-card>`);

			const chart = el.shadowRoot.querySelector('d2l-labs-chart');
			const chartDiv = chart.shadowRoot.querySelector('#chart-container');
			expect(chartDiv.getAttribute('tabindex')).to.equal('-1');

			loadingData.isLoading = false;
			el.requestUpdate();
			await elementUpdated(el);
			expect(chartDiv.getAttribute('tabindex')).to.equal('0');
		});
	});
});
