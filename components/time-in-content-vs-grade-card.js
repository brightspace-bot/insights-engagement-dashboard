import 'highcharts';
import './chart/chart';
import { css, html } from 'lit-element/lit-element.js';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';

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
		return this._preparedPlotData.filter(i => i[0] <= this._avgTimeInContent && i[1] <= this._avgGrade);
	}

	get _plotDataForLeftTopQuadrant() {
		return this._preparedPlotData.filter(i => i[0] < this._avgTimeInContent && i[1] > this._avgGrade);
	}

	get _plotDataForRightTopQuadrant() {
		return this._preparedPlotData.filter(i => i[0] >= this._avgTimeInContent && i[1] >= this._avgGrade);
	}

	get _plotDataForRightBottomQuadrant() {
		return this._preparedPlotData.filter(i => i[0] > this._avgTimeInContent && i[1] < this._avgGrade);
	}

	get _avgGrade() {
		return this.data.avgGrade;
	}

	get _avgTimeInContent() {
		return this.data.avgTimeInContent;
	}
	_filterByQuadrants(x, y) {
		console.log(`x: ${x}y: ${y}`);
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
						that._filterByQuadrants(event.xAxis[0].value, event.yAxis[0].value);
						const x = Math.floor(event.xAxis[0].value);
						const y = Math.floor(event.yAxis[0].value);

						let n;
						if (x <= that._avgTimeInContent && y <= that._avgGrade) n = 0;
						else if (x < that._avgTimeInContent && y > that._avgGrade) n = 1;
						else if (x >= that._avgTimeInContent && y >= that._avgGrade) n = 2;
						else n = 3;

						for (let i = 0; i < this.series[n].data.length; i++) {
							this.series[n].data[i].update({
								marker: { enabled: true, fillColor: 'var(--d2l-color-mica)' }
							});
						}
					},
					redraw: function() {
						console.log('redraw');
					},
					update: function() {
						console.log('update');
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
