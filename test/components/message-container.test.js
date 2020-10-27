import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-message-container', () => {

	const dataWithTruncatedRecords = {
		_data: {
			serverData : {
				isRecordsTruncated: true
			}
		}
	};

	const dataWithoutTruncatedRecords = {
		_data: {
			serverData : {
				isRecordsTruncated: false
			}
		}
	};

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-message-container');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-insights-message-container .data="${dataWithTruncatedRecords}"></d2l-insights-message-container>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should render as expected with truncated records', async() => {
			const el = await fixture(html`<d2l-insights-message-container .data="${dataWithTruncatedRecords}"></d2l-insights-message-container>`);
			expect(el.shadowRoot.querySelector('span.d2l-insights-message-container-value').innerText).to.equal('There are too many results in your filters. Please refine your selection.');
		});

		it('should not render without truncated records', async() => {
			const el = await fixture(html`<d2l-insights-message-container .data="${dataWithoutTruncatedRecords}"></d2l-insights-message-container>`);
			expect(el.shadowRoot.querySelector('.d2l-insights-message-container-value')).to.equal(null);
		});
	});
});
