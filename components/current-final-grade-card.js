import { computed, decorate } from 'mobx';
import { css, html } from 'lit-element/lit-element.js';
import { BEFORE_CHART_FORMAT } from './chart/chart';
import { bodyStandardStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { CategoryFilter } from '../model/categoryFilter';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';
import { RECORD } from '../consts';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';

const filterId = 'd2l-insights-current-final-grade-card';

function gradeCategory(grade) {
	if (grade === null || grade === 0) {
		return grade;
	}
	else if (grade === 100) {
		return 90; // put grade 100 in bin 90-100
	}
	else {
		return Math.floor(grade / 10) * 10;
	}
}

export class CurrentFinalGradesFilter extends CategoryFilter {
	constructor() {
		super(
			filterId,
			'components.insights-current-final-grade-card.currentGrade',
			record => this.selectedCategories.has(gradeCategory(record[RECORD.CURRENT_FINAL_GRADE]))
		);
	}
}

class CurrentFinalGradeCard extends SkeletonMixin(Localizer(MobxLitElement)) {

	static get properties() {
		return {
			data: { type: Object, attribute: false }
		};
	}

	constructor() {
		super();
		this.data = {};
	}

	static get styles() {
		return [super.styles, bodyStandardStyles, css`
			:host {
				display: inline-block;
			}
			:host([hidden]) {
				display: none;
			}

			.d2l-insights-final-grade-container {
				border-color: var(--d2l-color-mica);
				border-radius: 15px;
				border-style: solid;
				border-width: 1.5px;
				display: inline-block;
				height: 275px;
				margin-right: 10px;
				margin-top: 19.5px;
				padding: 15px;
				width: 602px;
			}

			.d2l-insights-current-final-grade-title {
				color: var(--d2l-color-ferrite);
				font-size: smaller;
				font-weight: bold;
				text-indent: 3%;
			}
		`];
	}

	get _cardTitle() {
		return this.localize('components.insights-current-final-grade-card.currentGrade');
	}

	get _chartDescriptionTextLabel() {
		return this.localize('components.insights-current-final-grade-card.textLabel');
	}

	// @computed
	get _preparedHistogramData() {
		const bins = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.data.withoutFilter(filterId).records
			.filter(record => record[RECORD.CURRENT_FINAL_GRADE] !== null && record[RECORD.CURRENT_FINAL_GRADE] !== undefined)
			.map(record => [record[RECORD.TIME_IN_CONTENT], record[RECORD.CURRENT_FINAL_GRADE]])
			.filter(item => item[0] || item[1])
			.map(item => gradeCategory(item[1]))
			.forEach(gradeCategory => bins[gradeCategory / 10] += 1);
		return bins;
	}

	get _colours() {
		const data = this._preparedHistogramData;
		if (!this.isApplied || !data.length) {
			return ['var(--d2l-color-amethyst)'];
		}

		// the histogram module only renders zeroes for points between non-zero points,
		// so we provide colours for all points starting with the minimum non-zero value
		// (extra colours will be ignored)
		const min = Math.min(...data);
		return [0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(category =>
			(this.category.has(category + min) ?
				'var(--d2l-color-amethyst)' :
				'var(--d2l-color-mica)')
		);
	}

	get _xAxisLabel() {
		return this.localize('components.insights-current-final-grade-card.xAxisLabel');
	}

	get _yAxisLabel() {
		return this.localize('components.insights-current-final-grade-card.numberOfStudents');
	}

	addToCategory(category) {
		this.filter.selectCategory(category);
	}

	get category() {
		return this.filter.selectedCategories;
	}

	get isApplied() {
		return this.filter.isApplied;
	}

	get filter() {
		return this.data.getFilter(filterId);
	}

	_gradeBetweenText(numberOfUsers, range) {
		return this.localize('components.insights-current-final-grade-card.gradeBetween', { numberOfUsers, range });
	}

	_gradeBetweenTextSingleUser(range) {
		return this.localize('components.insights-current-final-grade-card.gradeBetweenSingleUser', { range });

	}

	render() {
		// NB: relying on mobx rather than lit-element properties to handle update detection: it will trigger a redraw for
		// any change to a relevant observed property of the Data object
		const options = this.chartOptions;
		if (!this.skeleton && !options.series[0].data.length) {
			return html`<div class="d2l-insights-final-grade-container">
				<div class="d2l-insights-current-final-grade-title">${this._cardTitle}</div>
				<div class="d2l-insights-summary-card-body">
					<span class="d2l-insights-empty-chart-message">
						${this.localize('components.insights-current-final-grade-card.emptyMessage')}
					</span>
				</div>
			</div>`;
		} else {
			return html`<div class="d2l-insights-final-grade-container">
				<div class="d2l-insights-current-final-grade-title d2l-skeletize d2l-skeletize-45 d2l-body-standard">${this._cardTitle}</div>
				<d2l-labs-chart class="d2l-insights-summary-card-body" .options="${options}" ?skeleton="${this.skeleton}" ></d2l-labs-chart>
			</div>`;
		}
	}

	get chartOptions() {
		const that = this;

		return {
			chart: {
				height: 230,
				type: 'column',
			},
			tooltip: {
				formatter: function() {
					const yCeil = Math.ceil(this.y);
					const xCeil = Math.ceil(this.x);
					if (yCeil === 1) {
						return `${that._gradeBetweenTextSingleUser(`${xCeil}-${xCeil + 10}`)}`;
					}
					return `${that._gradeBetweenText(`${yCeil}`, `${xCeil}-${xCeil + 10}`)}`;
				},
				backgroundColor: 'var(--d2l-color-ferrite)',
				borderColor: 'var(--d2l-color-ferrite)',
				borderRadius: 12,
				style: {
					color: 'white',
				}
			},
			title: {
				text: this._cardTitle, // override default title
				style: {
					display: 'none'
				}
			},
			xAxis: {
				title: {
					text: this._xAxisLabel,
					x: -24, // needed due to compensate for width override below
					style: {
						color: 'var(--d2l-color-ferrite)',
						fontSize: '9px',
						fontWeight: 'bold',
						fontFamily: 'Lato'
					}
				},
				min: 0,
				allowDecimals: false,
				alignTicks: false,
				tickWidth: 0, // remove tick marks
				categories: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
				floor: 0,
				ceiling: 100,
				endOnTick: true,
				labels: {
					align: 'center',
					reserveSpace: true,
					x: -30,
				},
			},
			yAxis: {
				tickAmount: 4,
				title: {
					text: this._yAxisLabel,
					style: {
						color: 'var(--d2l-color-ferrite)',
						fontSize: '10px',
						fontWeight: 'bold',
						fontFamily: 'Lato'
					}
				},
				allowDecimals: false
			},
			credits: {
				enabled: false,
			},
			legend: {
				enabled: false,
			},
			plotOptions: {
				series: {
					minPointLength: 2, // visualize 0 points
					pointStart: 0,
					pointWidth: 37,
					pointPadding: 0.60,
					accessibility: {
						description: this._chartDescriptionTextLabel,
						pointDescriptionFormatter: function(point) {
							const ix = (point.index + 1) * 10,
								val = point.y;
							return `${ix - 10} to ${ix}, ${val}.`;
						}
					},
					colorByPoint: true,
					colors: this._colours,
					point: {
						events: {
							click: function() {
								// noinspection JSPotentiallyInvalidUsageOfClassThis
								that.addToCategory(Math.ceil(this.category));
							}
						}
					}
				}
			},
			accessibility: {
				screenReaderSection: {
					beforeChartFormat: BEFORE_CHART_FORMAT
				}
			},
			series: [{
				data: this._preparedHistogramData,
				name: 'data',
			}],
		};
	}
}
decorate(CurrentFinalGradeCard, {
	filter: computed,
	_preparedHistogramData: computed
});

customElements.define('d2l-insights-current-final-grade-card', CurrentFinalGradeCard);
