import '../../components/aria-loading-progress';

import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-aria-loading-progress', () => {
	const data = {
		isLoading: true
	};

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-aria-loading-progress');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-insights-aria-loading-progress .data="${data}"></d2l-insights-aria-loading-progress>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should render only screen reader visible alerts', async() => {
			const renderData = {
				isLoading: true
			};

			const el = await fixture(html`<d2l-insights-aria-loading-progress .data="${renderData}"></d2l-insights-aria-loading-progress>`);

			const nodes = el.shadowRoot.querySelectorAll('div div[role="alert"]');
			expect(nodes.length).to.equal(1);
			expect(nodes[0].innerText).to.equal('Loading is in progress');

			// simulate loading completion
			renderData.isLoading = false;
			el.requestUpdate();
			await elementUpdated(el);

			const nodesAfterLoading = el.shadowRoot.querySelectorAll('div div[role="alert"]');
			expect(nodesAfterLoading.length).to.equal(1);
			expect(nodesAfterLoading[0].getAttribute('aria-label')).to.equal('Loading is finished');
		});
	});
});
