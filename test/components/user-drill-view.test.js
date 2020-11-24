import '../../components/user-drill-view';

import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-user-drill-view', () => {
	let user = {
		firstName: 'firstName',
		lastName: 'lastName',
		username: 'username',
		userId: 232
	};
	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-user-drill-view');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-insights-user-drill-view .user=${user}></d2l-insights-user-drill-view>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should render proper title and sub-title', async() => {
			const el = await fixture(html`<d2l-insights-user-drill-view .user=${user}></d2l-insights-user-drill-view>`);

			const titile = el.shadowRoot.querySelector('div.d2l-insights-user-drill-view-profile-name > div.d2l-heading-2').innerText;
			expect(titile).to.equal('firstName, lastName');

			const subTitile = el.shadowRoot.querySelector('div.d2l-insights-user-drill-view-profile-name > div.d2l-body-small').innerText;
			expect(subTitile).to.equal('username - 232');
		});
	});
});
