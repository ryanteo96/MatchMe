function accept(item) {
	var id = $(item).attr("memberId");

	console.log("accept");
	console.log(id);

	// $.post(
	// 	"/index/getActivityDetails",
	// 	{
	// 		id: id,
	// 	},
	// 	function(res) {
	// 		$("#activtyName").val(res.activity.activityName);
	// 		$("#date").val(
	// 			moment(res.activity.datentime).format("MMM D, YYYY"),
	// 		);
	// 		$("#time").val(moment(res.activity.datentime).format("hh:mm A"));
	// 		$("#location").val(res.activity.location);
	// 		$("#maxMembers").val(res.activity.maxMembers);
	// 		$("#createdBy").val(res.activity.host);
	// 		$("#description").val(res.activity.activityDescription);
	// 		$("#keywords").val(res.activity.activityKeywords.join(", "));
	// 		$("#activityId").val(res.activity._id);

	// 		if (res.activity.host_id == res.user._id) {
	// 			$("#joinBtn").prop("disabled", true);
	// 		} else {
	// 			$("#joinBtn").prop("disabled", false);
	// 		}
	// 	},
	// );
}

function deny(item) {
	var memberId = $(item).attr("memberId");
	var activityId = $(item).attr("activityId");

	console.log(memberId);
	console.log(activityId);

	$.post(
		"/deny",
		{
			memberId: memberId,
			activityId: activityId,
		},
		function(res) {},
	);
}
