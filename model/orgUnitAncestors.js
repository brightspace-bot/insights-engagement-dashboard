const ORG_UNIT = {
	ID: 0,
	NAME: 1,
	TYPE: 2,
	ANCESTORS: 3
};

class OrgUnitAncestors {
	/**
	 * @param orgUnitData - the same orgUnit format that we get from the server
	 */
	constructor(orgUnitData) {
		const parentsMap = new Map();
		orgUnitData.forEach(orgUnit => {
			parentsMap.set(orgUnit[ORG_UNIT.ID], orgUnit[ORG_UNIT.ANCESTORS]);
		});

		/**
		 * @type {Map<Number, Set>} - map from orgUnitIds to set of all ancestors
		 * NOTE: each set includes the element itself as well
		 */
		this.ancestorsMap = new Map();
		orgUnitData.forEach(orgUnit => {
			this._addOrgUnitToAncestorsMap(orgUnit[ORG_UNIT.ID], parentsMap);
		});
	}

	/**
	 * @param {Number} orgUnitId
	 * @param {Map<Number, Array<Number>>} parentsMap
	 * @returns {Iterable}
	 * @private
	 */
	_addOrgUnitToAncestorsMap(orgUnitId, parentsMap) {
		if (orgUnitId === 0) {
			return [];
		}

		if (this.ancestorsMap.has(orgUnitId)) {
			return this.ancestorsMap.get(orgUnitId);
		}

		const ancestorsSet = new Set([orgUnitId]);
		parentsMap.get(orgUnitId).forEach(parent => {
			const ancestorsOfParent = this._addOrgUnitToAncestorsMap(parent, parentsMap);
			ancestorsOfParent.forEach(ancestor => ancestorsSet.add(ancestor));
		});

		this.ancestorsMap.set(orgUnitId, ancestorsSet);
		return ancestorsSet;
	}

	/**
	 * @param {Number} orgUnitId
	 * @returns {Set | undefined} - undefined if the key can't be found in the map
	 */
	getAncestorsFor(orgUnitId) {
		return this.ancestorsMap.get(orgUnitId);
	}
}
export default OrgUnitAncestors;
