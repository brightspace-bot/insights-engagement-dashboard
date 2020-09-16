import '@brightspace-ui/core/components/loading-spinner/loading-spinner.js';

import { css, html, LitElement } from 'lit-element/lit-element.js';

/**
 * Requires that parent element has non-static position property. For instance, position: relative;
 *
 * @property {Number} spinner-size
 * @property {Boolean} loading
 */
class Overlay extends LitElement {
	static get properties() {
		return {
			spinnerSize: { type: Number, attribute: 'spinner-size' },
			isLoading: { type: Boolean, attribute: 'loading' }
		};
	}

	static get styles() {
		return css`
			:host {
				display: block;
				height: 100%;
				left: 0;
				position: absolute;
				top: 0;
				width: 100%;
				z-index: 1;
			}
			:host([hidden]) {
				display: none;
			}

			.d2l-insights-overlay {
				align-items: center;
				background-color: white;
				border-radius: 15px;
				display: flex;
				height: 100%;
				justify-content: center;
				margin: 1 1 1 1;
				width: 100%;
			}
		`;
	}

	render() {
		if (!this.isLoading) {
			return html``;
		}

		return html`
			<div class="d2l-insights-overlay">
				<d2l-loading-spinner size="${this.spinnerSize}"></d2l-loading-spinner>
			</div>`;
	}

}
customElements.define('d2l-insights-overlay', Overlay);
