import 'highcharts';
import './chart/chart';
import 'highcharts/modules/accessibility';
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
				display: inline-block;
			}
			:host([hidden]) {
				display: none;
			}
			.d2l-insights-time-in-content-vs-grade-container {
				border-color: var(--d2l-color-mica);
				border-radius: 15px;
				border-style: solid;
				border-width: 1.5px;
				display: inline-block;
				height: 270px;
				margin-right: 10px;
				margin-top: 10px;
				padding: 10px;
				width: 590px;
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

	get _currentFinalGradeText() {
		return this.localize('components.insights-time-in-content-vs-grade-card.currentFinalGrade');
	}

	get _timeInContentText() {
		return this.localize('components.insights-time-in-content-vs-grade-card.timeInContent');
	}

	get _preparedPlotData() {
		return  [[30, 30], [60, 75], [90, 50], [120, 80]]; //test data TODO;
	}

	render() {
		console.log(this._preparedPlotData);
		// NB: relying on mobx rather than lit-element properties to handle update detection: it will trigger a redraw for
		// any change to a relevant observed property of the Data object
		return html`<div class="d2l-insights-time-in-content-vs-grade-container">
		<div class="d2l-insights-time-in-content-vs-grade-title">${this._cardTitle}</div>
		<d2l-labs-chart class="d2l-insights-summary-card-body" .options="${this.chartOptions}"></d2l-labs-chart>
		</div>`;
	}

	get chartOptions() {
		return {
			colors: ['var(--d2l-color-amethyst-plus-1)'],
			chart: {
				type: 'scatter',
				height: 250
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
				tickInterval: 30,
				startOnTick: true,
				gridLineWidth: 1,
				tickLength: 5,
				labels: {
					style: {
						fontSize: '14px',
						color: 'var(--d2l-color-ferrite)',
						fontFamily: 'Lato'
					}
				}
			},
			yAxis: {
				title: {
					text: this._currentFinalGradeText,
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
				tickLength: 5,
				tickWidth: 1,
				labels: {
					style: {
						fontSize: '14px',
						color: 'var(--d2l-color-ferrite)',
						fontFamily: 'Lato'
					}
				}
			},
			series: [{
				data: this._preparedPlotData,
				marker: {
					radius: 5
				}
			}]
		};
	}
}

customElements.define('d2l-insights-time-in-content-vs-grade-card', TimeInContentVsGradeCard);
