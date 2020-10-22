import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { records } from '../model/mocks';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';
import { TimeInContentVsGradeFilter } from '../../components/time-in-content-vs-grade-card';

describe('TimeInContentVsGradeFilter', () => {
	let sut;
	beforeEach(() => {
		sut = new TimeInContentVsGradeFilter({ records });
	});

	describe('avgGrade', () => {
		it('should calculate the average for all records in the (filtered) data', () => {
			expect(sut.avgGrade).to.equal(69);
		});
	});

	describe('avgTimeInContent', () => {
		it('should calculate the average for all records in the (filtered) data', () => {
			expect(sut.avgTimeInContent).to.equal(29);
		});
	});

	describe('calculateQuadrant', () => {
		[
			{ tic: 10, grade: 30, expected: 'leftBottom' },
			{ tic: 0, grade: 90, expected: 'leftTop' },
			{ tic: 10000, grade: 0, expected: 'rightBottom' },
			{ tic: 100, grade: 70, expected: 'rightTop' },
			{ tic: 29, grade: 69, expected: 'leftTop' },
			{ tic: 29, grade: 68, expected: 'rightBottom' },
			{ tic: 30, grade: 69, expected: 'rightBottom' }
		].forEach(params => it(`puts (${params.tic},${params.grade}) in the ${params.expected} quadrant`, () => {
			expect(sut.calculateQuadrant(params.tic, params.grade)).to.equal(params.expected);
		}));
	});

	describe('filter', () => {
		['leftTop', 'leftBottom', 'rightTop', 'rightBottom'].forEach(quadrant =>
			[
				{ r: [0, 0, 0, 0, 98, 0], quadrant: 'leftTop' },
				{ r: [0, 0, 0, 0, 68.9, 0], quadrant: 'leftBottom' },
				{ r: [0, 0, 0, 0, 98, 1739], quadrant: 'leftTop' },
				{ r: [0, 0, 0, 0, 98, 1800], quadrant: 'rightTop' },
				{ r: [0, 0, 0, 0, 68.9, 1739], quadrant: 'leftBottom' },
				{ r: [0, 0, 0, 0, 70, 1800], quadrant: 'rightTop' },
				{ r: [0, 0, 0, 0, 25, 1800], quadrant: 'rightBottom' }
			].forEach(params =>
				it(`${params.quadrant === quadrant ? 'passes' : 'rejects'} (${params.r[5]},${params.r[4]}) for ${quadrant}`,
					() => {
						sut.quadrant = quadrant;
						expect(sut.filter(params.r)).to.equal(params.quadrant === quadrant);
					})
			)
		);
	});

	describe('getDataForQuadrant', () => {
		[
			{ quadrant: 'leftTop', expected: [[0, 100], [0, 100], [0, 100], [0, 73], [0, 73], [0, 98], [0, 89], [0, 98], [0, 88], [0, 99]] },
			{ quadrant: 'leftBottom', expected: [[0, 33], [0, 42], [0, 66]] },
			{ quadrant: 'rightTop', expected: [[116, 93], [100, 75], [66, 84]] },
			{ quadrant: 'rightBottom', expected: [[33, 22], [41, 33], [66, 44], [75, 55], [58, 41], [83, 55], [50, 39]] }
		].forEach(params => it(`returns data for ${params.quadrant}`, () => {
			expect(sut.getDataForQuadrant(params.quadrant)).to.deep.equal(params.expected);
		}));
	});

	describe('tiCVsGrades',  () => {
		it('should return the array of tuples: current final grade vs time in content, mins', async() => {
			const expected = [[33, 22], [41, 33], [66, 44], [75, 55], [0, 33], [0, 100], [0, 100], [0, 100], [0, 73], [0, 73], [58, 41], [83, 55], [50, 39], [116, 93], [100, 75], [66, 84], [0, 98], [0, 89], [0, 98], [0, 88], [0, 99], [0, 42], [0, 66]];
			expect(sut.tiCVsGrades).to.deep.equal(expected);
		});
	});
});

describe('d2l-insights-time-in-content-vs-grade-card', () => {
	const data = {
		records
	};
	const filter = new TimeInContentVsGradeFilter(data);
	data.getFilter = id => (id === filter.id ? filter : null);

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-insights-time-in-content-vs-grade-card');
		});
	});

	describe('accessibility', () => {
		it('should pass all axe tests', async() => {
			const el = await fixture(html`<d2l-insights-time-in-content-vs-grade-card .data="${data}"></d2l-insights-time-in-content-vs-grade-card>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('render', () => {
		it('should render as expected', async() => {
			const el = await fixture(html`<d2l-insights-time-in-content-vs-grade-card .data="${data}"></d2l-insights-time-in-content-vs-grade-card>`);
			const title = (el.shadowRoot.querySelectorAll('div.d2l-insights-time-in-content-vs-grade-title'));
			expect(title[0].innerText).to.equal('Time in Content vs. Grade');
		});

		it('should exclude chart form tabindex when data is loading', async() => {
			const el = await fixture(html`<d2l-insights-time-in-content-vs-grade-card .data="${data}" skeleton></d2l-insights-time-in-content-vs-grade-card>`);

			const chart = el.shadowRoot.querySelector('d2l-labs-chart');
			const chartDiv = chart.shadowRoot.querySelector('#chart-container');
			expect(chartDiv.getAttribute('tabindex')).to.equal('-1');

			el.skeleton = false;
			await elementUpdated(el);
			expect(chartDiv.getAttribute('tabindex')).to.equal('0');
		});
	});
});
