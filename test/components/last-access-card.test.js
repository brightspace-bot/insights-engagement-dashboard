import { expect, fixture, html } from '@open-wc/testing';
import { LastAccessFilter } from '../../components/last-access-card';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-last-access-card', () => {
	const filter = new LastAccessFilter();
	const data = {
		getFilter: id => (id === filter.id ? filter : null),
		excluding: id => (id === filter.id ? {
			users : [
				[100, 'John', 'Lennon', 'jlennon',  Date.now() - 2000000000],
				[200, 'Paul', 'McCartney', 'pmccartney', null],
				[300, 'Ringo', 'Starr', 'rstarr', Date.now()]
			]
		} : null)
	};

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-last-access-card');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-insights-last-access-card .data="${data}"></d2l-insights-last-access-card>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should render as expected', async() => {
			const el = await fixture(html`<d2l-insights-last-access-card .data="${data}"></d2l-insights-last-access-card>`);
			expect(el.shadowRoot.querySelector('d2l-labs-summary-card').value).to.deep.equal('2');
			expect(el.shadowRoot.querySelector('d2l-labs-summary-card').title).to.deep.equal('System Access');
			expect(el.shadowRoot.querySelector('d2l-labs-summary-card').message).to.deep.equal('Users have no system access in the last 14 days.');
			expect(el.shadowRoot.querySelector('d2l-labs-summary-card').isValueClickable).to.deep.equal(true);
			const expected = 2;
			expect(el._cardValue).to.deep.equal(expected);
		});
	});
});
