import '../engagement-dashboard.js';
import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-engagement-dashboard', () => {

	describe('accessibility', () => {
		it('should pass all axe tests', async function() {
			this.timeout(3000);

			const el = await fixture(html`<d2l-insights-engagement-dashboard demo></d2l-insights-engagement-dashboard>`);
			// need for this delay might be tied to the mock data async loading in engagement-dashboard.js
			await new Promise(resolve => setTimeout(resolve, 1500));
			await expect(el).to.be.accessible();
		});
	});

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-engagement-dashboard');
		});
	});

});
