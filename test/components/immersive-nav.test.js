import '../../components/immersive-nav';

import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-immersive-nav', () => {
	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-immersive-nav');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-insights-immersive-nav></d2l-insights-immersive-nav>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should render proper title and href for default view', async() => {
			const el = await fixture(html`<d2l-insights-immersive-nav></d2l-insights-immersive-nav>`);

			const titile = el.shadowRoot.querySelector('.d2l-insights-immersive-nav-title').innerText;
			expect(titile).to.equal('Engagement Dashboard');

			const href = el.shadowRoot.querySelector('d2l-navigation-link-back').href;
			expect(href).to.contain('/d2l/ap/insightsPortal/main.d2l?ou=0');
		});

		it('should render proper title for home view', async() => {
			const el = await fixture(html`<d2l-insights-immersive-nav view="home"></d2l-insights-immersive-nav>`);

			const titile = el.shadowRoot.querySelector('.d2l-insights-immersive-nav-title').innerText;
			expect(titile).to.equal('Engagement Dashboard');
		});

		it('should render proper title for user view', async() => {
			const el = await fixture(html`<d2l-insights-immersive-nav view="user"></d2l-insights-immersive-nav>`);

			const titile = el.shadowRoot.querySelector('.d2l-insights-immersive-nav-title').innerText;
			expect(titile).to.equal('Learner Engagement Dashboard');
		});

		it('should render proper href', async() => {
			const el = await fixture(html`<d2l-insights-immersive-nav org-unit-id="1201"></d2l-insights-immersive-nav>`);

			const href = el.shadowRoot.querySelector('d2l-navigation-link-back').href;
			expect(href).to.contain('/d2l/ap/insightsPortal/main.d2l?ou=1201');
		});
	});
});
