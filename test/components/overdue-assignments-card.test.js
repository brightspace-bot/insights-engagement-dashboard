import '../../components/overdue-assignments-card';

import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-overdue-assignments-card', () => {
	const data = {
		usersCountsWithOverdueAssignments: 2
	};

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-overdue-assignments-card');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-insights-overdue-assignments-card .data="${data}"></d2l-insights-overdue-assignments-card>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should render the proper number of users with overdue assignments', async() => {
			const el = await fixture(html`<d2l-insights-overdue-assignments-card .data="${data}"></d2l-insights-overdue-assignments-card>`);
			expect(el.shadowRoot.querySelector('d2l-labs-summary-card').value).to.deep.equal('2');
			expect(el.shadowRoot.querySelector('d2l-labs-summary-card').title).to.deep.equal('Overdue Assignments');
			expect(el.shadowRoot.querySelector('d2l-labs-summary-card').message).to.deep.equal('Users currently have one or more overdue assignments.');
			expect(el.shadowRoot.querySelector('d2l-labs-summary-card').isValueClickable).to.deep.equal(true);
		});
	});
});
