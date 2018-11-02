function showMoreInfo(item) {
	$("#confirmModal").modal("show");

	var id = $(item).attr("activityid");

	$.post(
		"/index/getActivityDetails",
		{
			id: id,
		},
		function(res) {
			$("#activtyName").val(res.activityName);
			$("#date").val(moment(res.datentime).format("MMM D, YYYY"));
			$("#time").val(moment(res.datentime).format("hh:mm A"));
			$("#location").val(res.location);
			$("#maxMembers").val(res.maxMembers);
			$("#description").val(res.activityDescription);
			$("#keywords").val(res.activityKeywords.join(", "));
		},
	);
}
