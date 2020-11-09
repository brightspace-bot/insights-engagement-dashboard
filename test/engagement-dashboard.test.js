import '../engagement-dashboard.js';
import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-engagement-dashboard', () => {

	describe('accessibility', () => {
		it('should pass all axe tests', async function() {
			this.timeout(7000);

			const el = await fixture(html`<d2l-insights-engagement-dashboard demo></d2l-insights-engagement-dashboard>`);
			// need for this delay might be tied to the mock data async loading in engagement-dashboard.js
			await new Promise(resolve => setTimeout(resolve, 1500));

			// close the default view dialog that shows up. It causes browsers on OSX to assign aria-attributes and
			// roles to buttons in the background that are not normally allowed
			const defaultViewDialog = el.shadowRoot.querySelector('d2l-insights-default-view-popup');
			defaultViewDialog.opened = false;
			// wait for the dialog closing animation to finish
			await new Promise(resolve => setTimeout(resolve, 500));

			// the scroll wrapper table component has a button in an aria-hidden div
			// so it technically breaks the accessibility test. To get around this
			// we exclude that test from this element. Please check for this rule manually
			// or disable this rule and make sure no other issues were introduced
			// during future development.
			await expect(el).to.be.accessible({
				ignoredRules: [
					'aria-hidden-focus',
					'button-name' // d2l-scroll-wrapper draws button at the right edge of the table. This button does not have a label.
				]
			});
		});
	});

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-engagement-dashboard');
		});
	});

});
