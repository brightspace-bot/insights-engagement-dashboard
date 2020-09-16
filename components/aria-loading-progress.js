import { css, html } from 'lit-element/lit-element.js';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';


/**
 * Requires that parent element has non-static position property. For instance, position: relative;
 *
 * @property {Number} spinner-size
 * @property {Boolean} loading
 */
class AriaLoadingProgress extends Localizer(MobxLitElement) {
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

			.d2l-insights-aria-loading-progress {
				left: -100vw;
				position: absolute;
			}
		`;
	}

	render() {
		return html`
			<div class="d2l-insights-aria-loading-progress" aria-live="assertive">
				${this.data.isLoading
					? html`<div role="alert">${this.localize('components.insights-aria-loading-progress.loading-start')}</div>`
					: html`<div role="alert" aria-label="${this.localize('components.insights-aria-loading-progress.loading-finish')}"></div>`}
			</div>`;
	}
}
customElements.define('d2l-insights-aria-loading-progress', AriaLoadingProgress);
