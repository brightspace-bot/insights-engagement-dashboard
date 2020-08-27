import 'highcharts';
import './chart/chart';
import 'highcharts/modules/histogram-bellcurve';
import { css, html } from 'lit-element/lit-element.js';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';

class CurrentFinalGradeCard extends Localizer(MobxLitElement) {

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

			.d2l-insights-final-grade-container {
				border-color: var(--d2l-color-mica);
				border-radius: 15px;
				border-style: solid;
				border-width: 1.5px;
				display: inline-block;
				height: 250px;
				margin-right: 10px;
				margin-top: 10px;
				padding: 10px;
				width: 400px;
			}

			.d2l-insights-current-final-grade-title {
				color: var(--d2l-color-ferrite);
				font-size: smaller;
				font-weight: bold;
				text-indent: 3%;
			}
		`;
	}

	get _cardTitle() {
		return this.localize('components.insights-current-final-grade-card.currentFinalGrade');
	}

	get _numberOfStudentsText() {
		return this.localize('components.insights-current-final-grade-card.numberOfStudents');
	}

	render() {
		console.log(this.data.currentFinalGrades);
		// NB: relying on mobx rather than lit-element properties to handle update detection: it will trigger a redraw for
		// any change to a relevant observed property of the Data object
		return html`<div class="d2l-insights-final-grade-container">
		<div class="d2l-insights-current-final-grade-title">${this._cardTitle}</div>
		<d2l-labs-chart class="d2l-insights-summary-card-body" .options="${this.chartOptions}"></d2l-labs-chart>
		</div>`;
	}

	get chartOptions() {
		return {
			chart: {
				height: 230
			},
			title: {
				text: '' //override default title
			},
			xAxis: {
				title: { text: '' }, //override default title
				allowDecimals: false,
				alignTicks: false,
				tickPositions: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
				floor: 0,
				ceiling: 100,
				endOnTick: true
			},
			yAxis: {
				tickAmount: 4,
				tickColor: 'var(--d2l-color-ferrite)',
				title: { text: this._numberOfStudentsText },
				allowDecimals: false,
			},
			credits: {
				enabled: false,
			},
			legend: {
				enabled: false,
			},
			series: [{
				type: 'histogram',
				color: 'var(--d2l-color-amethyst)',
				binWidth: 10,
				pointPadding: 0.1,
				animation: false,
				lineWidth: 1,
				baseSeries: 1,
				shadow: false,
				states: {
					hover: {
						lineWidth: 1
					}
				},
			},
			{
				data: this.data.currentFinalGrades,
				visible: false
			}],
		};
	}
}

customElements.define('d2l-insights-current-final-grade-card', CurrentFinalGradeCard);
