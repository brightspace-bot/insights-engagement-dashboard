import { createEmailCallbackObject } from '../../components/email-integration';
import { expect } from '@open-wc/testing';

describe('EmailIntegration.createEmailCallbackObject', () => {
	it('should return a callback object with the given userIds', () => {
		const userIds = [1, 2, 3, 4];
		const expectedGetUsersResult = {
			u1: [2], u2: [2], u3: [2], u4: [2]
		};

		const actual = createEmailCallbackObject(userIds);
		expect(actual.GetUsers()).to.deep.equal(expectedGetUsersResult);
		expect(actual.GetUserIds()).to.deep.equal(userIds);

		// make sure everything else is empty
		expect(actual.GetGroups()).to.deep.equal({});
		expect(actual.GetGroupIds()).to.deep.equal([]);
		expect(actual.GetEmails()).to.deep.equal([]);
		expect(actual.GetSubject()).to.equal('');
		expect(actual.GetBody()).to.equal('');
	});
});
