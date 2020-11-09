import '@brightspace-ui/core/components/loading-spinner/loading-spinner.js';

import { css, html, LitElement } from 'lit-element/lit-element.js';
import { bodyStandardStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';

/**
 * Requires that parent element has non-static position property. For instance, position: relative;
 *
 * @property {Number} spinner-size
 */
class Overlay extends SkeletonMixin(LitElement) {
	static get properties() {
		return {
			spinnerSize: { type: Number, attribute: 'spinner-size' }
		};
	}

	static get styles() {
		return [super.styles, bodyStandardStyles, css`
			:host {
				display: block;
				left: 0;
				position: absolute;
				top: 0;
			}
			:host([skeleton]) {
				height: 100%;
				width: 100%;
			}
			:host([hidden]) {
				display: none;
			}

			.d2l-insights-overlay-container {
				align-items: center;
				background-color: var(--d2l-color-white);
				border-radius: 15px;
				display: flex;
				height: 100%;
				justify-content: center;
				margin: 1 1 1 1;
				width: 100%;
			}
		`];
	}

	render() {
		if (!this.skeleton) {
			return html``;
		}

		return html`
			<div class="d2l-insights-overlay-container">
				<d2l-loading-spinner size="${this.spinnerSize}"></d2l-loading-spinner>
			</div>`;
	}

}
customElements.define('d2l-insights-overlay', Overlay);
