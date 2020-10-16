import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { CurrentFinalGradesFilter } from '../../components/current-final-grade-card';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

const mockRoleIds = {
	admin: 100,
	instructor: 200,
	student: 300
};

describe('d2l-insights-current-final-grade-card', () => {
	const records = [
		[6606, 100, mockRoleIds.student, 0, 22, 2000, 10293819283], // this user has a cascading admin role on dept and sem levels
		[6606, 200, mockRoleIds.student, 0, 33, 2500, 10293819283],
		[6606, 300, mockRoleIds.student, 0, 44, 4000, 10293819283],
		[6606, 400, mockRoleIds.student, 0, 55, 4500, 10293819283], // this user has a cascading admin role on dept and sem levels

		// semesters
		[11, 100, mockRoleIds.admin, 0, null, 0, null],
		[12, 100, mockRoleIds.admin, 0, null, 0, null],
		[13, 100, mockRoleIds.admin, 0, null, 0, null],

		[11, 200, mockRoleIds.student, 0, 33, 0, null],
		[12, 200, mockRoleIds.instructor, 0, null, 0, null],

		[11, 300, mockRoleIds.student, 0, 100, 0, null],
		[12, 300, mockRoleIds.student, 0, 100, 0, null],
		[13, 300, mockRoleIds.student, 0, 100, 0, null],

		[11, 400, mockRoleIds.admin, 0, null, 0, 12392838182],
		[12, 400, mockRoleIds.admin, 0, null, 0, 12392838182],
		[13, 400, mockRoleIds.admin, 0, null, 0, null],

		// dept 1
		[1001, 100, mockRoleIds.admin, 0, null, 0, null],
		[1001, 200, mockRoleIds.student, 0, 73, 0, null],
		[1001, 300, mockRoleIds.student, 0, 73, 0, null],
		// courses
		[1, 100, mockRoleIds.admin, 0, null, 0, null],
		[1, 200, mockRoleIds.instructor, 0, null, 0, null],
		[1, 300, mockRoleIds.student, 1, 41, 3500, null],
		[2, 100, mockRoleIds.admin, 0, null, 0, null],
		[2, 200, mockRoleIds.student, 0, 55, 5000, null],
		[2, 300, mockRoleIds.student, 0, 39, 3000, null],
		// course 1 offerings
		[111, 100, mockRoleIds.admin, 0, null, 0, null],
		[111, 200, mockRoleIds.student, 1, 93, 7000, null],
		[112, 100, mockRoleIds.admin, 0, null, 0, null],
		[112, 200, mockRoleIds.instructor, 0, null, 0, null], // this person was promoted from student to instructor
		[113, 100, mockRoleIds.admin, 0, null, 0, null],
		[113, 300, mockRoleIds.student, 0, 75, 6000, null],
		// course 2 offerings
		[212, 100, mockRoleIds.admin, 0, null, 0, 0],
		[212, 200, mockRoleIds.student, 0, 84, 4000, null],
		[212, 300, mockRoleIds.instructor, 0, null, 0, null],

		// dept 2
		[1002, 200, mockRoleIds.student, 0, 98, 0, null],
		[1002, 300, mockRoleIds.student, 0, 89, 0, null],
		[1002, 400, mockRoleIds.admin, 0, null, 0, null],
		[3, 200, mockRoleIds.student, 0, 98, 0, Date.now() - 299],
		[3, 300, mockRoleIds.student, 0, 88, 0, Date.now() - 86500000],
		[3, 400, mockRoleIds.admin, 0, null, 0, null],
		[311, 200, mockRoleIds.student, 0, 99, 0, null],
		[311, 300, mockRoleIds.student, 0, 42, 0, null],
		[311, 400, mockRoleIds.admin, 0, null, 0, null],
		[313, 300, mockRoleIds.student, 0, 66, 0, null],
		[313, 400, mockRoleIds.admin, 0, null, 0, null],
		[6606, 100, mockRoleIds.student, 0, null, 0, null], // this user has a cascading admin role on dept and sem levels
		[6606, 200, mockRoleIds.student, 0, null, 0, null],
		[6606, 300, mockRoleIds.student, 0, null, 0, null],
		[6606, 400, mockRoleIds.student, 0, null, 0, null], // this user has a cascading admin role on dept and sem levels
	];
	const filter = new CurrentFinalGradesFilter();
	const data = {
		getFilter: id => (id === filter.id ? filter : null),
		getRecordsInView: id => (id === filter.id ? records : null)
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
			const expected = [20, 30, 40, 50, 30, 90, 90, 90, 70, 70, 40, 50, 30, 90, 70, 80, 90, 80, 90, 80, 90, 40, 60];
			expect(el._preparedHistogramData).to.deep.equal(expected);
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
