import { computed, decorate } from 'mobx';
import { css, html } from 'lit-element/lit-element.js';
import { BEFORE_CHART_FORMAT } from './chart/chart';
import { bodyStandardStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { CategoryFilter } from '../model/categoryFilter';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';
import { RECORD } from '../consts';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';

const filterId = 'd2l-insights-course-last-access-card';

function lastAccessDateBucket(record) {
	const courseLastAccessDateRange = record[RECORD.COURSE_LAST_ACCESS] === null
		? -1
		: Date.now() - record[RECORD.COURSE_LAST_ACCESS];
	const fourteenDayMillis = 1209600000;
	const sevenDayMillis = 604800000;
	const fiveDayMillis = 432000000;
	const oneDayMillis = 86400000;
	if (courseLastAccessDateRange < 0) {
		return 0;
	}
	if (courseLastAccessDateRange >= fourteenDayMillis) {
		return 1;
	}
	if (courseLastAccessDateRange <= oneDayMillis) {
		return 5;
	}
	if (courseLastAccessDateRange <= fiveDayMillis) {
		return 4;
	}
	if (courseLastAccessDateRange <= sevenDayMillis) {
		return 3;
	}
	if (courseLastAccessDateRange <= fourteenDayMillis) {
		return 2;
	}
}

export class CourseLastAccessFilter extends CategoryFilter {
	constructor() {
		super(
			filterId,
			'components.insights-course-last-access-card.courseAccess',
			record => this.selectedCategories.has(lastAccessDateBucket(record))
		);
	}
}

class CourseLastAccessCard extends SkeletonMixin(Localizer(MobxLitElement)) {

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
			.d2l-insights-course-last-access-container {
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

			.d2l-insights-course-last-access-title {
				color: var(--d2l-color-ferrite);
				font-size: smaller;
				font-weight: bold;
				text-indent: 3%;
			}
		`];
	}

	get _cardTitle() {
		return this.localize('components.insights-course-last-access-card.courseAccess');
	}

	get _chartDescriptionTextLabel() {
		return this.localize('components.insights-course-last-access-card.textLabel');
	}

	get _horizontalLabel() {
		return this.localize('components.insights-course-last-access-card.numberOfUsers');
	}

	get _verticalLabel() {
		return this.localize('components.insights-course-last-access-card.lastDateSinceAccess');
	}

	get _preparedBarChartData() {
		// return an array of size 6, each element mapping to a category on the course last access bar chart
		const dateBucketCounts = [0, 0, 0, 0, 0, 0];
		this.data
			.withoutFilter(filterId)
			.records
			.forEach(record => dateBucketCounts[ lastAccessDateBucket(record) ]++);
		return dateBucketCounts;
	}

	get _accessibilityLessThanOneLabel() {
		return this.localize('components.insights-course-last-access-card.accessibilityLessThanOne');
	}

	get _cardCategoriesText() {
		return [
			this.localize('components.insights-course-last-access-card.never'),
			this.localize('components.insights-course-last-access-card.moreThanFourteenDaysAgo'),
			this.localize('components.insights-course-last-access-card.sevenToFourteenDaysAgo'),
			this.localize('components.insights-course-last-access-card.fiveToSevenDaysAgo'),
			this.localize('components.insights-course-last-access-card.oneToFiveDaysAgo'),
			this.localize('components.insights-course-last-access-card.lessThanOneDayAgo')
		];
	}

	_cardTooltipText(numberOfUsers) {
		return [
			this.localize('components.insights-course-last-access-card.tooltipNeverAccessed', { numberOfUsers }),
			this.localize('components.insights-course-last-access-card.tooltipMoreThanFourteenDays', { numberOfUsers }),
			this.localize('components.insights-course-last-access-card.toolTipSevenToFourteenDays', { numberOfUsers }),
			this.localize('components.insights-course-last-access-card.toolTipFiveToSevenDays', { numberOfUsers }),
			this.localize('components.insights-course-last-access-card.toolTipOneToFiveDays', { numberOfUsers }),
			this.localize('components.insights-course-last-access-card.toolTipLessThanOneDay', { numberOfUsers })
		];
	}

	get _cardTooltipTextSingleUser() {
		return [
			this.localize('components.insights-course-last-access-card.tooltipNeverAccessedSingleUser'),
			this.localize('components.insights-course-last-access-card.tooltipMoreThanFourteenDaysSingleUser'),
			this.localize('components.insights-course-last-access-card.toolTipSevenToFourteenDaysSingleUser'),
			this.localize('components.insights-course-last-access-card.toolTipFiveToSevenDaysSingleUser'),
			this.localize('components.insights-course-last-access-card.toolTipOneToFiveDaysSingleUser'),
			this.localize('components.insights-course-last-access-card.toolTipLessThanOneDaySingleUser')
		];
	}

	get isApplied() {
		return this.filter.isApplied;
	}

	get filter() {
		return this.data.getFilter(filterId);
	}

	addToCategory(category) {
		this.filter.selectCategory(category);
	}

	get category() {
		return this.filter.selectedCategories;
	}

	_colorNonSelectedPoints(seriesData, color) {
		seriesData.forEach(point => {
			if (!this.category.has(point.index)) this._pointUpdateColor(point, color);
		});
	}

	_colorSelectedPoints(seriesData, color) {
		seriesData.forEach(point => {
			if (this.category.has(point.index)) this._pointUpdateColor(point, color);
		});
	}

	_colorAllPoints(seriesData, color) {
		seriesData.forEach(point => this._pointUpdateColor(point, color));
	}

	_pointUpdateColor(point, colorForPoint) {
		point.update({ color: colorForPoint }, false);
	}

	render() {
		// NB: relying on mobx rather than lit-element properties to handle update detection: it will trigger a redraw for
		// any change to a relevant observed property of the Data object
		return html`<div class="d2l-insights-course-last-access-container">
			<div class="d2l-insights-course-last-access-title d2l-skeletize d2l-skeletize-45 d2l-body-standard">${this._cardTitle}</div>
			<d2l-labs-chart class="d2l-insights-summary-card-body" .options="${this.chartOptions}" ?skeleton="${this.skeleton}"></d2l-labs-chart>
		</div>`;
	}

	get chartOptions() {
		const that = this;
		return {
			chart: {
				type: 'bar',
				height: '250px',
				events: {
					render: function() {
						//after redrawing the chart as a result of updating (for example, when the user disable any of the filters),
						// we need to keep the color of the selected/nonselected bars
						if (that.isApplied) {
							that._colorNonSelectedPoints(this.series[0].data, 'var(--d2l-color-mica)');
							that._colorSelectedPoints(this.series[0].data, 'var(--d2l-color-celestine)');
						} else {
							that._colorAllPoints(this.series[0].data, 'var(--d2l-color-celestine)');
						}
						// noinspection JSPotentiallyInvalidUsageOfClassThis
						this.render(false);
					}
				}
			},
			tooltip: {
				formatter: function() {
					if (this.point.y === 1) {
						return `${that._cardTooltipTextSingleUser[this.point.x]}`;
					}
					return `${that._cardTooltipText(this.point.y)[this.point.x]}`;
				},
				backgroundColor: 'var(--d2l-color-ferrite)',
				borderColor: 'var(--d2l-color-ferrite)',
				borderRadius: 12,
				style: {
					color: 'white',
				}
			},
			title: {
				text: this._cardTitle,
				style: {
					display: 'none'
				}
			},
			xAxis: { // axis flipped for this chart
				title: {
					text: this._verticalLabel,
					style: {
						color: 'var(--d2l-color-ferrite)',
						fontSize: '10px',
						fontWeight: 'bold',
						fontFamily: 'Lato'
					},
					margin: 25
				},
				labels: {
					align: 'right',
					reserveSpace: true,
					style: {
						fontSize: '12px',
						fontFamily: 'Lato'
					}
				},
				width: '108%',
				categories: this._cardCategoriesText
			},
			yAxis: {
				tickAmount: 5,
				title: {
					text: this._horizontalLabel,
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
					pointWidth: 16,
					pointPadding: 0.60,
					accessibility: {
						description: this._chartDescriptionTextLabel,
						pointDescriptionFormatter: function(point) {
							const val = point.y;
							if (point.x === 5) {
								return `${that._accessibilityLessThanOneLabel}, ${that._horizontalLabel}, ${val}.`;
							}
							return `${that._cardCategoriesText[point.x]}, ${that._horizontalLabel}, ${val}.`;
						}
					},
					allowPointSelect: true,
					color: 'var(--d2l-color-celestine)',
					states: {
						select: {
							color: 'var(--d2l-color-celestine)'
						}
					},
					point: {
						events: {
							select: function() {
								that.addToCategory(this.index);
								that._colorSelectedPoints(this.series.data, 'var(--d2l-color-celestine)');
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
				// Highcharts modifies this array, which MobX has cached, so make a copy to be safe
				data: [...this._preparedBarChartData]
			}]
		};
	}
}
decorate(CourseLastAccessCard, {
	filter: computed,
	_preparedBarChartData: computed
});
customElements.define('d2l-insights-course-last-access-card', CourseLastAccessCard);
