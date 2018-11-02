function deleteConfirmation(item) {
	$("#confirmModal").modal("show");

	var id = $(item).attr("activityid");

	$("#deleteYesBtn").click(function() {
		$.post(
			"/delete",
			{
				id: id,
			},
			function(res) {
				if (res == "0") {
					window.location.href = "/profile";
				}
			},
		);
	});

	// $("#activtyName").val(res.activity.activityName);
	// $("#date").val(
	// 	moment(res.activity.datentime).format("MMM D, YYYY"),
	// );
	// $("#time").val(moment(res.activity.datentime).format("hh:mm A"));
	// $("#location").val(res.activity.location);
	// $("#maxMembers").val(res.activity.currentMaxMembers);
	// $("#createdBy").val(res.activity.host);
	// $("#description").val(res.activity.activityDescription);
	// $("#keywords").val(res.activity.activityKeywords.join(", "));
	// $("#activityId").val(res.activity._id);
	// if (res.activity.host_id == res.user._id) {
	// 	$("#joinBtn").prop("disabled", true);
	// 	$("#joinBtn").html("Own Activity");
	// } else {
	// 	if (res.activity.currentMaxMembers == 0) {
	// 		$("#joinBtn").prop("disabled", true);
	// 		$("#joinBtn").html("Full");
	// 	} else {
	// 		$("#joinBtn").prop("disabled", false);
	// 		$("#joinBtn").html("Join");
	// 	}
	// }
	// if (
	// 	res.activity.requestList.filter(e => e["_id"] === res.user._id)
	// 		.length == 1
	// ) {
	// 	$("#joinBtn").prop("disabled", true);
	// 	$("#joinBtn").html("Already Requested");
	// }
	// if (
	// 	res.activity.memberList.filter(e => e["_id"] === res.user._id)
	// 		.length == 1
	// ) {
	// 	$("#joinBtn").prop("disabled", true);
	// 	$("#joinBtn").html("Already Joined");
	// }
	// },
	// );
}
