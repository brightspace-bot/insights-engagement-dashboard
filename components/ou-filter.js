import './tree-selector.js';
import {css, html} from 'lit-element/lit-element.js';
import { MobxLitElement } from '@adobe/lit-mobx';

class OuFilter extends MobxLitElement {

	static get properties() {
		return {
			data: { type: Object, attribute: false }
		};
	}

	static get styles() {
		return css`
			:host {
				display: inline-block;
			}
			:host([hidden]) {
				display: none;
			}
		`;
	}

	render() {
		this._ous = this._getChildren();

		// NB: relying on mobx rather than lit-element properties to handle update detection: it will trigger a redraw for
		// any change to a relevant observed property of the Data object
		// or WILL it??? answer: no, it won't
		// TODO: rethink data/mobx/redraw relation w. the dashboard component
		// one idea: maybe make children a property and don't mobx this at all (not thought through...)
		return html`<div class="ou-filter" ?loading="${this.data.isLoading}">
			<d2l-insights-tree-selector id="ou-tree-selector" .tree="${this._ous}" @change="${this._onChange}">
		</div>`;
	}

	get selected() {
		return this.shadowRoot.getElementById('ou-tree-selector')
			.selected;
	}

	// TODO: constants for array indices
	_getChildren(id) {
		return this.data.getChildren(id).map(x => ({
			name: `${x[1]} (${x[0]})`,
			getChildren: x[2] === 3 ? null : async() => this._getChildren(x[0])
		}));
	}

	_onChange() {
		this.dispatchEvent(new CustomEvent(
			'change',
			{bubbles: true, composed: false}
		));
	}
}
customElements.define('d2l-insights-ou-filter', OuFilter);
