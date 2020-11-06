import '@brightspace-ui/core/components/loading-spinner/loading-spinner.js';

import { css, html, LitElement } from 'lit-element/lit-element.js';
import { bodyStandardStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';

/**
 * Requires that parent element has non-static position property. For instance, position: relative;
 *
 * @property {Boolean} loading
 */
class CardOverlay extends SkeletonMixin(LitElement) {

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

			.d2l-insights-card-overlay {
				background-color: white;
				border-radius: 15px;
				display: flex;
				flex-direction: column;
				height: calc(100% - 20px);
				justify-content: center;
				padding-left: 7px;
				padding-top: 20px;
				width: calc(100% - 15px);
			}

			.d2l-insights-card-overlay-title {
				margin-left: 10px;
				margin-top: 10px;
				width: 100%;
			}

			.d2l-insights-card-overlay-body {
				align-items: center;
				display: flex;
				height: 100%;
				margin-bottom: 25px;
			}

			.d2l-insights-card-overlay-body > div {
				flex-shrink: 0;
				height: 70px;
				margin: 0 10px;
				width: 70px;
			}

			.d2l-insights-card-overlay-message {
				display: inline-block;
				font-size: 14px;
				line-height: 1rem;
				margin: 10px;
				margin-left: 5px;
				vertical-align: middle;
			}
		`];
	}

	render() {
		if (!this.skeleton) {
			return html``;
		}

		return html`
			<div class="d2l-insights-card-overlay" aria-hidden="true">
				<div class="d2l-insights-card-overlay-title d2l-skeletize d2l-skeletize-45 d2l-body-standard">A title. Do not localize.</div>
				<div class="d2l-insights-card-overlay-body">
					<div class="d2l-skeletize"></div>
					<span class="d2l-insights-card-overlay-message d2l-body-standard d2l-skeletize-paragraph-3">A text that triggers CSS styling. Do not localize.</span>
				</div>
			</div>`;
	}

}
customElements.define('d2l-insights-card-overlay', CardOverlay);
