import './overlay';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';

/**
 * @property {string} title
 * @property {string} value
 * @property {string} message
 * @fires d2l-labs-summary-card-value-click
 */
class SummaryCard extends SkeletonMixin(LitElement) {
	static get properties() {
		return {
			title: { type: String, attribute: 'card-title' },
			value: { type: String, attribute: 'card-value' },
			message: { type: String, attribute: 'card-message' },
			isValueClickable: { type: Boolean, attribute: 'is-value-clickable' },
			isLoading: { type: Boolean, attribute: 'loading' },
			skeleton: { type: Boolean, attribute: true }
		};
	}

	static get styles() {
		return [super.styles, css`
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
				display: flex;
				flex-direction: column;
				height: 121px;
				margin-right: 10px;
				margin-top: 10px;
				padding: 15px;
				width: 280px;
			}

			.d2l-insights-summary-card-body {
				align-items: center;
				display: flex;
				height: 100%;
				position: relative;

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
				color: var(--d2l-color-ferrite);
				font-size: 22px;
				font-weight: bold;
				margin: 10px;
				margin-inline-start: 30px;
			}

			.d2l-insights-summary-card-value[is-value-clickable] {
				color: var(--d2l-color-celestine);
				cursor: pointer;
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

			.d2l-insights-summary-card-title[skeleton] {
				line-height: normal;
			}
		`];
	}

	_valueClickHandler() {
		/**
		 * @event d2l-labs-summary-card-value-click
		 */
		this.dispatchEvent(new CustomEvent('d2l-labs-summary-card-value-click'));
	}

	render() {
		// NB: relying on mobx rather than lit-element properties to handle update detection: it will trigger a redraw for
		// any change to a relevant observed property of the Data object
		return html`<div class="d2l-insights-summary-card">
			<div class="d2l-insights-summary-card-title d2l-skeletize d2l-skeletize-45" ?skeleton="${this.skeleton}">${this.title}</div>
			<div class="d2l-insights-summary-card-body" aria-hidden="${!!this.isLoading}">
			<d2l-insights-overlay spinner-size="100" ?loading="${this.isLoading}"></d2l-insights-overlay>
			${this.isValueClickable ?
			html`<span class="d2l-insights-summary-card-value d2l-insights-summary-card-field" ?is-value-clickable=${this.isValueClickable} @click=${this._valueClickHandler}>${this.value}</span>` :
			html`<span class="d2l-insights-summary-card-value d2l-insights-summary-card-field">${this.value}</span>`}
			<span class="d2l-insights-summary-card-message d2l-insights-summary-card-field">${this.message}</span>
			</div>
		</div>`;
	}
}
customElements.define('d2l-labs-summary-card', SummaryCard);
