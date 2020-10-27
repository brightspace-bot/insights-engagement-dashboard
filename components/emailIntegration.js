const callbackName = 'EngagementDashboardEmailCallback';

const RECIPIENT_TYPES = {
	TO: 0,
	CC: 1,
	BCC: 2
};

export const createComposeEmailPopup = (userIds, orgUnitId) => {
	window[callbackName] = {
		// a map from userId to recipient type
		GetUsers: () => {
			const users = {};
			userIds.forEach(userId => {
				users[`u${userId}`] = [RECIPIENT_TYPES.BCC];
			});
			return users;
		},
		// a list of userIds to send to
		GetUserIds: () => userIds,

		// a list of groupIds to send to
		GetGroupIds: () => [],
		// a map from groupId to recipient type
		GetGroups: () => {
			return {
				// example with groupId = 1234
				// g1234: RECIPIENT_TYPE.TO
			};
		},

		// a list of standalone email addresses, not related to any particular user
		GetEmails: () => [],
		// string to prefill the email subject
		GetSubject: () => '',
		// string to prefill the email body
		GetBody: () => ''
	};

	window.open(
		`/d2l/lms/email/integration/AdaptLegacyPopupData.d2l?ou=${orgUnitId}&cb=${callbackName}`,
		'ComposeEmail',
		'height=900,width=960,resizable=yes,scrollbars=yes'
	);
};
