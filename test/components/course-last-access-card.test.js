import '../../components/course-last-access-card.js';

import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-course-last-access-card', () => {
	const data = {
		courseLastAccessDates: [1, 3, 4, 2, 4, 3]
	};

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-course-last-access-card');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async function() {
			this.timeout(3000);

			const el = await fixture(html`<d2l-insights-course-last-access-card .data="${data}"></d2l-insights-course-last-access-card>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should render as expected', async() => {
			const el = await fixture(html`<d2l-insights-course-last-access-card .data="${data}"></d2l-insights-course-last-access-card>`);
			await new Promise(resolve => setTimeout(resolve, 200)); // allow fetch to run
			const title = (el.shadowRoot.querySelectorAll('div.d2l-insights-course-last-access-title'));
			expect(title[0].innerText).to.equal('Course Access');
			expect(el._preparedBarChartData.toString()).to.equal(data.courseLastAccessDates.toString());
		});
	});

});
