import '../../components/expander-with-control';

import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper';

describe('d2l-insights-expander-with-control', () => {
	let elExpanded, elCollapsed;
	beforeEach(async() => {
		elExpanded = await fixture(html`
				<d2l-insights-expander-with-control
					expanded
					control-collapsed-text="collapsed"
					control-expanded-text="expanded">

					<span>The inner expand-collapse-content element needs something inside it </span>
					<span>to know when expand/collapse animations are done</span>

				</d2l-insights-expander-with-control>`);

		await elExpanded.updateComplete;

		elCollapsed = await fixture(html`
				<d2l-insights-expander-with-control
					control-collapsed-text="collapsed"
					control-expanded-text="expanded">

					<span>The inner expand-collapse-content element needs something inside it </span>
					<span>to know when expand/collapse animations are done</span>

				</d2l-insights-expander-with-control>`);

		await elCollapsed.updateComplete;
	});

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-expander-with-control');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			await expect(elCollapsed).to.be.accessible();
			await expect(elExpanded).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should render (collapsed)', async() => {
			const expandCollapseContent = elCollapsed.shadowRoot.querySelector('d2l-expand-collapse-content');
			expect(expandCollapseContent.expanded).to.equal(false);

			const buttonIcon = elCollapsed.shadowRoot.querySelector('d2l-button-icon');
			expect(buttonIcon.icon).to.equal('tier1:arrow-expand');

			const controlDivText = elCollapsed.shadowRoot.querySelector('p');
			expect(controlDivText.innerText).to.equal('collapsed');
		});

		it('should render (expanded)', async() => {
			const expandCollapseContent = elExpanded.shadowRoot.querySelector('d2l-expand-collapse-content');
			expect(expandCollapseContent.expanded).to.equal(true);

			const buttonIcon = elExpanded.shadowRoot.querySelector('d2l-button-icon');
			expect(buttonIcon.icon).to.equal('tier1:arrow-collapse');

			const controlDivText = elExpanded.shadowRoot.querySelector('p');
			expect(controlDivText.innerText).to.equal('expanded');
		});
	});

	describe('interactions/eventing', () => {

		it('should fire collapsed event if element is expanded and control is clicked', async function() {
			this.timeout(3000);

			const controlDiv = elExpanded.shadowRoot.querySelector('div');
			const promise = new Promise(resolve => {
				elExpanded.addEventListener('d2l-insights-expander-with-control-collapsed', (e => resolve(e)), { once: true });
			});
			controlDiv.click();
			await promise;
		});

		it('should fire expanded event if element is collapsed and control is clicked', async function() {
			this.timeout(3000);

			const controlDiv = elCollapsed.shadowRoot.querySelector('div');
			const promise = new Promise(resolve => {
				elCollapsed.addEventListener('d2l-insights-expander-with-control-expanded', (e => resolve(e)), { once: true });
			});
			controlDiv.click();
			await promise;
		});
	});
});
