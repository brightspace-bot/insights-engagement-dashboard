import { autorun } from 'mobx';

let isDisabledForTesting = false;
export function disableUrlStateForTesting() {
	isDisabledForTesting = true;
}
export function enableUrlState() {
	isDisabledForTesting = false;
}

export function isDefault() {
	// this function does not attempt to handle
	// pages that include query parameters for the server in their default state
	return window.location.search === '';
}

// plan: store various filter settings in the url query (handled by each component); then add a button
// "make this my default view" that stores the current query in local storage
// TODO: consider making this a decorator that surfaces filter(), id, title, isApplied, shouldReloadFromServer()
/**
 * The wrapped object must implement:
 * {String} get persistenceKey() - a constant string used as the url query parameter for this component
 * {String} get persistenceValue() - should reference one or more mobx observables and return current state as a string
 * set persistenceValue({String}) - called when the component should set the given state
 */
export class UrlState {

	constructor(wrapped) {
		this._wrapped = wrapped;

		if (isDisabledForTesting) return;

		// load state from the url on setup, and again when the user hits forward or back;
		// have mobx save state whenever it changes
		this._load();
		this._onpopstate = this._onpopstate.bind(this);
		window.addEventListener('popstate', this._onpopstate);

		autorun(() => this._save());
	}

	get key() {
		return this._wrapped.persistenceKey;
	}

	get value() {
		return this._wrapped.persistenceValue;
	}

	set value(value) {
		this._wrapped.persistenceValue = value;
	}

	_onpopstate(e) {
		if (e.state !== null) this._load();
	}

	_load() {
		const url = new URL(window.location.href);
		this.value = this._savedValue(url);
	}

	_save() {
		console.log(`save ${this.key}`);
		const url = new URL(window.location.href);
		const valueToSave = this.value;
		if (valueToSave !== this._savedValue(url)) {
			url.searchParams.set(this.key, valueToSave);
			window.history.pushState({}, '', url.toString());
		}
	}

	_savedValue(url) {
		return url.searchParams.get(this.key) || '';
	}
}
