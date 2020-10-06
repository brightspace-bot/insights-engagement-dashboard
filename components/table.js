import { bodySmallStyles, bodyStandardStyles } from '@brightspace-ui/core/components/typography/styles.js';
import { css, html, LitElement } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';
import { Localizer } from '../locales/localizer';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';

export const COLUMN_TYPES = {
	NORMAL_TEXT: 0,
	TEXT_SUB_TEXT: 1
};

/**
 * @property {String} title - for use by screen reader users
 * @property {Array} columnInfo - list of column info. Contains headerText and columnType
 * @property {Array} data - a row-indexed 2D array of rows and columns.
 * E.g. data[0] gets the entire first row; data[0][0] gets the first row / first column
 */
class Table extends SkeletonMixin(Localizer(RtlMixin(LitElement))) {

	static get properties() {
		return {
			title: { type: String, attribute: true },
			columnInfo: { type: Array, attribute: false },
			data: { type: Array, attribute: false }
		};
	}

	static get styles() {
		return [super.styles, bodyStandardStyles, bodySmallStyles, css`
			:host {
				display: block;
			}
			:host([hidden]) {
				display: none;
			}

			:host([dir="rtl"]) .d2l-insights-table-table {
				text-align: right;
			}

			.d2l-insights-table-table {
				background-color: #ffffff;
				border-collapse: separate;
				border-spacing: 0;
				font-weight: normal;
				text-align: left;
				width: 100%;
			}

			.d2l-insights-table-header {
				background-color: var(--d2l-color-regolith);
				color: var(--d2l-color-ferrite);
				height: 27px; /* min-height to be 48px including border */
				line-height: 1.4rem;
				padding: 10px 20px;
			}

			.d2l-insights-table-cell {
				border-bottom: 1px solid var(--d2l-color-mica);
				display: table-cell;
				font-weight: normal;
				height: 41px; /* min-height to be 62px including border */
				padding: 10px 20px;
				vertical-align: middle;
			}

			/* Table cell borders - to get exactly 1px inner borders in all cells */
			.d2l-insights-table-table .d2l-insights-table-row-first > th {
				border-top: 1px solid var(--d2l-color-mica);
			}

			.d2l-insights-table-table .d2l-insights-table-cell {
				border-right: 1px solid var(--d2l-color-mica);
			}

			.d2l-insights-table-table .d2l-insights-table-cell-first,
			:host([dir="rtl"]) .d2l-insights-table-table .d2l-insights-table-cell-last {
				border-left: 1px solid var(--d2l-color-mica);
			}

			:host([dir="rtl"]) .d2l-insights-table-table .d2l-insights-table-cell-first:not(.d2l-insights-table-cell-last) {
				border-left: 0;
			}

			/* Table cell radii - to round all 4 corners */
			/* top row, first child */
			.d2l-insights-table-table .d2l-insights-table-row-first > .d2l-insights-table-cell-first {
				border-top-left-radius: 8px;
			}
			:host([dir="rtl"]) .d2l-insights-table-table .d2l-insights-table-row-first > .d2l-insights-table-cell-first:not(.d2l-insights-table-cell-last) {
				border-top-left-radius: 0;
			}
			:host([dir="rtl"]) .d2l-insights-table-table .d2l-insights-table-row-first > .d2l-insights-table-cell-first {
				border-top-right-radius: 8px;
			}

			/* top row, last child */
			.d2l-insights-table-table .d2l-insights-table-row-first > .d2l-insights-table-cell-last {
				border-top-right-radius: 8px;
			}
			:host([dir="rtl"]) .d2l-insights-table-table .d2l-insights-table-row-first > .d2l-insights-table-cell-last:not(.d2l-insights-table-cell-first) {
				border-top-right-radius: 0;
			}
			:host([dir="rtl"]) .d2l-insights-table-table .d2l-insights-table-row-first > .d2l-insights-table-cell-last {
				border-top-left-radius: 8px;
			}

			/* bottom row, first child */
			.d2l-insights-table-table .d2l-insights-table-row-last > .d2l-insights-table-cell-first {
				border-bottom-left-radius: 8px;
			}
			:host([dir="rtl"]) .d2l-insights-table-table .d2l-insights-table-row-last > .d2l-insights-table-cell-first:not(.d2l-insights-table-cell-last) {
				border-bottom-left-radius: 0;
			}
			:host([dir="rtl"]) .d2l-insights-table-table .d2l-insights-table-row-last > .d2l-insights-table-cell-first {
				border-bottom-right-radius: 8px;
			}

			/* bottom row, last child */
			.d2l-insights-table-table .d2l-insights-table-row-last > .d2l-insights-table-cell-last {
				border-bottom-right-radius: 8px;
			}
			:host([dir="rtl"]) .d2l-insights-table-table .d2l-insights-table-row-last > .d2l-insights-table-cell-last:not(.d2l-insights-table-cell-first) {
				border-bottom-right-radius: 0;
			}
			:host([dir="rtl"]) .d2l-insights-table-table .d2l-insights-table-row-last > .d2l-insights-table-cell-last {
				border-bottom-left-radius: 8px;
			}
		`];
	}

	constructor() {
		super();
		this.columnInfo = [];
		this.data = [];
		this.title = '';
	}

	render() {
		return html`
			<table class="d2l-insights-table-table" aria-label="${this.title}">
				${this._renderThead()}
				${this._renderTbody()}
			</table>
		`;
	}

	get _numColumns() {
		return this.columnInfo.length;
	}

	_renderThead() {
		const styles = {
			'd2l-insights-table-row-first': true,
			// if skeleton view is displayed, then there will definitely be skeleton rows in the table,
			// even if data.length is 0. Therefore if skeleton is true, don't apply the "last row" style to header
			'd2l-insights-table-row-last': !this.skeleton && this.data.length === 0
		};

		return html`
			<thead class="d2l-insights-table-header">
				<tr class="${classMap(styles)}">
					${this.columnInfo.map(this._renderHeaderCell, this)}
				</tr>
			</thead>
		`;
	}

	_renderHeaderCell(info, idx) {
		const styles = {
			'd2l-insights-table-cell': true,
			'd2l-insights-table-cell-first': idx === 0,
			'd2l-insights-table-cell-last': idx === this._numColumns - 1
		};

		return html`
			<th class="${classMap(styles)}" scope="col">${info.headerText}</th>
		`;
	}

	_renderTbody() {
		const styles = (rowIdx) => ({
			'd2l-insights-table-row-last': rowIdx === this.data.length - 1
		});

		return html`
			<tbody>
				${this.data.map((row, rowIdx) => html`
					<tr class="${classMap(styles(rowIdx))}">
						${row.map(this._renderBodyCell, this)}
					</tr>
				`)}
			</tbody>
		`;
	}

	_renderBodyCell(value, idx) {
		const columnType = this.columnInfo[idx].columnType;
		const styles = {
			'd2l-insights-table-cell': true,
			'd2l-insights-table-cell-first': idx === 0,
			'd2l-insights-table-cell-last': idx === this._numColumns - 1
		};

		const defaultHtml = html`
			<td class="${classMap(styles)}">
				<div class="d2l-skeletize d2l-skeletize-95 d2l-body-standard">${value}</div>
			</td>
		`;

		if (this.skeleton) {
			return defaultHtml; // regardless of the column type, because the data hasn't been loaded yet
		}

		if (columnType === COLUMN_TYPES.TEXT_SUB_TEXT) {
			return html`
				<td class="${classMap(styles)}">
					<div class="d2l-body-standard">${value[0]}</div>
					<div class="d2l-body-small">${value[1]}</div>
				</td>
			`;
		} else if (columnType === COLUMN_TYPES.NORMAL_TEXT) {
			return defaultHtml;
		} // future work: else if COLUMN_TYPES.SUBCOLUMNS...

		throw new Error('Users table: unknown column type');
	}
}
customElements.define('d2l-insights-table', Table);
