import { computed, decorate } from 'mobx';
import { html } from 'lit-element';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';
import { USER } from '../consts';

class LastAccessCard extends SkeletonMixin(Localizer(MobxLitElement)) {

	static get properties() {
		return {
			data: { type: Object, attribute: false }
		};
	}

	constructor() {
		super();
		this.data = {};
	}

	get _cardMessage() {
		return this.localize('components.insights-engagement-dashboard.lastSystemAccess');
	}

	get _cardTitle() {
		return this.localize('components.insights-engagement-dashboard.lastSystemAccessHeading');
	}

	get _cardValue() {
		const fourteenDayMillis = 1209600000;

		return this.data.users
			.filter(user => user[USER.LAST_SYS_ACCESS] === null || user[USER.LAST_SYS_ACCESS] === undefined || (Date.now() - user[USER.LAST_SYS_ACCESS] > fourteenDayMillis))
			.length;
	}

	render() {
		return html`
			<d2l-labs-summary-card
				id="d2l-insights-engagement-last-access"
				is-value-clickable
				.data="${this.data}"
				card-title="${this._cardTitle}"
				card-value="${this._cardValue}"
				card-message="${this._cardMessage}"
				@d2l-labs-summary-card-value-click=${this._valueClickHandler}
				?skeleton="${this.skeleton}"
			></d2l-labs-summary-card>
		`;
	}

	_valueClickHandler() {
		console.log('click'); // out of scope
	}
}
customElements.define('d2l-insights-last-access-card', LastAccessCard);

decorate(LastAccessCard, {
	_cardValue: computed,
});
