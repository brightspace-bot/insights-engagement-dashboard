/* eslint quotes: 0 */

export default {
	"components.insights-engagement-dashboard.title": "Engagement Dashboard",
	"components.insights-engagement-dashboard.summaryHeading": "Summary View",
	"components.insights-engagement-dashboard.resultsHeading": "Results",
	"components.insights-engagement-dashboard.resultsReturned": "결과 내에서 반환된 사용자입니다.",
	"components.insights-engagement-dashboard.overdueAssignments": "현재 사용자에게 하나 이상 기한이 경과한 과제가 있습니다.",
	"components.insights-engagement-dashboard.overdueAssignmentsHeading": "과제 기한 경과",
	"components.insights-engagement-dashboard.lastSystemAccess": "사용자가 지난 14일 동안 시스템에 액세스하지 않았습니다.",
	"components.insights-engagement-dashboard.lastSystemAccessHeading": "시스템 액세스",
	"components.insights-engagement-dashboard.tooManyResults": "There are too many results in your filters. Please refine your selection.",
	"components.insights-engagement-dashboard.learMore": "Learn More",
	"components.insights-engagement-dashboard.exportToCsv": "Export to CSV",
	"components.insights-engagement-dashboard.emailButton": "이메일",
	"components.insights-engagement-dashboard.noUsersSelectedDialogText": "Please select one or more users to email.",

	"components.insights-role-filter.name": "역할",

	"components.org-unit-filter.name-all-selected": "구성단위: 전체",
	"components.org-unit-filter.name-some-selected": "구성단위: 선택 사항이 적용됨",

	"components.semester-filter.name": "학기",
	"components.semester-filter.semester-name": "{orgUnitName}(ID: {orgUnitId})",

	"components.simple-filter.search-label": "검색",
	"components.simple-filter.search-placeholder": "검색...",
	"components.simple-filter.dropdown-action": "Open {name} filter",

	"components.tree-filter.node-name": "{orgUnitName} (Id: {id})",
	"components.tree-filter.node-name.root": "루트",
	"components.tree-selector.search-label": "검색",
	"components.tree-selector.load-more-label": "더 많이 로드",
	"components.tree-selector.parent-load-more.aria-label": "더 많은 하위 구성 단위 로드",
	"components.tree-selector.search-load-more.aria-label": "더 많은 검색 결과 로드",
	"components.tree-selector.search-placeholder": "검색...",
	"components.tree-selector.dropdown-action": "{name} 필터 열기",
	"components.tree-selector.arrow-label.closed": "{level}에서 {parentName}의 하위 수준 {name} 확장",
	"components.tree-selector.arrow-label.open": "{level}에서 {parentName}의 하위 수준 {name} 축소",
	"components.tree-selector.node.aria-label": "{parentName}의 하위 수준 {name}",

	"components.dropdown-filter.load-more": "Load More",
	"components.dropdown-filter.opener-text-all": "{filterName}: 모두",
	"components.dropdown-filter.opener-text-multiple": "{filterName}: {selectedCount} selected",
	"components.dropdown-filter.opener-text-single": '{filterName}: {selectedItemName}',

	"components.insights-users-table.title": "사용자 상세 정보",
	"components.insights-users-table.loadingPlaceholder": "로드 중...",
	"components.insights-users-table.lastFirstName": "이름",
	"components.insights-users-table.lastAccessedSystem": "최근 접근한 시스템",
	"components.insights-users-table.courses": "강의",
	"components.insights-users-table.avgGrade": "평균 평점",
	"components.insights-users-table.avgTimeInContent": "평균 콘텐츠의 시간(분)",
	"components.insights-users-table.avgDiscussionActivity": "평균 토론 활동",
	"components.insights-users-table.totalUsers": "Total Users: {num}",
	"components.insights-users-table.lastAccessedSys" : "최근 접근한 시스템",
	"components.insights-users-table.null" : "NULL",
	"components.insights-users-table.selectorAriaLabel": "Select {userLastFirstName}",

	"components.insights-table.selectAll": "Select all",

	"components.insights-time-in-content-vs-grade-card.timeInContentVsGrade": "콘텐츠의 시간 대 평점",
	"components.insights-time-in-content-vs-grade-card.currentGrade": "현재 평점(%)",
	"components.insights-time-in-content-vs-grade-card.timeInContent": "콘텐츠의 시간(분)",
	"components.insights-time-in-content-vs-grade-card.leftTop": "{numberOfUsers}명의 사용자 등록 인원이 평균 이상이며 콘텐츠 참여 시간이 평균 이하입니다.",
	"components.insights-time-in-content-vs-grade-card.rightTop": "{numberOfUsers}명의 사용자 등록 인원이 평균 이상이며 콘텐츠 참여 시간이 평균 이상입니다.",
	"components.insights-time-in-content-vs-grade-card.leftBottom": "{numberOfUsers}명의 사용자 등록 인원이 평균 이하이며 콘텐츠 참여 시간이 평균 이하입니다.",
	"components.insights-time-in-content-vs-grade-card.rightBottom": "{numberOfUsers}명의 사용자 등록 인원이 평균 이하이며 콘텐츠 참여 시간이 평균 이상입니다.",

	"components.insights-current-final-grade-card.currentGrade": "현재 평점",
	"components.insights-current-final-grade-card.numberOfStudents": "사용자 수",
	"components.insights-current-final-grade-card.xAxisLabel": "현재 평점(%)",
	"components.insights-current-final-grade-card.textLabel": "이 차트에는 강의당 각 사용자의 현재 최종 평점이 표시됩니다",
	"components.insights-current-final-grade-card.emptyMessage": "필터와 일치하는 결과가 없습니다.",
	"components.insights-current-final-grade-card.gradeBetween": "사용자 {numberOfUsers}명의 현재 성적이 {range}% 사이입니다.",
	"components.insights-current-final-grade-card.gradeBetweenSingleUser": "사용자 1명의 현재 성적이 {range}% 사이입니다.",

	"components.insights-course-last-access-card.courseAccess": "강의 접근",
	"components.insights-course-last-access-card.numberOfUsers": "사용자 수",
	"components.insights-course-last-access-card.textLabel": "이 차트에는 강의당 각 사용자의 현재 최종 평점이 표시됩니다",
	"components.insights-course-last-access-card.lastDateSinceAccess": "사용자가 강의에 마지막으로 접근한 시간",
	"components.insights-course-last-access-card.never": "없음",
	"components.insights-course-last-access-card.moreThanFourteenDaysAgo": "> 14일 전",
	"components.insights-course-last-access-card.sevenToFourteenDaysAgo": "7~14일 전",
	"components.insights-course-last-access-card.fiveToSevenDaysAgo": "5~7일 전",
	"components.insights-course-last-access-card.oneToFiveDaysAgo": "1~5일 전",
	"components.insights-course-last-access-card.lessThanOneDayAgo": "< 1일 전",
	"components.insights-course-last-access-card.accessibilityLessThanOne": "1일 이내임",
	"components.insights-course-last-access-card.tooltipNeverAccessed": "{numberOfUsers}명의 사용자가 강의에 접근한 적이 없습니다.",
	"components.insights-course-last-access-card.tooltipMoreThanFourteenDays": "{numberOfUsers}명의 사용자가 강의에 마지막으로 접근한 지 14일이 넘었습니다.",
	"components.insights-course-last-access-card.toolTipSevenToFourteenDays": "{numberOfUsers}명의 사용자가 7~14일 전에 마지막으로 강의에 접근했습니다.",
	"components.insights-course-last-access-card.toolTipFiveToSevenDays": "{numberOfUsers}명의 사용자가 5~7일 전에 마지막으로 강의에 접근했습니다.",
	"components.insights-course-last-access-card.toolTipOneToFiveDays": "{numberOfUsers}명의 사용자가 1~5일 전에 마지막으로 강의에 접근했습니다.",
	"components.insights-course-last-access-card.toolTipLessThanOneDay": "{numberOfUsers}명의 사용자가 강의에 마지막으로 접근한 지 1일이 되지 않았습니다.",
	"components.insights-course-last-access-card.tooltipNeverAccessedSingleUser": "1명의 사용자가 강의에 접근한 적이 없습니다.",
	"components.insights-course-last-access-card.tooltipMoreThanFourteenDaysSingleUser": "1명의 사용자가 강의에 마지막으로 접근한 지 14일이 넘었습니다.",
	"components.insights-course-last-access-card.toolTipSevenToFourteenDaysSingleUser": "1명의 사용자가 7~14일 전에 마지막으로 강의에 접근했습니다.",
	"components.insights-course-last-access-card.toolTipFiveToSevenDaysSingleUser": "1명의 사용자가 5~7일 전에 마지막으로 강의에 접근했습니다.",
	"components.insights-course-last-access-card.toolTipOneToFiveDaysSingleUser": "1명의 사용자가 1~5일 전에 마지막으로 강의에 접근했습니다.",
	"components.insights-course-last-access-card.toolTipLessThanOneDaySingleUser": "1명의 사용자가 강의에 마지막으로 접근한 지 1일이 되지 않았습니다.",

	"components.insights-discussion-activity-card.cardTitle": "Discussion Activity",
	"components.insights-discussion-activity-card.threads": "Threads",
	"components.insights-discussion-activity-card.replies": "Replies",
	"components.insights-discussion-activity-card.reads": "Reads",
	"components.insights-discussion-activity-card.textLabel": "This chart displays the total number of threads, replies, and reads in discussion forums for all users in the selected courses",

	"components.insights-discussion-activity-card.toolTipThreads": "{numberOfUsers} threads have been created by the returned users",
	"components.insights-discussion-activity-card.toolTipReplies": "{numberOfUsers} posts have been replied to by the returned users",
	"components.insights-discussion-activity-card.toolTipReads": "{numberOfUsers} posts have been read by the returned users",
	"components.insights-discussion-activity-card.legendItem": "Toggle {itemName}",
	"components.insights-discussion-activity-card.legendLabel": "Toggle filtering",

	"components.insights-applied-filters.clear-all": "모두 지우기",
	"components.insights-applied-filters.label-text": "Showing only:",

	"components.insights-aria-loading-progress.loading-start": "로드 중입니다.",
	"components.insights-aria-loading-progress.loading-finish": "로딩되었습니다.",

	"components.insights-default-view-popup.title": "참여 대시보드 기본 보기",
	"components.insights-default-view-popup.defaultViewDescription1": "이 대시보드는 구성의 참여 부분을 볼 수 있도록 설계되어 있습니다. 표시되는 결과는 시작하기 위해 최근에 접근한 {numDefaultCourses}에서 가져온 것입니다.",
	"components.insights-default-view-popup.defaultViewDescription2": "표시된 결과를 변경하려면 대시보드 필터를 사용합니다.",
	"components.insights-default-view-popup.expandDefaultCourseList": "확장하여 기본 보기에 포함된 강의를 봅니다.",
	"components.insights-default-view-popup.collapseDefaultCourseList": "기본 보기에 포함된 강의 목록을 축소합니다.",
	"components.insights-default-view-popup.buttonOk": "확인"
};
