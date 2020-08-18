import { css, html } from 'lit-element/lit-element.js';
import { MobxLitElement } from '@adobe/lit-mobx';

class SummaryCard extends MobxLitElement {

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

			.d2l-insights-summary-card {
				border-color: aliceblue;
				border-radius: 15px;
				border-style: solid;
				border-width: 4px;
				display: inline-block;
				margin-right: 10px;
				margin-top: 10px;
				padding: 10px;
				width: fit-content;
			}
			.d2l-insights-summary-card[applied] {
				border-color: darkseagreen;
			}
			.d2l-insights-summary-card[loading] {
				opacity: 30%;
			}

			.d2l-insights-summary-card-body {
				align-items: center;
				display: flex;
				flex-wrap: wrap;
				height: 100%;
				margin-top: -15px;
			}

			.d2l-insights-summary-card-title {
				font-size: smaller;
			}

			.d2l-insights-summary-card-field {
				display: inline-block;
				margin: 10px;
				vertical-align: middle;
			}

			.d2l-insights-summary-card-value {
				color: lightsteelblue;
				font-size: 40px;
			}

			.d2l-insights-summary-card-message {
				max-width: 120px;
			}
		`;
	}

	render() {
		console.log(`summary-card render ${this.data.id}`);

		// NB: relying on mobx rather than lit-element properties to handle update detection: it will trigger a redraw for
		// any change to a relevant observed property of the Data object
		return html`<div class="d2l-insights-summary-card" ?applied="${this.data.isApplied}" ?loading="${this.data.isLoading}">
			<div class="d2l-insights-summary-card-title">${this.data.title}</div>
			<div class="d2l-insights-summary-card-body">
				${(this.data.stats.delta !== undefined) ? html`<span class="d2l-insights-summary-card-delta d2l-insights-summary-card-field">${this.data.stats.delta}</span>` : ''}
				<span class="d2l-insights-summary-card-value d2l-insights-summary-card-field">${this.data.stats.value}</span>
				<span class="d2l-insights-summary-card-message d2l-insights-summary-card-field">${html`${this.data.message}`}</span>
			</div>
		</div>`;
	}

	firstUpdated() {
		this.addEventListener('click', () => this.data.isApplied = !this.data.isApplied);
	}
}
customElements.define('d2l-labs-summary-card', SummaryCard);
