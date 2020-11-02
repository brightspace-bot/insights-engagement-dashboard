import 'highcharts';
import { computed, decorate, observable } from 'mobx';
import { css, html } from 'lit-element/lit-element.js';
import { BEFORE_CHART_FORMAT } from './chart/chart';
import { bodyStandardStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';
import { RECORD } from '../consts';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';

const filterId = 'd2l-insights-time-in-content-vs-grade-card';

const TIC = 0;
const GRADE = 1;

function avgOf(items, field) {
	if (items.length === 0) return 0;
	const total = items.reduce((sum, x) => sum + x[field], 0);
	return Math.floor(total / items.length);
}

export class TimeInContentVsGradeFilter {
	constructor(data) {
		this._data = data;
		this.quadrant = null;
	}

	get avgGrade() {
		return avgOf(this.tiCVsGrades, GRADE);
	}

	get avgTimeInContent() {
		return avgOf(this.tiCVsGrades, TIC);
	}

	get id() { return filterId; }

	get isApplied() {
		return this.quadrant !== null;
	}

	set isApplied(isApplied) {
		if (!isApplied) this.quadrant = null;
	}

	get tiCVsGrades() {
		return this._data.records
			// keep in count students either with a zero grade or without time in content
			.filter(record => record[RECORD.CURRENT_FINAL_GRADE] !== null && record[RECORD.CURRENT_FINAL_GRADE] !== undefined)
			.filter(item => item[RECORD.TIME_IN_CONTENT] || item[RECORD.CURRENT_FINAL_GRADE])
			.map(item => [Math.floor(item[RECORD.TIME_IN_CONTENT] / 60), item[RECORD.CURRENT_FINAL_GRADE]]);
	}

	get title() { return 'components.insights-time-in-content-vs-grade-card.timeInContentVsGrade'; }

	calculateQuadrant(tic, grade) {
		// accept either a record or coordinates
		if (Array.isArray(tic)) {
			const record = tic;
			if (record[RECORD.CURRENT_FINAL_GRADE] === null) return null;
			tic = Math.floor(record[RECORD.TIME_IN_CONTENT] / 60);
			grade = record[RECORD.CURRENT_FINAL_GRADE];
		}

		let quadrant;
		if (tic < this.avgTimeInContent && grade < this.avgGrade) quadrant = 'leftBottom';
		else if (tic <= this.avgTimeInContent && grade >= this.avgGrade) quadrant = 'leftTop';
		else if (tic > this.avgTimeInContent && grade > this.avgGrade) quadrant = 'rightTop';
		else quadrant = 'rightBottom';
		return quadrant;
	}

	getDataForQuadrant(quadrant) {
		return this.tiCVsGrades.filter(r => this.calculateQuadrant(r[TIC], r[GRADE]) === quadrant);
	}

	filter(record) {
		return this.calculateQuadrant(record) === this.quadrant;
	}
}
decorate(TimeInContentVsGradeFilter, {
	_data: observable,
	quadrant: observable,
	isApplied: computed,
	avgGrade: computed,
	avgTimeInContent: computed,
	tiCVsGrades: computed
});

class TimeInContentVsGradeCard extends SkeletonMixin(Localizer(MobxLitElement)) {

	static get properties() {
		return {
			data: { type: Object, attribute: false }
		};
	}

	constructor() {
		super();
		this.data = {};
	}

	static get styles() {
		return [super.styles, bodyStandardStyles, css`
			:host {
				border-color: var(--d2l-color-mica);
				border-radius: 15px;
				border-style: solid;
				border-width: 1.5px;
				display: inline-block;
				height: 275px;
				margin-right: 12px;
				margin-top: 10px;
				padding: 15px 4px;
				width: 581px;
			}

			@media only screen and (max-width: 615px) {
				:host {
					margin-right: 0;
				}
			}

			:host([hidden]) {
				display: none;
			}
			.d2l-insights-time-in-content-vs-grade-title {
				color: var(--d2l-color-ferrite);
				font-size: smaller;
				font-weight: bold;
				text-indent: 3%;
			}
		`];
	}

	get _cardTitle() {
		return this.localize('components.insights-time-in-content-vs-grade-card.timeInContentVsGrade');
	}

	get _currentGradeText() {
		return this.localize('components.insights-time-in-content-vs-grade-card.currentGrade');
	}

	get _timeInContentText() {
		return this.localize('components.insights-time-in-content-vs-grade-card.timeInContent');
	}

	get _plotDataForLeftBottomQuadrant() {
		return this.filter.getDataForQuadrant('leftBottom');
	}

	get _plotDataForLeftTopQuadrant() {
		return this.filter.getDataForQuadrant('leftTop');
	}

	get _plotDataForRightTopQuadrant() {
		return this.filter.getDataForQuadrant('rightTop');
	}

	get _plotDataForRightBottomQuadrant() {
		return this.filter.getDataForQuadrant('rightBottom');
	}

	get _dataMidPoints() {
		const maxTimeInContent = this.filter.tiCVsGrades.reduce((max, arr) => {
			return Math.max(max, arr[0]);
		}, -Infinity);
		return [[this.filter.avgTimeInContent / 2, 25],
			[this.filter.avgTimeInContent / 2, 75],
			[(maxTimeInContent + this.filter.avgTimeInContent) / 2, 25],
			[(maxTimeInContent + this.filter.avgTimeInContent) / 2, 75]];
	}

	_colorAllPointsInAmethyst(series) {
		series.forEach(series => {
			if (series.name !== 'midPoint') {
				series.update({ marker: { enabled: true, fillColor: 'var(--d2l-color-amethyst-plus-1)' } });
			}
		});
	}

	_colorNonSelectedPointsInMica(series) {
		series.forEach(series => {
			if ((series.name !== this.filter.quadrant) && (series.name !== 'midPoint')) {
				series.update({ marker: { enabled: true, fillColor: 'var(--d2l-color-mica)' } });
			}
		});
	}

	_colorSelectedQuadrantPointsInAmethyst(series) {
		series.forEach(series => {
			if ((series.name === this.filter.quadrant) && (series.name !== 'midPoint')) {
				series.update({ marker: { enabled: true, fillColor: 'var(--d2l-color-amethyst-plus-1)' } });
			}
		});
	}

	get filter() {
		return this.data.getFilter(filterId);
	}

	_toolTipTextByQuadrant(quadrant, numberOfUsers) {
		const quadrantTerm = `components.insights-time-in-content-vs-grade-card.${quadrant}`;
		return this.localize(quadrantTerm, { numberOfUsers });
	}

	render() {
		// NB: relying on mobx rather than lit-element properties to handle update detection: it will trigger a redraw for
		// any change to a relevant observed property of the Data object
		return html`
			<div class="d2l-insights-time-in-content-vs-grade-title d2l-skeletize d2l-skeletize-45 d2l-body-standard">${this._cardTitle}</div>
			<d2l-labs-chart class="d2l-insights-summary-card-body" .options="${this.chartOptions}" ?skeleton="${this.skeleton}"></d2l-labs-chart>`;
	}

	get chartOptions() {
		const that = this;

		return {
			chart: {
				type: 'scatter',
				height: 250,
				width: 581,
				events: {
					click: function(event) {
						that._colorAllPointsInAmethyst(this.series);
						that.filter.quadrant = that.filter.calculateQuadrant(Math.floor(event.xAxis[0].value), Math.floor(event.yAxis[0].value));
						that._colorNonSelectedPointsInMica(this.series);
					},
					update: function() {
						if (that.filter.isApplied) {
							that._colorNonSelectedPointsInMica(this.series);
							that._colorSelectedQuadrantPointsInAmethyst(this.series);
						} else {
							that._colorAllPointsInAmethyst(this.series);
						}
					}
				}
			},
			tooltip: {
				formatter: function() {
					if (this.series.name === 'midPoint') {
						const midPoints = that._dataMidPoints;
						const currentMidPoint = [this.x, this.y];
						if (currentMidPoint.toString() === midPoints[0].toString()) {
							return that._toolTipTextByQuadrant(this.series.chart.series[0].name, this.series.chart.series[0].data.length);
						}
						if (currentMidPoint.toString() === midPoints[1].toString()) {
							return that._toolTipTextByQuadrant(this.series.chart.series[1].name, this.series.chart.series[1].data.length);
						}
						if (currentMidPoint.toString() === midPoints[2].toString()) {
							return that._toolTipTextByQuadrant(this.series.chart.series[2].name, this.series.chart.series[2].data.length);
						}
						if (currentMidPoint.toString() === midPoints[3].toString()) {
							return that._toolTipTextByQuadrant(this.series.chart.series[3].name, this.series.chart.series[3].data.length);
						}
					}
					return false;
				},
				backgroundColor: 'var(--d2l-color-ferrite)',
				borderColor: 'var(--d2l-color-ferrite)',
				borderRadius: 12,
				style: {
					color: 'white',
					width: 375
				},
				shared: false
			},
			title: {
				text: this._cardTitle, // override default title
				style: {
					display: 'none'
				}
			},
			legend: {
				enabled: false
			},
			credits: {
				enabled: false,
			},
			xAxis: {
				title: {
					text: this._timeInContentText,
					style: {
						color: 'var(--d2l-color-ferrite)',
						fontSize: '9px',
						fontWeight: 'bold',
						fontFamily: 'Lato'
					}
				},
				min: 0,
				tickInterval: 30,
				startOnTick: true,
				gridLineWidth: 1,
				gridLineColor: 'var(--d2l-color-mica)',
				tickLength: 5,
				labels: {
					style: {
						fontSize: '14px',
						color: 'var(--d2l-color-ferrite)',
						fontFamily: 'Lato'
					}
				},
				plotLines: [{
					color: 'var(--d2l-color-celestine)',
					dashStyle: 'Dash',
					value: this.filter.avgTimeInContent,
					width: 1.5
				}]
			},
			yAxis: {
				title: {
					text: this._currentGradeText,
					style: {
						color: 'var(--d2l-color-ferrite)',
						fontSize: '10px',
						fontWeight: 'bold',
						fontFamily: 'Lato'
					}
				},
				max: 100,
				tickPositions: [0, 25, 50, 75, 100],
				startOnTick: true,
				endOnTick: true,
				gridLineWidth: 1,
				gridLineColor: 'var(--d2l-color-mica)',
				tickLength: 5,
				tickWidth: 1,
				labels: {
					style: {
						fontSize: '14px',
						color: 'var(--d2l-color-ferrite)',
						fontFamily: 'Lato'
					}
				},
				plotLines: [{
					color: 'var(--d2l-color-celestine)',
					dashStyle: 'Dash',
					value: this.filter.avgGrade,
					width: 1.5
				}]
			},
			plotOptions: {
				series: {
					marker: {
						radius: 5,
						fillColor: 'var(--d2l-color-amethyst-plus-1)',
						symbol: 'circle'
					},
					states: {
						hover: {
							enabled: false
						}
					},
					accessibility: {
						pointDescriptionFormatter: function(point) {
							return `${that._currentGradeText}: ${point.y} - ${that._timeInContentText}: ${point.x}`;
						}
					},
				}
			},
			accessibility: {
				screenReaderSection: {
					beforeChartFormat: BEFORE_CHART_FORMAT
				}
			},
			series: [{
				name: 'leftBottom',
				data: this._plotDataForLeftBottomQuadrant
			},
			{
				name: 'leftTop',
				data: this._plotDataForLeftTopQuadrant
			},
			{
				name: 'rightTop',
				data: this._plotDataForRightTopQuadrant
			},
			{
				name: 'rightBottom',
				data: this._plotDataForRightBottomQuadrant
			},
			{
				name: 'midPoint',
				data: that._dataMidPoints,
				lineColor: 'transparent',
				marker: {
					fillColor: 'transparent',
					states: {
						hover: {
							enabled: false
						}
					}
				},
			}]
		};
	}
}
decorate(TimeInContentVsGradeCard, {
	filter: computed,
	_dataMidPoints: computed,
	_plotDataForLeftBottomQuadrant: computed,
	_plotDataForLeftTopQuadrant: computed,
	_plotDataForRightTopQuadrant: computed,
	_plotDataForRightBottomQuadrant: computed
});
customElements.define('d2l-insights-time-in-content-vs-grade-card', TimeInContentVsGradeCard);
