import { css, html } from 'lit-element/lit-element.js';
import { MobxLitElement } from '@adobe/lit-mobx';

class SummaryCard extends MobxLitElement {

	static get properties() {
		return {
			data: { type: Object, attribute: false },
			cardTitle: {type: String, attribute: 'card-title'},
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
			
			.summary-card {
				width: 280px;
				height: 120px;
				border-width: 1.5px;
				border-color: var(--d2l-color-mica);
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

			.summary-card-body {
				display: flex;
				height: 100%;
				align-items: center;
				margin-top: -15px;
			}
			
			.summary-card-title {
				font-size: smaller;
				font-weight: bold;
				color: var(--d2l-color-ferrite);
				text-indent: 3%;
			}
			
			.summary-card-field {
				display: inline-block;
				margin: 10px;
				vertical-align: middle;
			}
			
			.summary-card-value {
				font-size: 22px;
				color: var(--d2l-color-ferrite); /* should conditionally render this when adding more cards */
				margin: 10px;
				font-weight: bold;
				margin-inline-start: 30px;
			}
			
			.summary-card-message {
				max-width: 180px;
				font-size: 14px;
				line-height: 1rem;
				color: var(--d2l-color-ferrite);
				display: flex-wrap;
				margin-inline-start: 2%;
			}
		`;
	}

	render() {
		// NB: relying on mobx rather than lit-element properties to handle update detection: it will trigger a redraw for
		// any change to a relevant observed property of the Data object
		return html`<div class="summary-card" ?applied="${this.data.isApplied}" ?loading="${this.data.isLoading}">
			<div class="summary-card-title">${this.cardTitle}</div>
			<div class="summary-card-body">
				${(this.data.x !== undefined) ? html`<span class="summary-card-delta summary-card-field">${this.data.x}</span>` : ''}
				<span class="summary-card-value summary-card-field">11</span>
				<span class="summary-card-message summary-card-field">${html`${this.cardMessage}`}</span>
			</div>
		</div>`;
	}

	firstUpdated() {
		this.addEventListener('click', () => this.data.isApplied = !this.data.isApplied);
	}

}
customElements.define('d2l-labs-summary-card', SummaryCard);
