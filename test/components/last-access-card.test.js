import '../../components/last-access-card';

import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-last-access-card', () => {
	const data = {
		usersCountsWithLastAccessMoreThanFourteenDays: 2
	};

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-last-access-card');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-insights-last-access-card .data="${data}"></d2l-insights-last-access-card>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should render the proper number of users who have no system access in the last 14 days', async() => {
			const el = await fixture(html`<d2l-insights-last-access-card .data="${data}"></d2l-insights-last-access-card>`);
			expect(el.shadowRoot.querySelector('d2l-labs-summary-card').value).to.deep.equal('2');
			expect(el.shadowRoot.querySelector('d2l-labs-summary-card').title).to.deep.equal('System Access');
			expect(el.shadowRoot.querySelector('d2l-labs-summary-card').message).to.deep.equal('Users have no system access in the last 14 days.');
			expect(el.shadowRoot.querySelector('d2l-labs-summary-card').isValueClickable).to.deep.equal(true);
		});
	});
});
