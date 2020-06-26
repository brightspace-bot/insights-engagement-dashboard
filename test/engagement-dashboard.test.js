import '../engagement-dashboard.js';
import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-labs-engagement-dashboard', () => {

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-labs-engagement-dashboard></d2l-labs-engagement-dashboard>`);
			await new Promise(resolve => setTimeout(resolve, 1500));
			await expect(el).to.be.accessible();
		});
	});

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-labs-engagement-dashboard');
		});
	});

});
