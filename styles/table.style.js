import {css} from 'lit-element';

// shamelessly copied with modifications from the BrightspaceUI/table repo (since that isn't compatible with LitElement)
export const tableStyle = css`
:host([dir="rtl"]) table {
	text-align: right;
}

.d2l-table {
	background-color: #fff;
	border: 1px solid var(--d2l-color-mica);
	border-radius: 8px 8px 0 0;
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
}

th {
	font-weight: normal;
}
`;
