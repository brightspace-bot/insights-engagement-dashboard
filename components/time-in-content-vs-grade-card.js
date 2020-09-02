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
				height: 270px;
				margin-right: 10px;
				margin-top: 10px;
				padding: 10px;
				width: 590px;
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

	get _currentFinalGradeText() {
		return this.localize('components.insights-time-in-content-vs-grade-card.currentFinalGrade');
	}

	get _timeInContentText() {
		return this.localize('components.insights-time-in-content-vs-grade-card.timeInContent');
	}

	get _preparedPlotData() {
		return this.data.currentFinalGradesVsTimeInContent;
	}

	render() {
		// NB: relying on mobx rather than lit-element properties to handle update detection: it will trigger a redraw for
		// any change to a relevant observed property of the Data object
		return html`<div class="d2l-insights-time-in-content-vs-grade-title">${this._cardTitle}</div>
		<d2l-labs-chart class="d2l-insights-summary-card-body" .options="${this.chartOptions}"></d2l-labs-chart>`;
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
				gridLineColor: 'var(--d2l-color-mica)',
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
				gridLineColor: 'var(--d2l-color-mica)',
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
				},
				accessibility: {
					pointDescriptionFormatter: function(point) {
						return `Grade ${point.y}% for time in content ${point.x} mins.`;
					}
				}
			}]
		};
	}
}

customElements.define('d2l-insights-time-in-content-vs-grade-card', TimeInContentVsGradeCard);
