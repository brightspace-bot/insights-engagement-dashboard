import '@brightspace-ui/core/components/offscreen/offscreen.js';
import './card-overlay';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { bodyStandardStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { ifDefined } from 'lit-html/directives/if-defined';
import { Localizer } from '../locales/localizer';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';

/**
 * @property {string} title
 * @property {string} value
 * @property {string} message
 * @fires d2l-labs-summary-card-value-click
 */
class SummaryCard extends SkeletonMixin(Localizer(LitElement)) {
	static get properties() {
		return {
			title: { type: String, attribute: 'card-title' },
			value: { type: String, attribute: 'card-value' },
			message: { type: String, attribute: 'card-message' },
			isValueClickable: { type: Boolean, attribute: 'value-clickable' },
			isLive: { type: Boolean, attribute: 'live' }
		};
	}

	static get styles() {
		return [super.styles, bodyStandardStyles, css`
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
				margin-top: 10px;
				padding: 15px 4px;
				position: relative;
				width: 280px;
			}

			.d2l-insights-summary-card-body {
				align-items: center;
				display: flex;
				height: 100%;
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

			.d2l-insights-summary-card-button {
				background: inherit;
				border: none;
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
		`];
	}

	_valueClickHandler() {
		/**
		 * @event d2l-labs-summary-card-value-click
		 */
		this.dispatchEvent(new CustomEvent('d2l-labs-summary-card-value-click'));
	}

	get summaryLabel() {
		return this.localize('components.insights-summary-card.label', { value: this.value, message: this.message });
	}

	get ariaLive() {
		return this.isLive ? 'polite' : undefined;
	}

	render() {
		// NB: relying on mobx rather than lit-element properties to handle update detection: it will trigger a redraw for
		// any change to a relevant observed property of the Data object
		return html`<div class="d2l-insights-summary-card">
			<div class="d2l-insights-summary-card-title d2l-body-standard">${this.title}</div>
			<div class="d2l-insights-summary-card-body" aria-hidden="${this.skeleton}">
					${this.isValueClickable ? html`<button
 						class="d2l-insights-summary-card-button d2l-insights-summary-card-field"
 						@click=${this._valueClickHandler}
 					>
 						<span aria-hidden="true">${this.value}</span>
 						<d2l-offscreen aria-live="${ifDefined(this.ariaLive)}">${this.summaryLabel}</d2l-offscreen>
 					</button>` : html`<span
 						class="d2l-insights-summary-card-value d2l-insights-summary-card-field"
 						aria-label="${this.summaryLabel}"
 						aria-live="${ifDefined(this.ariaLive)}"
 					>
 						<span aria-hidden="true">${this.value}</span>
 						<d2l-offscreen>${this.summaryLabel}</d2l-offscreen>
 					</span>`}
				<span
					class="d2l-insights-summary-card-message d2l-insights-summary-card-field"
					aria-hidden="true"
				>${this.message}</span>
			</div>
			<d2l-insights-card-overlay ?skeleton="${this.skeleton}"></d2l-insights-card-overlay>
		</div>`;
	}
}
customElements.define('d2l-labs-summary-card', SummaryCard);
