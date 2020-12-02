import '@brightspace-ui/core/components/button/button';
import { computed, decorate } from 'mobx';
import { css, html } from 'lit-element/lit-element.js';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';

class MessageContainer extends Localizer(MobxLitElement) {

	static get properties() {
		return {
			data: { type: Object, attribute: false },
			isNoDataReturned: { type: Boolean, attribute: false }
		};
	}

	constructor() {
		super();
		this.data = {};
	}

	static get styles() {
		return css`
			:host {
				display: inline-block;
				padding-top: 20px;
			}

			:host([hidden]) {
				display: none;
			}

			.d2l-insights-message-container-body-noResultsAvailable {
				background-color: var(--d2l-color-regolith);
				border: 1px solid var(--d2l-color-gypsum);
				border-radius: 8px;
				color: var(--d2l-color-ferrite);
				display: flex;
				flex-direction: column;
				margin-bottom: 20px;
				padding: 40px;
				width: 73vw;
			}

			.d2l-insights-message-container-body-tooManyResults {
				background-color: var(--d2l-color-regolith);
				border: 1px solid var(--d2l-color-gypsum);
				border-radius: 8px;
				color: var(--d2l-color-ferrite);
				display: flex;
				height: 130px;
				width: 73vw;
			}

			.d2l-insights-message-container-value {
				word-wrap: break-word;
			}

			.d2l-insights-message-container-body-noResultsAvailable > d2l-button {
				margin-top: 20px;
				width: 200px;
			}
		`;
	}

	// @computed
	get _isRecordsTruncated() {
		return this.data._data.serverData.isRecordsTruncated;
	}

	get _messageContainerTextTooManyResults() {
		return this.localize('components.insights-engagement-dashboard.tooManyResults');
	}

	get _messageContainerTextNoResultsAvailable() {
		return this.localize('components.insights-engagement-dashboard.noResultsAvailable');
	}

	get _undoButtonText() {
		return this.localize('components.insights-engagement-dashboard.undoLastAction');
	}

	_handleUndo() {
		this.dispatchEvent(new Event('d2l-insights-undo-last-filter'));
	}

	render() {
		// conditinally render message text and body
		if (this.isNoDataReturned) { //overwrite too many results case
			return html`
				<div class="d2l-insights-message-container-body-noResultsAvailable">
					<span class="d2l-insights-message-container-value">${this._messageContainerTextNoResultsAvailable}</span>
					<d2l-button primary slot="footer" @click="${this._handleUndo}">${this._undoButtonText}</d2l-button>
				</div>
			`;
		} else if (this._isRecordsTruncated) {
			return html`
				<div class="d2l-insights-message-container-body-tooManyResults">
					<span class="d2l-insights-message-container-value">${this._messageContainerTextTooManyResults}</span>
				</div>
			`;
		}
	}
}

decorate(MessageContainer, {
	_isRecordsTruncated: computed
});

customElements.define('d2l-insights-message-container', MessageContainer);
