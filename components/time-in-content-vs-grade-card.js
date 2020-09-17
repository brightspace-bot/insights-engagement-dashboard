import 'highcharts';
import './chart/chart';
import { css, html } from 'lit-element/lit-element.js';
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
	filter: (record) => !record
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
		return this.data.currentFinalGradesVsTimeInContent;
	}

	get _plotDataForLeftBottomQuadrant() {
		return this._preparedPlotData.filter(i => i[0] < this._avgTimeInContent && i[1] < this._avgGrade);
	}

	get _plotDataForLeftTopQuadrant() {
		return this._preparedPlotData.filter(i => i[0] <= this._avgTimeInContent && i[1] >= this._avgGrade);
	}

	get _plotDataForRightTopQuadrant() {
		return this._preparedPlotData.filter(i => i[0] > this._avgTimeInContent && i[1] > this._avgGrade);
	}

	get _plotDataForRightBottomQuadrant() {
		return this._preparedPlotData.filter(i => i[0] >= this._avgTimeInContent && i[1] <= this._avgGrade);
	}

	get _avgGrade() {
		return this.data.avgGrade;
	}

	get _avgTimeInContent() {
		return this.data.avgTimeInContent;
	}

	_setSelected() {
		this.data.setTiCVsGradeCardSelection(true);
	}

	_setQuadrantNum(quadNum) {
		this.data.setTiCVsGradeCardFilter(quadNum);
	}

	get isSelected() {
		return this.data._TiCVsGradeSelected;
	}

	_valueClickHandler() {
		this.data.setApplied('d2l-insights-time-in-content-vs-grade-card', true);
	}

	render() {
		// NB: relying on mobx rather than lit-element properties to handle update detection: it will trigger a redraw for
		// any change to a relevant observed property of the Data object
		return html`<div class="d2l-insights-time-in-content-vs-grade-title">${this._cardTitle}</div>
		<d2l-labs-chart class="d2l-insights-summary-card-body" .options="${this.chartOptions}"></d2l-labs-chart>`;
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
						for (let q = 0; q < 4; q++) {
							for (let i = 0; i < this.series[q].data.length; i++) {
								this.series[q].data[i].update({
									marker: { enabled: true, fillColor: 'var(--d2l-color-amethyst-plus-1)' }
								});
							}
						}

						const x = Math.floor(event.xAxis[0].value);
						const y = Math.floor(event.yAxis[0].value);

						let quadNum;
						if (x < that._avgTimeInContent && y < that._avgGrade) quadNum = QUADRANT.LEFT_BOTTOM;
						else if (x <= that._avgTimeInContent && y >= that._avgGrade) quadNum = QUADRANT.LEFT_TOP;
						else if (x > that._avgTimeInContent && y > that._avgGrade) quadNum = QUADRANT.RIGHT_TOP;
						else quadNum = QUADRANT.RIGHT_BOTTOM;

						const quadArray = Object.values(QUADRANT);
						quadArray.splice(quadNum, 1);

						//coloring all non selected point in grey after selection
						for (let q = 0; q < quadArray.length; q++) {
							for (let i = 0; i < this.series[quadArray[q]].data.length; i++) {
								this.series[quadArray[q]].data[i].update({
									marker: { enabled: true, fillColor: 'var(--d2l-color-mica)' }
								});
							}
						}
						that._setSelected();
						that._valueClickHandler();
						that._setQuadrantNum(quadNum);
					},
					update: function() {
						//coloring  all point in blue
						if (!that.isSelected) {
							for (let q = 0; q < 4; q++) {
								for (let i = 0; i < this.series[q].data.length; i++) {
									this.series[q].data[i].update({
										marker: { enabled: true, fillColor: 'var(--d2l-color-amethyst-plus-1)' }
									});
								}
							}
						}
					}
				}
			},
			animation: false,
			tooltip: { enabled: false },
			title: {
				text: ''
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
					value: this._avgGrade,
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
			series: [{
				name: 'LeftBottomQuadrant',
				data: this._plotDataForLeftBottomQuadrant
			},
			{
				name: 'LeftTopQuadrant',
				data: this._plotDataForLeftTopQuadrant
			},
			{
				name: 'RightTopQuadrant',
				data: this._plotDataForRightTopQuadrant
			},
			{
				name: 'RightBottomQuadrant',
				data: this._plotDataForRightBottomQuadrant
			}]
		};
	}
}

customElements.define('d2l-insights-time-in-content-vs-grade-card', TimeInContentVsGradeCard);
