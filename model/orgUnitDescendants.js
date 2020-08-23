const ORG_UNIT = {
	ID: 0,
	NAME: 1,
	TYPE: 2,
	ANCESTORS: 3
};

// some utils functions
function arrayUnion(a, b) {
	return [...a, ...b];
}

function intersectSets(setA, setB) {
	const returnValue = new Set();
	for (const element of setB) {
		if (setA.has(element)) {
			returnValue.add(element);
		}
	}
	return returnValue;
}

class OrgUnitDescendants {

	/**
	 * @param orgUnitData - the same orgUnit format that we get from the server
	 */
	constructor(orgUnitData) {
		/**
		 * @typedef {{children: Set, visited: boolean}} OrgUnitNode - children means direct children here
		 * @typedef {Object.<number, OrgUnitNode>} OrgUnitGraph - a map between orgUnitId and orgUnitNode
		 * @type OrgUnitGraph
		 */
		this.graph = {};

		// possible space optimization: don't store the root OU, since we know its full list of descendants is all OUs
		orgUnitData.forEach(orgUnit => {
			const orgUnitId = orgUnit[ORG_UNIT.ID];

			if (!this.graph[orgUnitId]) {
				this._initializeNode(orgUnitId);
			}

			orgUnit[ORG_UNIT.ANCESTORS].forEach(ancestorId => {
				if (!this.graph[ancestorId]) {
					this._initializeNode(ancestorId);
				}
				this.graph[ancestorId].children.add(orgUnitId);
			});
		});
	}

	_initializeNode(orgUnitId) {
		this.graph[orgUnitId] = {
			children: new Set(),
			visited: false
		};
	}

	/**
	 * @param {Number} orgUnitId
	 * @returns {[Number]} - list of all descendants, including the orgUnitId that was passed in
	 */
	getAllDescendantsFor(orgUnitId) {
		const returnValue = this._getAllDescendantsFor(orgUnitId);
		this._resetVisited();
		return returnValue;
	}

	_getAllDescendantsFor(orgUnitId) {
		const returnValue = [orgUnitId];
		if (!this.graph[orgUnitId]) {
			return returnValue;
		}

		if (this.graph[orgUnitId].visited) {
			return [];
		}

		this.graph[orgUnitId].visited = true;
		this.graph[orgUnitId].children.forEach(child => returnValue.push(...this._getAllDescendantsFor(child)));
		return returnValue;
	}

	_resetVisited() {
		for (const orgUnitId in this.graph) {
			this.graph[orgUnitId].visited = false;
		}
	}

	/**
	 * An empty filter array means either no filter is applied (e.g. if the filter was cleared) or all selections were
	 * deselected. For the purposes of the dropdown filters, those two cases are equivalent.
	 * @param {[Number]} orgUnitFilterIds
	 * @param {[Number]} semesterFilterIds
	 * @returns Set - the set of all orgUnits that should be included in record results
	 */
	getOrgUnitIdsInView(orgUnitFilterIds, semesterFilterIds) {
		// if both filters are applied, then
		//  - we need to take the UNION of sets WITHIN a filter
		//  - but then we take the INTERSECTION of sets BETWEEN filters
		let orgUnitsDescendants = null;
		if (orgUnitFilterIds.length) {
			orgUnitsDescendants = new Set(
				orgUnitFilterIds
					.map(orgUnitId => this.getAllDescendantsFor(orgUnitId))
					.reduce(arrayUnion, [])
			);
		}

		let semesterDescendants = null;
		if (semesterFilterIds.length) {
			semesterDescendants = new Set(
				semesterFilterIds
					.map(semesterId => this.getAllDescendantsFor(semesterId))
					.reduce(arrayUnion, [])
			);
		}

		let orgUnitIdsInView;
		if (semesterDescendants && orgUnitsDescendants) {
			orgUnitIdsInView = intersectSets(orgUnitsDescendants, semesterDescendants);
		} else {
			orgUnitIdsInView = orgUnitsDescendants || semesterDescendants;
		}

		return orgUnitIdsInView;
	}
}

export default OrgUnitDescendants;
