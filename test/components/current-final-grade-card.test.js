import { disableUrlStateForTesting, enableUrlState } from '../../model/urlState';
import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { CurrentFinalGradesFilter } from '../../components/current-final-grade-card';
import { records } from '../model/mocks';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('d2l-insights-current-final-grade-card', () => {
	before(() => disableUrlStateForTesting());
	after(() => enableUrlState());
	const filter = new CurrentFinalGradesFilter();
	const data = {
		getFilter: id => (id === filter.id ? filter : null),
		withoutFilter: id => (id === filter.id ? { records } : null)
	};

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-current-final-grade-card');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async function() {
			this.timeout(3500);

			const el = await fixture(html`<d2l-insights-current-final-grade-card .data="${data}"></d2l-insights-current-final-grade-card>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should render as expected', async() => {
			const el = await fixture(html`<d2l-insights-current-final-grade-card .data="${data}"></d2l-insights-current-final-grade-card>`);
			await new Promise(resolve => setTimeout(resolve, 200)); // allow fetch to run
			const title = (el.shadowRoot.querySelectorAll('div.d2l-insights-current-final-grade-title'));
			expect(title[0].innerText).to.equal('Current Grade');
			const expected = [ 0, 0, 1, 2, 1, 2, 1, 2, 2, 2];
			expect(el._preparedHistogramData).to.deep.equal(expected);
			expect(el._colours).to.deep.equal(['var(--d2l-color-amethyst)']);
		});

		it('should colour selected bars', async() => {
			filter.selectCategory(30);
			filter.selectCategory(50);
			const el = await fixture(html`<d2l-insights-current-final-grade-card .data="${data}"></d2l-insights-current-final-grade-card>`);
			expect(el._colours).to.deep.equal([
				'var(--d2l-color-mica)',
				'var(--d2l-color-mica)',
				'var(--d2l-color-mica)',
				'var(--d2l-color-amethyst)',
				'var(--d2l-color-mica)',
				'var(--d2l-color-amethyst)',
				'var(--d2l-color-mica)',
				'var(--d2l-color-mica)',
				'var(--d2l-color-mica)',
				'var(--d2l-color-mica)'
			]);
		});

		it('should exclude chart form tabindex when data is loading', async() => {
			const el = await fixture(html`<d2l-insights-current-final-grade-card .data="${data}" skeleton></d2l-insights-current-final-grade-card>`);
			const chart = el.shadowRoot.querySelector('d2l-labs-chart');
			const chartDiv = chart.shadowRoot.querySelector('#chart-container');
			expect(chartDiv.getAttribute('tabindex')).to.equal('-1');

			el.skeleton = false;
			await elementUpdated(el);
			expect(chartDiv.getAttribute('tabindex')).to.equal('0');
		});
	});

	describe('filter', () => {
		it('should not be applied if no categories are selected', () => {
			expect(new CurrentFinalGradesFilter().isApplied).to.be.false;
		});

		it('should be applied if categories are selected', () => {
			const filter = new CurrentFinalGradesFilter();
			filter.selectCategory('a');
			expect(filter.isApplied).to.be.true;
		});

		it('should clear', () => {
			const filter = new CurrentFinalGradesFilter();
			filter.selectCategory('a');
			filter.isApplied = false;
			expect(filter.isApplied).to.be.false;
		});

		[
			{ categories: [10], expected: [1] },
			{ categories: [10, 90], expected: [1, 3, 7] },
			{ categories: [20], expected: [5, 6] },
			{ categories: [0], expected: [4] },
			{ categories: [80], expected: [] },
			{ categories: [0, 20, 80, 90], expected: [3, 4, 5, 6, 7] }
		].forEach(params =>
			it(`should filter by categories [${params.categories}]`, () => {
				const records = [
					[1, null, null, null, 19],
					[2, null, null, null, null],
					[3, null, null, null, 100],
					[4, null, null, null, 0],
					[5, null, null, null, 20],
					[6, null, null, null, 21.345],
					[7, null, null, null, 90]
				];
				const filter = new CurrentFinalGradesFilter();
				params.categories.forEach(x => filter.selectCategory(x));
				const actual = records.filter(r => filter.filter(r)).map(x => x[0]);
				expect(actual).to.deep.equal(params.expected);
			})
		);
	});
});
