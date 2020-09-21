import 'highcharts';
import { css, html } from 'lit-element/lit-element.js';
import { BEFORE_CHART_FORMAT } from './chart/chart';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';

export const QUADRANT = {
	LEFT_BOTTOM: 0,
	LEFT_TOP: 1,
	RIGHT_TOP: 2,
	RIGHT_BOTTOM: 3
};

export const TimeInContentVsGradeCardFilter  = {
	id: 'd2l-insights-time-in-content-vs-grade-card',
	title: 'components.insights-time-in-content-vs-grade-card.timeInContentVsGrade',
	filter: (record) => record //init function
};

class TimeInContentVsGradeCard extends Localizer(MobxLitElement) {

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

			:host([hidden]) {
				display: none;
			}
			.d2l-insights-time-in-content-vs-grade-title {
				color: var(--d2l-color-ferrite);
				font-size: smaller;
				font-weight: bold;
				text-indent: 3%;
			}
		`;
	}

	get _cardTitle() {
		return this.localize('components.insights-time-in-content-vs-grade-card.timeInContentVsGrade');
	}

	get _currentGradeText() {
		return this.localize('components.insights-time-in-content-vs-grade-card.currentGrade');
	}

	get _timeInContentText() {
		return this.localize('components.insights-time-in-content-vs-grade-card.timeInContent');
	}

	get _preparedPlotData() {
		return this.data.tiCVsGrades;
	}

	get _plotDataForLeftBottomQuadrant() {
		return  this._preparedPlotData.filter(i => i[0] < this._avgTimeInContent && i[1] < this._avgGrades);
	}

	get _plotDataForLeftTopQuadrant() {
		return this._preparedPlotData.filter(i => i[0] <= this._avgTimeInContent && i[1] >= this._avgGrades);
	}

	get _plotDataForRightTopQuadrant() {
		return this._preparedPlotData.filter(i => i[0] > this._avgTimeInContent && i[1] > this._avgGrades);
	}

	get _plotDataForRightBottomQuadrant() {
		return this._preparedPlotData.filter(i => i[0] >= this._avgTimeInContent && i[1] <= this._avgGrades);
	}

	get _avgGrades() {
		if (this.data.checkIfNeedChangeTiCVsGradesAvgValues) {
			this.data.setTiCVsGradesAvgValues();
		}
		return this.data.tiCVsGradesAvgValues[1];
	}

	get _avgTimeInContent() {
		if (this.data.checkIfNeedChangeTiCVsGradesAvgValues) {
			this.data.setTiCVsGradesAvgValues();
		}
		return this.data.tiCVsGradesAvgValues[0];
	}

	_setQuadrantNum(quadNum) {
		this.data.setTiCVsGradesCardFilter(quadNum);
	}

	get _QuadrantNum() {
		return this.data.tiCVsGradesQuadNum;
	}

	get isApplied() {
		return this.data.cardFilters['d2l-insights-time-in-content-vs-grade-card'].isApplied;
	}

	_valueClickHandler() {
		this.data.setApplied('d2l-insights-time-in-content-vs-grade-card', true);
	}

	render() {
		// NB: relying on mobx rather than lit-element properties to handle update detection: it will trigger a redraw for
		// any change to a relevant observed property of the Data object
		return html`<div class="d2l-insights-time-in-content-vs-grade-title">${this._cardTitle}</div>
		<d2l-labs-chart class="d2l-insights-summary-card-body" .options="${this.chartOptions}" ?loading="${this.data.isLoading}"></d2l-labs-chart>`;
	}

	get chartOptions() {
		const that = this;

		return {
			chart: {
				type: 'scatter',
				height: 250,
				events: {
					click: function(event) {
						//coloring  all point in blue
						this.series.forEach(series => { series.update({
							marker: { enabled: true, fillColor: 'var(--d2l-color-amethyst-plus-1)' } });
						});

						const x = Math.floor(event.xAxis[0].value);
						const y = Math.floor(event.yAxis[0].value);

						let quadNum;
						if (x < that._avgTimeInContent && y < that._avgGrades) quadNum = QUADRANT.LEFT_BOTTOM;
						else if (x <= that._avgTimeInContent && y >= that._avgGrades) quadNum = QUADRANT.LEFT_TOP;
						else if (x > that._avgTimeInContent && y > that._avgGrades) quadNum = QUADRANT.RIGHT_TOP;
						else quadNum = QUADRANT.RIGHT_BOTTOM;

						//coloring all non selected point in grey after selection
						this.series.forEach(series => {
							if (Number(series.name) !== quadNum) {
								series.update({ marker: { enabled: true, fillColor: 'var(--d2l-color-mica)' } });
							}
						});
						that._valueClickHandler();
						that._setQuadrantNum(quadNum);
					},
					update: function() {
						//coloring all point in blue
						if (!that.isApplied) {
							this.series.forEach(series => { series.update({
								marker: { enabled: true, fillColor: 'var(--d2l-color-amethyst-plus-1)' } });
							});
						}
						if (that.isApplied) {
							//coloring all non selected point in grey
							this.series.forEach(series => {
								if (Number(series.name) !== that._QuadrantNum) {
									series.update({ marker: { enabled: true, fillColor: 'var(--d2l-color-mica)' } });
								}
							});
							//coloring selected quadrant point in blue
							this.series[that._QuadrantNum].update({
								marker: { enabled: true, fillColor: 'var(--d2l-color-amethyst-plus-1)' }
							});
						}
					}
				}
			},
			animation: false,
			tooltip: { enabled: false },
			title: {
				text: this._cardTitle, // override default title
				style: {
					display: 'none'
				}
			},
			legend: {
				enabled: false
			},
			credits: {
				enabled: false,
			},
			xAxis: {
				title: {
					text: this._timeInContentText,
					style: {
						color: 'var(--d2l-color-ferrite)',
						fontSize: '9px',
						fontWeight: 'bold',
						fontFamily: 'Lato'
					}
				},
				min: 0,
				tickInterval: 30,
				startOnTick: true,
				gridLineWidth: 1,
				gridLineColor: 'var(--d2l-color-mica)',
				tickLength: 5,
				labels: {
					style: {
						fontSize: '14px',
						color: 'var(--d2l-color-ferrite)',
						fontFamily: 'Lato'
					}
				},
				plotLines: [{
					color: 'var(--d2l-color-celestine)',
					dashStyle: 'Dash',
					value: this._avgTimeInContent,
					width: 1.5
				}]
			},
			yAxis: {
				title: {
					text: this._currentGradeText,
					style: {
						color: 'var(--d2l-color-ferrite)',
						fontSize: '10px',
						fontWeight: 'bold',
						fontFamily: 'Lato'
					}
				},
				max: 100,
				tickPositions: [0, 25, 50, 75, 100],
				startOnTick: true,
				endOnTick: true,
				gridLineWidth: 1,
				gridLineColor: 'var(--d2l-color-mica)',
				tickLength: 5,
				tickWidth: 1,
				labels: {
					style: {
						fontSize: '14px',
						color: 'var(--d2l-color-ferrite)',
						fontFamily: 'Lato'
					}
				},
				plotLines: [{
					color: 'var(--d2l-color-celestine)',
					dashStyle: 'Dash',
					value: this._avgGrades,
					width: 1.5
				}]
			},
			plotOptions: {
				series: {
					marker: {
						radius: 5,
						fillColor: 'var(--d2l-color-amethyst-plus-1)',
						symbol: 'circle'
					},
					states: {
						hover: {
							enabled: false
						}
					},
					accessibility: {
						pointDescriptionFormatter: function(point) {
							return `${that._currentGradeText}: ${point.y} - ${that._timeInContentText}: ${point.x}`;
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
				name: '0',
				data: this._plotDataForLeftBottomQuadrant
			},
			{
				name: '1',
				data: this._plotDataForLeftTopQuadrant
			},
			{
				name: '2',
				data: this._plotDataForRightTopQuadrant
			},
			{
				name: '3',
				data: this._plotDataForRightBottomQuadrant
			}]
		};
	}
}

customElements.define('d2l-insights-time-in-content-vs-grade-card', TimeInContentVsGradeCard);
