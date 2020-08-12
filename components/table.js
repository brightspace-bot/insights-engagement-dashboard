import {css, html, LitElement} from 'lit-element';
import {Localizer} from '../locales/localizer';
import {RtlMixin} from '@brightspace-ui/core/mixins/rtl-mixin';

/**
 * @property {String} title - for use by screen reader users
 * @property {Array} columns - list of column header text
 * @property {Array} data - a row-indexed 2D array of rows and columns.
 * E.g. data[0] gets the entire first row; data[0][0] gets the first row / first column
 */
class Table extends Localizer(RtlMixin(LitElement)) {

	static get properties() {
		return {
			title: {type: String, attribute: true},
			columns: {type: Array, attribute: false},
			data: {type: Array, attribute: false}
		};
	}

	static get styles() {
		return css`
			:host([dir="rtl"]) table {
				text-align: right;
			}

			.d2l-table {
				background-color: #fff;
				border-collapse: separate;
				border-spacing: 0;
				width: 100%;
				text-align: left;
				font-weight: normal;
			}

			.d2l-table-header {
				color: var(--d2l-color-ferrite);
				background-color: var(--d2l-color-regolith);
				line-height: 1.4rem;
				padding: 10px 20px;
				height: 27px; /* min-height to be 48px including border */
			}

			.d2l-table-cell {
				display: table-cell;
				vertical-align: middle;
				padding: 10px 20px;
				height: 41px; /* min-height to be 62px including border */
				border-right: 1px solid var(--d2l-color-mica);
				border-bottom: 1px solid var(--d2l-color-mica);
			}

			/* Table cell border and radius */
			/* to get a radius on all corners *and* exactly 1px inner borders */
			table tr:first-child th {
				border-top: 1px solid var(--d2l-color-mica);
			}

			table tr th:first-child,td:first-child {
				border-left: 1px solid var(--d2l-color-mica);
			}

			table tr:first-child th:first-child {
				border-top-left-radius: 8px;
			}

			table tr:first-child th:last-child {
				border-top-right-radius: 8px;
			}

			table tr:last-child td:first-child {
				border-bottom-left-radius: 8px;
			}

			table tr:last-child td:last-child {
				border-bottom-right-radius: 8px;
			}

			th {
				font-weight: normal;
			}
		`;
	}

	constructor() {
		super();
		this.columns = [];
		this.data = [];
		this.title = '';
	}

	render() {
		return html`
			<table class="d2l-table" aria-label="${this.title}">
				${this._renderThead()}
				${this._renderTbody()}
			</table>
		`;
	}

	_renderThead() {
		return html`
			<thead class="d2l-table-header">
				<tr>
					${this.columns.map(colName => html`
						<th class="d2l-table-cell" scope="col">${colName}</th>
					`)}
				</tr>
			</thead>
		`;
	}

	_renderTbody() {
		return html`
			<tbody>
				${this.data.map(row => html`
					<tr>
						${row.map(colValue => html`
							<td class="d2l-table-cell">${colValue}</td>
						`)}
					</tr>
				`)}
			</tbody>
		`;
	}
}
customElements.define('d2l-insights-table', Table);
