import {css} from 'lit-element';

// shamelessly copied with modifications from the BrightspaceUI/table repo (since that isn't compatible with LitElement)
export const tableStyle = css`
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
