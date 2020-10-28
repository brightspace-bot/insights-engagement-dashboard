import d2lTelemetryBrowserClient from 'd2l-telemetry-browser-client';

export class TelemetryHelper {
	constructor(endpoint) {
		if (endpoint) {
			this._client = new d2lTelemetryBrowserClient.Client({ endpoint });
		}
	}

	_createEvent(eventType, eventBody) {
		return new d2lTelemetryBrowserClient.TelemetryEvent()
			.setDate(new Date())
			.setType(eventType)
			.setSourceId('insights')
			.setBody(eventBody);
	}

	getPerformanceLoadPageMeasures() {
		if (!window.performance || !window.performance.getEntriesByName) {
			return [];
		}

		return window.performance.getEntriesByType('measure');
	}

	logPerformanceEvent({ id, measures, action }) {
		if (!this._client || !window.location) {
			return;
		}

		if (measures.lenght < 1) {
			return;
		}

		const eventBody = new d2lTelemetryBrowserClient.PerformanceEventBody()
			.setAction(action)
			.setObject(id, 'engagement', window.location.href)
			.addCustom('Source', 'engagement')
			.addUserTiming(measures);

		const event = this._createEvent('PerformanceEvent', eventBody);

		this._client.logUserEvent(event);
	}
}
