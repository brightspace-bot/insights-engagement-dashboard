import '@brightspace-ui/core/components/expand-collapse/expand-collapse-content';
import '@brightspace-ui/core/components/button/button-icon';

import { css, html, LitElement } from 'lit-element';
import { Localizer } from '../locales/localizer';

class ExpanderWithControl extends Localizer(LitElement) {

	static get properties() {
		return {
			controlExpandedText: { type: String, attribute: 'control-expanded-text' },
			controlCollapsedText: { type: String, attribute: 'control-collapsed-text' },
			expanded: { type: Boolean, attribute: true, reflect: true }
		};
	}

	static get styles() {
		return css`
			.d2l-insights-expand-collapse-control {
				align-items: center;
				display: flex;
				justify-content: space-between;
				margin: 1em 0 0.5em 0;
			}

			.d2l-insights-expand-collapse-control-text {
				color: var(--d2l-color-celestine);
				display: inline-flex;
				margin: 0;
			}
		`;
	}

	constructor() {
		super();
		this.controlExpandedText = '';
		this.controlCollapsedText = '';
		this.expanded = false;
	}

	render() {
		const controlText = this.expanded ? this.controlExpandedText : this.controlCollapsedText;
		return html`
			<!-- having events be handled on the div makes the whole div clickable, as specified in the spec -->
			<div
				role="button"
				class="d2l-insights-expand-collapse-control"
				@click="${this._toggleExpanded}"
				@keydown="${this._handleKeydown}">

				<p class="d2l-insights-expand-collapse-control-text">${ controlText }</p>
				<d2l-button-icon
					icon="tier1:${ this.expanded ? 'arrow-collapse' : 'arrow-expand' }"
					aria-label="${ controlText }"
					aria-expanded="${this.expanded}">
				</d2l-button-icon>
			</div>

			<d2l-expand-collapse-content
				?expanded="${this.expanded}"
				@d2l-expand-collapse-content-expand="${this._onExpanded}"
				@d2l-expand-collapse-content-collapse="${this._onCollapsed}">
				<slot></slot>
			</d2l-expand-collapse-content>
		`;
	}

	_onExpanded(event) {
		event.detail.expandComplete.then(() => {
			this.dispatchEvent(new Event('d2l-insights-expander-with-control-expanded'));
		});
	}

	_onCollapsed(event) {
		event.detail.collapseComplete.then(() => {
			this.dispatchEvent(new Event('d2l-insights-expander-with-control-collapsed'));
		});
	}

	_handleKeydown(event) {
		if (event.key === 'Enter') {
			this._toggleExpanded();
		}
	}

	_toggleExpanded() {
		this.expanded = !this.expanded;
	}
}
customElements.define('d2l-insights-expander-with-control', ExpanderWithControl);
