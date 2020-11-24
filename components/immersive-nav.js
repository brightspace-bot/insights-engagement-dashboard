import 'd2l-navigation/d2l-navigation-immersive';
import 'd2l-navigation/d2l-navigation-link-back';

import { css, html, LitElement } from 'lit-element/lit-element';
import { Localizer } from '../locales/localizer';

const D2L_NAVIGATION_LINK_BACK = 'D2L-NAVIGATION-LINK-BACK';

// Extends the standard immersive nav to resize the back link on small screens
class InsightsImmersiveNav extends Localizer(LitElement) {
	static get properties() {
		return {
			href: { type: String, attribute: true },
			view: { type: String, attribute: true }
		};
	}

	static get styles() {
		return [css`
			.d2l-insights-immersive-nav-title {
				align-items: center;
				display: flex;
			}

			.d2l-insights-link-back-default {
				display: inline-block;
			}

			.d2l-insights-link-back-responsive {
				display: none;
			}

			@media screen and (max-width: 615px) {
				.d2l-insights-link-back-default {
					display: none;
				}

				.d2l-insights-link-back-responsive {
					display: inline-block;
				}
			}
		`];
	}

	constructor() {
		super();
		this.href = '';
		this.view = 'home';
	}

	get mainText() {
		switch (this.view) {
			case 'home': return this.localize('components.insights-engagement-dashboard.title');
			case 'user': return this.localize('components.insights-engagement-dashboard.title-user-view');
		}
		return this.localize('components.insights-engagement-dashboard.title');
	}

	get backText() {
		switch (this.view) {
			case 'home': return this.localize('components.insights-engagement-dashboard.backToInsightsPortal');
			case 'user': return this.localize('components.insights-engagement-dashboard.backToEngagementDashboard');
		}
		return this.localize('components.insights-engagement-dashboard.backToInsightsPortal');
	}

	render() {
		return html`
			<d2l-navigation-immersive width-type="fullscreen">

				<div slot="left">
					<d2l-navigation-link-back
						text="${this.backText}"
						href="${this.href}"
						class="d2l-insights-link-back-default"
						@click=${this._backLinkClickHandler}>
					</d2l-navigation-link-back>
					<d2l-navigation-link-back
						text="${this.localize('components.insights-engagement-dashboard.backLinkTextShort')}"
						href="${this.href}"
						class="d2l-insights-link-back-responsive"
						@click=${this._backLinkClickHandler}>
					</d2l-navigation-link-back>
				</div>

				<div slot="middle" class="d2l-insights-immersive-nav-title">
					${this.mainText}
				</div>

			</d2l-navigation-immersive>
		`;
	}

	_backLinkClickHandler(e) {
		if (this.view === 'home') {
			return true;
		}

		window.history.back();
		// prevent href navigation
		e.preventDefault();
		return false;
	}
}
customElements.define('d2l-insights-immersive-nav', InsightsImmersiveNav);
