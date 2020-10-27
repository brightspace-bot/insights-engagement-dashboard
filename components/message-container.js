import { computed, decorate } from 'mobx';
import { css, html } from 'lit-element/lit-element.js';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';

class MessageContainer extends Localizer(MobxLitElement) {

	static get properties() {
		return {
			data: { type: Object, attribute: false }
		};
	}

	constructor() {
		super();
		this.data = [];
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

			.d2l-insights-message-container-body {
				background-color: var(--d2l-color-regolith);
				border: 1px solid var(--d2l-color-gypsum);
				border-radius: 8px;
				color: var(--d2l-color-ferrite);
				display: flex;
				height: 130px;
				width: 200%;
			}

			.d2l-insights-message-container-value {
				padding-left: 40px;
				padding-top: 50px;
				word-wrap: break-word;
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

	render() {
		// conditinally render message text and body
		if (this._isRecordsTruncated) {
			return html`
				<div class="d2l-insights-message-container-body">
					<span class="d2l-insights-message-container-value"> ${this._messageContainerTextTooManyResults} </span>
				</div>
			`;
		}
	}
}

decorate(MessageContainer, {
	_isRecordsTruncated: computed
});

customElements.define('d2l-insights-message-container', MessageContainer);
