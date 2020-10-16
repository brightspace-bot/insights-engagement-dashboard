
import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-discussion-activity-card', () => {
	const data = {
		discussionActivityStats: [20, 40, 42]
	};

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-discussion-activity-card');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-discussion-activity-card .data="${data}"></d2l-insights-discussion-activity-card>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should render the pie chart as expected', async() => {
			const el = await fixture(html`<d2l-insights-discussion-activity-card .data="${data}"></d2l-insights-discussion-activity-card>`);
			await new Promise(resolve => setTimeout(resolve, 200)); // allow fetch to run
			const title = (el.shadowRoot.querySelectorAll('div.d2l-insights-discussion-activity-card-title'));
			expect(title[0].innerText).to.equal('Discussion Activity');
			expect(el._discussionActivityStats.toString()).to.equal(data.discussionActivityStats.toString());
		});
	});
});
