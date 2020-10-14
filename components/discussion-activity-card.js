import './overlay';
import 'highcharts';
import { css, html } from 'lit-element/lit-element.js';
import { bodyStandardStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';

class DiscussionActivity extends SkeletonMixin(Localizer(MobxLitElement)) {
	static get properties() {
		return {
			isValueClickable: { type: Boolean, attribute: 'is-value-clickable' }
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

			.d2l-insights-discussion-activity-card {
				border-color: var(--d2l-color-mica);
				border-radius: 15px;
				border-style: solid;
				border-width: 1.5px;
				display: flex;
				flex-direction: column;
				height: 121px;
				margin-right: 10px;
				margin-top: 10px;
				padding: 15px;
				width: 280px;
			}

			.d2l-insights-discussion-activity-card-body {
				align-items: center;
				display: flex;
				height: 100%;
				position: relative;
				margin-bottom: 25px;
			}

			.d2l-insights-discussion-activity-card-title {
				color: var(--d2l-color-ferrite);
				font-size: smaller;
				font-weight: bold;
				text-indent: 3%;
			}
		`];
	}

	get _cardTitle() {
		return this.localize('components.insights-discussion-activity-card.cardTitle');
	}

	get _legendLabels() {
		return [
			this.localize('components.insights-discussion-activity-card.threads'),
			this.localize('components.insights-discussion-activity-card.replies'),
			this.localize('components.insights-discussion-activity-card.reads')
		];
	}

	render() {
		// NB: relying on mobx rather than lit-element properties to handle update detection: it will trigger a redraw for
		// any change to a relevant observed property of the Data object
		return html`<div class="d2l-insights-discussion-activity-card">
			<div class="d2l-insights-discussion-activity-card-title d2l-skeletize d2l-skeletize-45 d2l-body-standard">${this._cardTitle}</div>
			<div class="d2l-insights-discussion-activity-card-body" aria-hidden="${this.skeleton}">
			<d2l-labs-chart class="d2l-insights-discussion-activity-card-body" .options="${this.chartOptions}" ?skeleton="${this.skeleton}"></d2l-labs-chart>
			</div>
		</div>`;
	}

	get chartOptions() {
		const that = this;
		return {
			chart: {
				type: 'pie',
				height: 100,
				width: 245,
			},
			title: {
				text: this._cardTitle, // override default title
				style: {
					display: 'none'
				}
			},
			plotOptions: {
				pie: {
					size: 80,
					colors: ['var(--d2l-color-amethyst-plus-1)', 'var(--d2l-color-zircon-plus-1)', 'var(--d2l-color-zircon)'],
					borderWidth: 0,
					cursor: 'pointer',
					dataLabels: {
						enabled: false
					},
					showInLegend: true
				}
			},
			legend: {
				layout: 'vertical',
				align: 'right',
				verticalAlign: 'middle',
				itemMarginBottom: 15,
				itemStyle: {
					fontSize: '14px',
					fontFamily: 'Lato'
				},
				symbolRadius: 0,
				margin: 20,
				navigation: {
					enabled: false
				}
			},
			series: {
				colorByPoint: true,
				data:[{
					name: that._legendLabels[0],
					y: 61.41,
				}, {
					name: that._legendLabels[1],
					y: 11.84
				}, {
					name: that._legendLabels[2],
					y: 10.85
				}]
			},
			credits: {
				enabled: false,
			},
		};
	}
}

customElements.define('d2l-insights-discussion-activity-card', DiscussionActivity);
