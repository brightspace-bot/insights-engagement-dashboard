// just a list of checkboxes inside a dropdown to act as a temporary basic filter

import '@brightspace-ui/core/components/dropdown/dropdown-content';
import '@brightspace-ui/core/components/dropdown/dropdown';
import '@brightspace-ui/core/components/inputs/input-checkbox';

import {html, LitElement} from 'lit-element';
import {selectStyles} from '@brightspace-ui/core/components/inputs/input-select-styles';

/**
 * @fires d2l-simple-filter-selected - event.detail contains {string} filterName, {string} id, and {boolean} selected
 */
class SimpleFilter extends LitElement {
    static get styles() {
        return [selectStyles];
    }

    static get properties() {
        return {
            name: {type: String, attribute: true},
            data: {type: Array, attribute: false}
        };
    }

    constructor() {
        super();

        this.data = [];
        this.name = '';

        this.addEventListener('d2l-simple-filter-selected-internal', this._handleElementSelected);
    }

    _handleElementSelected(event) {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent('d2l-simple-filter-selected', {
            bubbles: true,
            composed: true,
            detail: {...event.detail, filterName: this.name}
        }));
    }

    _repackageElementSelected(event) {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent('d2l-simple-filter-selected-internal', {
            bubbles: true,
            composed: true, // allow it to pass through shadow dom
            detail: {
                itemId: event.target.value,
                selected: event.target.checked
            }
        }));
    }

    firstUpdated() {
        const dropdownContent = this.shadowRoot.querySelector('d2l-dropdown-content');
        dropdownContent.addEventListener('change', this._repackageElementSelected);
    }

    render() {
        return html`
            <d2l-dropdown>
                <button class="d2l-dropdown-opener d2l-input-select" aria-label="Open ${this.name} filter">
                    ${this.name}
                </button>

                <d2l-dropdown-content align="start">
                    <!-- placing a string inside the checkbox already acts as a label, no need to add one explicitly -->
                    ${this.data.map(obj => html`
                        <d2l-input-checkbox value="${obj.id}">${obj.displayName}</d2l-input-checkbox>
                    `)}
                </d2l-dropdown-content>

            </d2l-dropdown>
        `;
    }
}

customElements.define('d2l-simple-filter', SimpleFilter);
