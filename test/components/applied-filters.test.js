import '../../components/applied-filters';

import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';
import sinon from 'sinon/pkg/sinon-esm.js';

describe('d2l-insights-applied-filters', () => {
	const data = {
		setTiCVsGradesCardSelection : sinon.stub().resolves(false),
		overdueAssignmentSelected : sinon.stub().resolves(false)
	};

	beforeEach(() => {
		data.cardFilters = {};
		data.setApplied = (key, isApplied) => data.cardFilters[key].isApplied = isApplied;
	});

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-applied-filters');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-insights-applied-filters .data="${data}"></d2l-insights-applied-filters>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should not render if there are no card filters', async() => {
			const el = await fixture(html`<d2l-insights-applied-filters .data="${data}"></d2l-insights-applied-filters>`);
			const appliedFilters = el.shadowRoot.querySelector('d2l-applied-filters');
			expect(appliedFilters).to.be.null;
		});

		it('should not render if card filters are not applied', async() => {
			data.cardFilters = {
				'filter-key-1':	{ id: '1', title: 'filter 1', isApplied: false }
			};
			const el = await fixture(html`<d2l-insights-applied-filters .data="${data}"></d2l-insights-applied-filters>`);
			const appliedFilters = el.shadowRoot.querySelector('d2l-applied-filters');
			expect(appliedFilters).to.be.null;
		});

		it('should render Clear All button and filter title for applied filters', async() => {
			data.cardFilters = {
				'filter-key-1':	{ id: '1', title: 'filter 1', isApplied: false },
				'filter-key-2':	{ id: '2', title: 'filter 2', isApplied: true }
			};
			const el = await fixture(html`<d2l-insights-applied-filters .data="${data}"></d2l-insights-applied-filters>`);
			const appliedFilters = el.shadowRoot.querySelector('d2l-applied-filters');
			expect(appliedFilters).to.exist;

			const filters = appliedFilters.shadowRoot.querySelectorAll('d2l-labs-multi-select-list-item');
			expect(filters.length).to.equal(2);
			expect(filters[0].text).to.equal('filter 2');
			expect(filters[1].text).to.equal('Clear all');
		});

		it('should clear all card filters if click on Clear All button', async() => {
			data.cardFilters = {
				'filter-key-1':	{ id: '1', title: 'filter 1', isApplied: true },
				'filter-key-2':	{ id: '2', title: 'filter 2', isApplied: true }
			};
			const el = await fixture(html`<d2l-insights-applied-filters .data="${data}"></d2l-insights-applied-filters>`);
			const appliedFilters = el.shadowRoot.querySelector('d2l-applied-filters');
			expect(appliedFilters).to.exist;

			const filters = appliedFilters.shadowRoot.querySelectorAll('d2l-labs-multi-select-list-item');
			filters[1].shadowRoot.querySelector('.d2l-labs-multi-select-delete-icon').click();
			expect(Object.entries(data.cardFilters).filter(f => f.isApplied)).to.be.empty;
		});

		it('should clear a card filter if do a click on its clear button', async() => {
			data.cardFilters = {
				'filter-key-1':	{ id: '1', title: 'filter 1', isApplied: true },
				'filter-key-2':	{ id: '2', title: 'filter 2', isApplied: true }
			};
			const el = await fixture(html`<d2l-insights-applied-filters .data="${data}"></d2l-insights-applied-filters>`);
			const appliedFilters = el.shadowRoot.querySelector('d2l-applied-filters');
			expect(appliedFilters).to.exist;

			const filters = appliedFilters.shadowRoot.querySelectorAll('d2l-labs-multi-select-list-item');
			filters[0].shadowRoot.querySelector('.d2l-labs-multi-select-delete-icon').click();
			const clearedFilters = Object.keys(data.cardFilters)
				.map(key => data.cardFilters[key])
				.filter(f => !f.isApplied);

			expect(clearedFilters.length).to.equal(1);
			expect(clearedFilters[0].title).to.equal('filter 1');
		});
	});
});
