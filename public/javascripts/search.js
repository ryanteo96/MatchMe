$(document).ready(function () {
    var postList = new Array();
    var aNames = new Array();
    var aDets = new Array();
    var aMembers = new Array();
    var aMaxMembers = new Array();
    var dates = new Array();

    $.get("https://api.mlab.com/api/1/databases/match-me/collections/activities?apiKey=FlY86WNOknPst39LZNGGjnG7yXnZrXLP", function (data, status) {
        console.log(data);
        for (var i = 0; i < data.length; i++) {
            postList[i] = data[i].location;
            aNames[i] = data[i].activityName;
            aDets[i] = data[i].activityDescription;
            aMembers[i] = data[i].currentMaxMembers;
            aMaxMembers[i] = data[i].MaxMembers;
        }
        //console.log(postList[3]);
        var map = L.map('map', {
            doubleClickZoom: false
        }).locate({
            setView: true,
            maxZoom: 12
        });
        var geocoder;

        document.body.onload = function initialize() {
            geocoder = new google.maps.Geocoder();
            for (var i = 0; i < postList.length; i++) {
                var address = postList[i];
                var names = aNames[i];
                var details = aDets[i];
                var members = aMembers[i];
                var maxmembers = aMaxMembers[i];

                //console.log(postList[i]);
                //console.log(aNames[i]);
                //console.log(aDets[i]);
                //console.log(aMembers[i]);
                //console.log(aMaxMembers[i]);
              
                
                geocoder.geocode({
                    'address': address,
                }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        
                        var marker = L.marker([results[0].geometry.location.lat(), results[0].geometry.location.lng()]);
                        marker.bindPopup("data").addTo(map);
                    } else {
                        $('#result').html('Geocode was not successful for the following reason: ' + status);
                    }
                });
            }

        }
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

    });

});

function showMoreInfo(item) {
    $("#confirmModal").modal("show");

    var id = $(item).attr("activityid");

    $.post(
        "/search/getActivityDetails", {
            id: id,
        },
        function (res) {
            $("#activtyName").val(res.activity.activityName);
            $("#date").val(
                moment(res.activity.datentime).format("MMM D, YYYY"),
            );
            $("#time").val(moment(res.activity.datentime).format("hh:mm A"));
            $("#location").val(res.activity.location);
            $("#maxMembers").val(res.activity.currentMaxMembers);
            $("#createdBy").val(res.activity.host);
            $("#description").val(res.activity.activityDescription);
            $("#keywords").val(res.activity.activityKeywords.join(", "));
            $("#activityId2").val(res.activity._id);

            if (res.activity.host_id == res.user._id) {
                $("#joinBtn").prop("disabled", true);
                $("#joinBtn").html("Own Activity");
            } else {
                if (res.activity.currentMaxMembers == 0) {
                    $("#joinBtn").prop("disabled", true);
                    $("#joinBtn").html("Full");
                } else {
                    $("#joinBtn").prop("disabled", false);
                    $("#joinBtn").html("Join");
                }
            }

            if (
                res.activity.requestList.filter(e => e["_id"] === res.user._id)
                .length == 1
            ) {
                $("#joinBtn").prop("disabled", true);
                $("#joinBtn").html("Already Requested");
            }

            if (
                res.activity.memberList.filter(e => e["_id"] === res.user._id)
                .length == 1
            ) {
                $("#joinBtn").prop("disabled", true);
                $("#joinBtn").html("Already Joined");
            }
        },
    );
}