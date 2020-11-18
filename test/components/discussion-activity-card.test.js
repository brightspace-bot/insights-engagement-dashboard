import '../../components/discussion-activity-card.js';
import { disableUrlStateForTesting, enableUrlState } from '../../model/urlState';
import { expect, fixture, html } from '@open-wc/testing';
import { DiscussionActivityFilter } from '../../components/discussion-activity-card';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-discussion-activity-card', () => {
	before(() => disableUrlStateForTesting());
	after(() => enableUrlState());
	const records = [
		[1, 100, 500, 1, 55, 1000, null, 0, 0, 0],
		[1, 200, 600, 0, 33, 2000, Date.now() - 2093, 0, 0, 0],
		[1, 300, 500, 0, null, 1000, null, 0, 0, 0],
		[1, 400, 500, 0, 30, 5000, null, 0, 0, 0],
		[1, 500, 500, 0, 65, 5000, null, 2, 0, 40],
		[1, 500, 600, 0, 51, 4000, null, 0, 0, 0],
		[2, 100, 500, 0, 60, 1100, null, 2, 4, 0],
		[2, 200, 700, 1, 38, 4000, null, 0, 0, 0],
		[1, 200, 700, 1, 71, 4000, null, 0, 0, 0],
		[1, 100, 700, 1, 81, 1000, null, 3, 2, 1],
		[2, 100, 700, 1, 91, 1200, null, 1, 33, 1],
		[2, 300, 500, 0, 9, 7200, null, 1, 3, 5],
		[2, 300, 700, 0, 3, 0, 289298332, 0, 0, 0],
		[2, 400, 700, 0, 100, 7200, Date.now() - 432000001, 0, 0, 0],
		[2, 500, 700, 0, 88, 4000, null, 4, 4, 1],
		[8, 200, 700, 0, null, 0, null, 55, 2, 3],
		[6, 600, 700, 0, 95, 2000, Date.now() - 8560938122, 0, 0, 0],
		[1, 400, 700, 1, 75, 2000, null, 2, 1, 4]
	];
	const filter = new DiscussionActivityFilter();
	const data = {
		getFilter: id => (id === filter.id ? filter : null),
		withoutFilter: id => (id === filter.id ? { records } : null)
	};

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-discussion-activity-card');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-insights-discussion-activity-card .data="${data}"></d2l-insights-discussion-activity-card>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should render the pie chart as expected', async() => {
			const el = await fixture(html`<d2l-insights-discussion-activity-card .data="${data}"></d2l-insights-discussion-activity-card>`);
			await new Promise(resolve => setTimeout(resolve, 200)); // allow fetch to run
			const title = (el.shadowRoot.querySelectorAll('div.d2l-insights-discussion-activity-card-title'));
			expect(title[0].innerText).to.equal('Discussion Activity');
			expect(el._discussionActivityStats.threadSum).to.equal(70);
			expect(el._discussionActivityStats.replySum).to.equal(49);
			expect(el._discussionActivityStats.readSum).to.equal(55);
		});
	});
});
