import 'highcharts';
import { css, html } from 'lit-element/lit-element.js';
import { BEFORE_CHART_FORMAT } from './chart/chart';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';
import { RECORD } from '../model/data';

export const TimeInContentVsGradeCardFilter  = {
	id: 'd2l-insights-time-in-content-vs-grade-card',
	title: 'components.insights-time-in-content-vs-grade-card.timeInContentVsGrade',
	filter: (record, data) => {
		let result;
		if (data.tiCVsGradesQuadrant === 'leftBottom') {
			result = record[RECORD.TIME_IN_CONTENT] < data.tiCVsGradesAvgValues[0] * 60 && record[RECORD.CURRENT_FINAL_GRADE] !== null && record[RECORD.CURRENT_FINAL_GRADE] < data.tiCVsGradesAvgValues[1];
		} else if (data.tiCVsGradesQuadrant === 'leftTop') {
			result = record[RECORD.TIME_IN_CONTENT] <= data.tiCVsGradesAvgValues[0] * 60 && record[RECORD.CURRENT_FINAL_GRADE] !== null && record[RECORD.CURRENT_FINAL_GRADE] >= data.tiCVsGradesAvgValues[1];
		} else if (data.tiCVsGradesQuadrant === 'rightTop') {
			result = record[RECORD.TIME_IN_CONTENT] > data.tiCVsGradesAvgValues[0] * 60 && record[RECORD.CURRENT_FINAL_GRADE] !== null && record[RECORD.CURRENT_FINAL_GRADE] > data.tiCVsGradesAvgValues[1];
		} else if (data.tiCVsGradesQuadrant === 'rightBottom') {
			result =  record[RECORD.TIME_IN_CONTENT] >= data.tiCVsGradesAvgValues[0] * 60 && record[RECORD.CURRENT_FINAL_GRADE] !== null && record[RECORD.CURRENT_FINAL_GRADE] < data.tiCVsGradesAvgValues[1];
		} else (result = false);
		return result;
	}
};

export const AVG = {
	TIME: 0,
	GRADE: 1
};

class TimeInContentVsGradeCard extends Localizer(MobxLitElement) {

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
		return css`
			:host {
				border-color: var(--d2l-color-mica);
				border-radius: 15px;
				border-style: solid;
				border-width: 1.5px;
				display: inline-block;
				height: 275px;
				margin-right: 10px;
				margin-top: 19.5px;
				padding: 15px;
				width: 602px;
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
		`;
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

	get _preparedPlotData() {
		return this.data.tiCVsGrades;
	}

	get _plotDataForLeftBottomQuadrant() {
		return  this._preparedPlotData.filter(i => i[AVG.TIME] < this._avgTimeInContent && i[AVG.GRADE] < this._avgGrades);
	}

	get _plotDataForLeftTopQuadrant() {
		return this._preparedPlotData.filter(i => i[AVG.TIME] <= this._avgTimeInContent && i[AVG.GRADE] >= this._avgGrades);
	}

	get _plotDataForRightTopQuadrant() {
		return this._preparedPlotData.filter(i => i[AVG.TIME] > this._avgTimeInContent && i[AVG.GRADE] > this._avgGrades);
	}

	get _plotDataForRightBottomQuadrant() {
		return this._preparedPlotData.filter(i => i[AVG.TIME] >= this._avgTimeInContent && i[AVG.GRADE] < this._avgGrades);
	}

	get _avgGrades() {
		return this.data.tiCVsGradesAvgValues[AVG.GRADE];
	}

	get _avgTimeInContent() {
		return this.data.tiCVsGradesAvgValues[AVG.TIME];
	}

	_setQuadrant(quadrant) {
		this.data.setTiCVsGradesQuadrant(quadrant);
	}

	_calculateQuadrant(x, y) {
		let quadrant;
		if (x < this._avgTimeInContent && y < this._avgGrades) quadrant = 'leftBottom';
		else if (x <= this._avgTimeInContent && y >= this._avgGrades) quadrant = 'leftTop';
		else if (x > this._avgTimeInContent && y > this._avgGrades) quadrant = 'rightTop';
		else quadrant = 'rightBottom';
		return quadrant;
	}

	_coloringAllPointInAmethyst(series) {
		series.forEach(series => { series.update({
			marker: { enabled: true, fillColor: 'var(--d2l-color-amethyst-plus-1)' } });
		});
	}

	_coloringNonSelectedPointInMica(series) {
		series.forEach(series => {
			if (series.name !== this._quadrant) {
				series.update({ marker: { enabled: true, fillColor: 'var(--d2l-color-mica)' } });
			}
		});
	}

	_coloringSelectedQuadrantPointsInAmethyst(series) {
		series.forEach(series => {
			if (series.name === this._quadrant) {
				series.update({ marker: { enabled: true, fillColor: 'var(--d2l-color-amethyst-plus-1)' } });
			}
		});
	}

	get _quadrant() {
		return this.data.tiCVsGradesQuadrant;
	}

	get isApplied() {
		return this.data.cardFilters['d2l-insights-time-in-content-vs-grade-card'].isApplied;
	}

	_valueClickHandler() {
		this.data.setApplied('d2l-insights-time-in-content-vs-grade-card', true);
	}

	render() {
		// NB: relying on mobx rather than lit-element properties to handle update detection: it will trigger a redraw for
		// any change to a relevant observed property of the Data object
		return html`<div class="d2l-insights-time-in-content-vs-grade-title">${this._cardTitle}</div>
		<d2l-labs-chart class="d2l-insights-summary-card-body" .options="${this.chartOptions}" ?loading="${this.data.isLoading}"></d2l-labs-chart>`;
	}

	get chartOptions() {
		const that = this;

		return {
			chart: {
				type: 'scatter',
				height: 250,
				events: {
					click: function(event) {
						that._coloringAllPointInAmethyst(this.series);
						const quadrant = that._calculateQuadrant(Math.floor(event.xAxis[0].value), Math.floor(event.yAxis[0].value));
						that._setQuadrant(quadrant);
						that._coloringNonSelectedPointInMica(this.series);
						that._valueClickHandler();
					},
					update: function() {
						if (!that.isApplied) {
							that._coloringAllPointInAmethyst(this.series);
						}
						if (that.isApplied) {
							that._coloringNonSelectedPointInMica(this.series);
							that._coloringSelectedQuadrantPointsInAmethyst(this.series);
						}
					}
				}
			},
			animation: false,
			tooltip: { enabled: false },
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
					value: this._avgTimeInContent,
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
					value: this._avgGrades,
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
					}
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
			}]
		};
	}
}

customElements.define('d2l-insights-time-in-content-vs-grade-card', TimeInContentVsGradeCard);
