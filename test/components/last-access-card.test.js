import { expect, fixture, html } from '@open-wc/testing';
import { LastAccessFilter } from '../../components/last-access-card';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-last-access-card', () => {

	const data = {
		users : [
			[100, 'John', 'Lennon', 'jlennon',  Date.now() - 2000000000],
			[200, 'Paul', 'McCartney', 'pmccartney', null]
		]
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

	describe('filter', () => {
		it('should not be applied if users set are empty', () => {
			expect(new LastAccessFilter().isApplied).to.be.false;
		});

		it('should be applied if users set added', () => {
			const filter = new LastAccessFilter();
			filter.addUsersToSet([100, 200]);
			expect(filter.isApplied).to.be.true;
		});

		it('should clear', () => {
			const filter = new LastAccessFilter();
			filter.addUsersToSet([100, 200]);
			filter.isApplied = false;
			expect(filter.isApplied).to.be.false;
		});

		[
			{ set: [[100, 200]], expected: [100, 100, 200] },
			{ set: [[100]], expected: [100, 100] }
		].forEach(params =>
			it(`should filter by users sets [${params.set}]`, () => {
				const records = [
					[1, 100],
					[2, 100],
					[3, 200],
					[4, 300]
				];
				const filter = new LastAccessFilter();
				params.set.forEach(x => filter.addUsersToSet(x));
				const actual = records.filter(r => filter.filter(r)).map(x => x[1]);
				expect(actual).to.deep.equal(params.expected);
			})
		);
	});
});
