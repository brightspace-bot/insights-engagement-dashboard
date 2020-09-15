import 'highcharts';
import 'highcharts/modules/histogram-bellcurve';
import 'highcharts/modules/accessibility';
import '@brightspace-ui/core/components/loading-spinner/loading-spinner.js';

import { css, html, LitElement } from 'lit-element';
/**
 * based on highcharts-webcomponent (npm) - main modifications: convert to plain .js, fix import, fix typing,
 * remove flag for suppressing updates, prevent unneeded update on first render
 * @element highcharts-chart
 */
class Chart extends LitElement {
	static get properties() {
		return {
			options: { type: Object, attribute: false },
			constructorType: { type: String },
			highcharts: { type: Object, attribute: false },
			immutable: { type: Boolean },
			updateArgs: { type: Array, attribute: false },
			isLoading: { type: Boolean, attribute: 'loading' }
		};
	}

	constructor() {
		super();
		/**
		 * String for constructor method. Official constructors:
		 *  - 'chart' for Highcharts charts
		 *  - 'stockChart' for Highstock charts
		 *  - 'mapChart' for Highmaps charts
		 *  - 'ganttChart' for Gantt charts
		 */
		this.constructorType = 'chart';
		/**
		 * Used to pass the Highcharts instance after modules are initialized.
		 * If not set the component will try to get the Highcharts from window.
		 */
		// Highcharts is an implicit global: importing it properly doesn't work with es-dev-server
		// eslint-disable-next-line no-undef
		this.highcharts = Highcharts;
		/**
		 * Reinitialises the chart on prop update (as oppose to chart.update())
		 * useful in some cases but slower than a regular update.
		 */
		this.immutable = false;
		/**
		 * Array of update()'s function optional arguments.
		 * Parameters should be defined in the same order like in
		 * native Highcharts function: [redraw, oneToOne, animation].
		 * (Here)[https://api.highcharts.com/class-reference/Highcharts.Chart#update] is a more specific description of the parameters.
		 */
		this.updateArgs = [
			true,
			true,
			true
		];

		this.isLoading = true;
	}

	static get styles() {
		return css`
			:host {
				display: inline-block;
				position: relative;
			}
			:host([hidden]) {
				display: none;
			}
		`;
	}

	render() {
		return html`
			<d2l-insights-overlay spinner-size="200" ?loading="${this.isLoading}"></d2l-insights-overlay>
			<div id="chart-container"></div>
      	`;
	}

	updated() {
		if (!this.immutable && this.chart) {
			this.chart.update(this.options, ...(this.updateArgs || [true, true]));
		}
		else {
			this.createChart();
		}
	}

	createChart() {
		const H = this.highcharts;
		const constructorType = this.constructorType;
		if (!H) {
			console.warn('The "highcharts" property was not passed.');
		}
		else if (!H[constructorType]) {
			console.warn('The "constructorType" property is incorrect or some ' +
				'required module is not imported.');
		}
		else if (!this.options) {
			console.warn('The "options" property was not passed.');
		}
		else {
			// Create a chart
			this.chart = H[constructorType](this.chartContainer, this.options, this.chartCreated.bind(this));
		}
	}

	chartCreated(chart) {
		const e = new CustomEvent('load', {
			detail: chart
		});
		this.dispatchEvent(e);
	}

	disconnectedCallback() {
		if (this.chart) {
			this.chart.destroy();
			this.chart = null;
		}
	}

	get chartContainer() {
		return this.shadowRoot.querySelector('#chart-container');
	}
}
customElements.define('d2l-labs-chart', Chart);
