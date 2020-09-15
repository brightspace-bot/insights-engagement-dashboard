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

	get _avgGrade() {
		return this.data.avgGrade;
	}

	get _avgTimeInContent() {
		return this.data.avgTimeInContent;
	}
	_filterByQuadrants(x, y) {
		console.log(`x: ${x}y: ${y}`); //out of scope - returning data for respective plot quadrant clicked by user
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
			colors: ['var(--d2l-color-amethyst-plus-1)'],
			chart: {
				type: 'scatter',
				height: 250,
				events: {
					click: function(event) {
						that._filterByQuadrants(event.xAxis[0].value, event.yAxis[0].value);
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
			series: [{
				data: this._preparedPlotData,
				marker: {
					radius: 5
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
			}]
		};
	}
}

customElements.define('d2l-insights-time-in-content-vs-grade-card', TimeInContentVsGradeCard);
