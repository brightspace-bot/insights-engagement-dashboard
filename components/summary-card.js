import { css, html } from 'lit-element/lit-element.js';
import { MobxLitElement } from '@adobe/lit-mobx';

class SummaryCard extends MobxLitElement {

	static get properties() {
		return {
			data: { type: Object, attribute: false },
			cardTitle: { type: String, attribute: 'card-title' },
			cardValue: { type: String, attribute: 'card-value' },
			cardMessage: { type: String, attribute: 'card-message' }
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
				border-color: var(--d2l-color-mica);
				border-radius: 15px;
				border-style: solid;
				border-width: 1.5px;
				display: inline-block;
				height: 120px;
				margin-right: 10px;
				margin-top: 10px;
				padding: 10px;
				width: 280px;
			}

			.d2l-insights-summary-card-body {
				align-items: center;
				display: flex;
				height: 100%;
				margin-top: -15px;
			}

			.d2l-insights-summary-card-title {
				color: var(--d2l-color-ferrite);
				font-size: smaller;
				font-weight: bold;
				text-indent: 3%;
			}

			.d2l-insights-summary-card-field {
				display: inline-block;
				margin: 10px;
				vertical-align: middle;
			}

			.d2l-insights-summary-card-value {
				color: var(--d2l-color-ferrite); /* should conditionally render this when adding more cards */
				font-size: 22px;
				font-weight: bold;
				margin: 10px;
				margin-inline-start: 30px;
			}

			.d2l-insights-summary-card-message {
				color: var(--d2l-color-ferrite);
				display: flex-wrap;
				font-size: 14px;
				line-height: 1rem;
				margin-inline-start: 2%;
				max-width: 180px;
			}
		`;
	}

	render() {
		// NB: relying on mobx rather than lit-element properties to handle update detection: it will trigger a redraw for
		// any change to a relevant observed property of the Data object
		return html`<div class="d2l-insights-summary-card" ?applied="${this.data.isApplied}" ?loading="${this.data.isLoading}">
			<div class="d2l-insights-summary-card-title">${this.cardTitle}</div>
			<div class="d2l-insights-summary-card-body">
				<span class="d2l-insights-summary-card-value d2l-insights-summary-card-field">${this.cardValue}</span>
				<span class="d2l-insights-summary-card-message d2l-insights-summary-card-field">${html`${this.cardMessage}`}</span>
			</div>
		</div>`;
	}

	firstUpdated() {
		this.addEventListener('click', () => this.data.isApplied = !this.data.isApplied);
	}

}
customElements.define('d2l-labs-summary-card', SummaryCard);
