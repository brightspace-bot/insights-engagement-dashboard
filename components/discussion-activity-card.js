import './overlay';
import 'highcharts';
import { css, html } from 'lit-element/lit-element.js';
import { BEFORE_CHART_FORMAT } from './chart/chart';
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
				margin-bottom: 25px;
				position: relative;
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

	get _discussionActivityStats() {
		return this.data.discussionActivityStats;
	}

	get _chartDescriptionTextLabel() {
		return this.localize('components.insights-discussion-activity-card.textLabel');
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
					showInLegend: true,
					point: {
						events: {
							legendItemClick: function() {
								return false;
							}
						}
					}
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
					y: that._discussionActivityStats[0]
				}, {
					name: that._legendLabels[1],
					y: that._discussionActivityStats[1]
				}, {
					name: that._legendLabels[2],
					y: that._discussionActivityStats[2]
				}],
				accessibility: {
					description: that._chartDescriptionTextLabel,
					pointDescriptionFormatter: function(point) {
						const ix = that._legendLabels[point.index];
						return `${ix}, ${point.y}.`;
					}
				},
			},
			accessibility: {
				screenReaderSection: {
					beforeChartFormat: BEFORE_CHART_FORMAT
				}
			},
			credits: {
				enabled: false,
			},
		};
	}
}

customElements.define('d2l-insights-discussion-activity-card', DiscussionActivity);
