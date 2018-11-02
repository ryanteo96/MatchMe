function showMoreInfo(item) {
	$("#confirmModal").modal("show");

	var id = $(item).attr("activityid");

	$.post(
		"/index/getActivityDetails",
		{
			id: id,
		},
		function(res) {
			$("#activtyName").val(res.activity.activityName);
			$("#date").val(
				moment(res.activity.datentime).format("MMM D, YYYY"),
			);
			$("#time").val(moment(res.activity.datentime).format("hh:mm A"));
			$("#location").val(res.activity.location);
			$("#maxMembers").val(res.activity.maxMembers);
			$("#createdBy").val(res.activity.host);
			$("#description").val(res.activity.activityDescription);
			$("#keywords").val(res.activity.activityKeywords.join(", "));
			$("#activityId").val(res.activity._id);

			if (res.activity.host_id == res.user._id) {
				$("#joinBtn").prop("disabled", true);
			} else {
				$("#joinBtn").prop("disabled", false);
			}
		},
	);
}
