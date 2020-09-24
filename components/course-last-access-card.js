import { css, html } from 'lit-element/lit-element.js';
import { BEFORE_CHART_FORMAT } from './chart/chart';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';

class CourseLastAccessCard extends Localizer(MobxLitElement) {

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
		return css`
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
		`;
	}

	get _cardTitle() {
		return this.localize('components.insights-course-last-access-card.courseAccess');
	}

	get _numberOfUsersText() {
		return this.localize('components.insights-course-last-access-card.numberOfUsers');
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
		return this.data.courseLastAccessDates;
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

	render() {
		// NB: relying on mobx rather than lit-element properties to handle update detection: it will trigger a redraw for
		// any change to a relevant observed property of the Data object
		return html`<div class="d2l-insights-course-last-access-container">
		<div class="d2l-insights-course-last-access-title">${this._cardTitle}</div>
		<d2l-labs-chart class="d2l-insights-summary-card-body" .options="${this.chartOptions}" ?loading="${this.data.isLoading}"></d2l-labs-chart>
		</div>`;
	}

	get chartOptions() {
		const that = this;
		return {
			chart: {
				type: 'bar',
				height: '250px',
			},
			animation: false,
			tooltip: { enabled: false },
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
					animation: false,
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
					}
				},
			},
			accessibility: {
				screenReaderSection: {
					beforeChartFormat: BEFORE_CHART_FORMAT
				}
			},
			series: [{
				data: this._preparedBarChartData,
				color: 'var(--d2l-color-celestine)',
			}]
		};
	}
}

customElements.define('d2l-insights-course-last-access-card', CourseLastAccessCard);
