function accept(item) {
	var memberId = $(item).attr("memberId");
	var activityId = $(item).attr("activityId");
	var userId = $(item).attr("userId");

	$.post(
		"/accept",
		{
			memberId: memberId,
			activityId: activityId,
		},
		function(res) {
			if (res == "0") {
				window.location.href = "/profile/" + userId;
			}
		},
	);
}

function deny(item) {
	var memberId = $(item).attr("memberId");
	var activityId = $(item).attr("activityId");
	var userId = $(item).attr("userId");

	$.post(
		"/deny",
		{
			memberId: memberId,
			activityId: activityId,
		},
		function(res) {
			if (res == "0") {
				window.location.href = "/profile/" + userId;
			}
		},
	);
}

function remove(item) {
	var memberId = $(item).attr("memberId");
	var activityId = $(item).attr("activityId");
	var userId = $(item).attr("userId");

	console.log(memberId);
	console.log(activityId);

	$.post(
		"/remove",
		{
			memberId: memberId,
			activityId: activityId,
		},
		function(res) {
			if (res == "0") {
				window.location.href = "/profile/" + userId;
			}
		},
	);
}
