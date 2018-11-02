function accept(item) {
	var memberId = $(item).attr("memberId");
	var activityId = $(item).attr("activityId");

	$.post(
		"/accept",
		{
			memberId: memberId,
			activityId: activityId,
		},
		function(res) {
			if (res == "0") {
				window.location.href = "/profile";
			}
		},
	);
}

function deny(item) {
	var memberId = $(item).attr("memberId");
	var activityId = $(item).attr("activityId");

	$.post(
		"/deny",
		{
			memberId: memberId,
			activityId: activityId,
		},
		function(res) {
			if (res == "0") {
				window.location.href = "/profile";
			}
		},
	);
}
