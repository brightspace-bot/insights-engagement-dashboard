import { css, html, LitElement } from 'lit-element/lit-element.js';

class SummaryCard extends LitElement {
	static get properties() {
		return {
			title: { type: String, attribute: 'card-title' },
			value: { type: String, attribute: 'card-value' },
			message: { type: String, attribute: 'card-message' },
			isValueClickable: { type: Boolean }
		};
	}
	constructor() {
		super();
		this.title = '';
		this.value = '';
		this.message = '';
		this.isValueClickable = false;
	}

	set isValueClickable(value) {
		if (value) {
			this.style.setProperty('--is-value-clickable', 'var(--d2l-color-celestine)');
		} else {
			this.style.setProperty('--is-value-clickable', 'var(--d2l-color-ferrite)');
		}
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
				color: var(--is-value-clickable);
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

	_getUsers() {
		console.log('click'); // out of scope
	}

	render() {
		// NB: relying on mobx rather than lit-element properties to handle update detection: it will trigger a redraw for
		// any change to a relevant observed property of the Data object
		return html`<div class="d2l-insights-summary-card">
			<div class="d2l-insights-summary-card-title">${this.title}</div>
			<div class="d2l-insights-summary-card-body">
			${!this.isValueClickable ?
			html`<span class="d2l-insights-summary-card-value d2l-insights-summary-card-field" @click=${this._getUsers}>${this.value}</span>` :
			html`<span class="d2l-insights-summary-card-value d2l-insights-summary-card-field">${this.value}</span>` }
			<span class="d2l-insights-summary-card-message d2l-insights-summary-card-field">${this.message}</span>
			</div>
		</div>`;
	}

}
customElements.define('d2l-labs-summary-card', SummaryCard);
