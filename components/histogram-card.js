import 'highcharts';
import './chart/chart';
import { css, html } from 'lit-element/lit-element.js';
import { MobxLitElement } from '@adobe/lit-mobx';

// sparklines, modified from
// https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/sparkline/

/**
 * Create options for sparklines that takes some sensible defaults and merges in the individual chart options.
 */
const sparklineOptions = function(options) {
	const defaultOptions = {
		chart: {
			backgroundColor: null,
			borderWidth: 0,
			type: 'line',
			margin: [2, 0, 2, 0],
			width: 120,
			height: 20,
			style: {
				overflow: 'visible'
			},

			// small optimalization, saves 1-2 ms each sparkline
			skipClone: true
		},
		title: {
			text: ''
		},
		credits: {
			enabled: false
		},
		xAxis: {
			labels: {
				enabled: false
			},
			title: {
				text: null
			},
			startOnTick: false,
			endOnTick: false,
			tickPositions: []
		},
		yAxis: {
			endOnTick: false,
			startOnTick: false,
			labels: {
				enabled: false
			},
			title: {
				text: null
			},
			tickPositions: [0]
		},
		legend: {
			enabled: false
		},
		tooltip: {
			hideDelay: 0,
			outside: true,
			shared: true
		},
		plotOptions: {
			series: {
				animation: false,
				lineWidth: 1,
				shadow: false,
				states: {
					hover: {
						lineWidth: 1
					}
				},
				marker: {
					radius: 1,
					states: {
						hover: {
							radius: 2
						}
					}
				},
				fillOpacity: 0.25
			},
			column: {
				negativeColor: '#910000',
				borderColor: 'silver'
			}
		}
	};

	// Highcharts is an implicit global: importing it properly doesn't work with es-dev-server
	// eslint-disable-next-line no-undef
	return Highcharts.merge(defaultOptions, options);
};

class HistogramCard extends MobxLitElement {

	static get properties() {
		return {
			data: { type: Object, attribute: false }
		};
	}

	static get styles() {
		return css`
			:host {
				display: inline-block;
			}
			:host([hidden]) {
				display: none;
			}
			
			.summary-card {
				width: fit-content;
				border-width: 4px;
				border-color: aliceblue;
				border-style: solid;
				padding: 10px;
				border-radius: 15px;
				display: inline-block;
				margin-right: 10px;
				margin-top: 10px;
			}
			.summary-card[applied] {
				border-color: darkseagreen;
			}
			.summary-card[loading] {
				opacity: 30%;
			}
			
			.summary-card-body {
				display: flex;
				flex-wrap: wrap;
				height: 100%;
				align-items: center;
				margin-top: -15px;
				width: 80px
			}
			
			.summary-card-title {
				font-size: smaller;
			}
			
			.summary-card-field {
				display: inline-block;
				margin: 10px;
				vertical-align: middle;
			}
			
			.summary-card-value {
				font-size: 40px;
				color: lightsteelblue;
			}
			
			.summary-card-message {
				max-width: 120px;
			}
		`;
	}

	render() {
		console.log(`histogram-card render ${this.data.id}`);

		// NB: relying on mobx rather than lit-element properties to handle update detection: it will trigger a redraw for
		// any change to a relevant observed property of the Data object
		return html`<div class="summary-card" ?applied="${this.data.isApplied}" ?loading="${this.data.isLoading}">
			<div class="summary-card-title">${this.data.title}</div>
			<d2l-labs-chart class="summary-card-body" .options="${this.chartOptions}"></d2l-labs-chart>
		</div>`;
	}

	get chartOptions() {
		return sparklineOptions({
			series:
				[
					{
						data: this.data.series,
						type: 'column',
						name: 'histogram',
						zones: [
							{
								value: 2,
								color: 'darkred'
							}, {
								color: 'darkseagreen'
							}
						],
						zoneAxis: 'x'
					}
				],
			chart: {
				width: 80,
				height: 150
			},
			xAxis: {},
			plotOptions: {}
		});
	}
}
customElements.define('d2l-labs-histogram-card', HistogramCard);
