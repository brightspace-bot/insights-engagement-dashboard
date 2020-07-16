import '../engagement-dashboard.js';
import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('insights-engagement-dashboard', () => {

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<insights-engagement-dashboard></insights-engagement-dashboard>`);
			await new Promise(resolve => setTimeout(resolve, 1500));
			await expect(el).to.be.accessible();
		});
	});

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('insights-engagement-dashboard');
		});
	});

});
