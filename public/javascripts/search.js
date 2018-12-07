$(document).ready(function () {
    var postList = new Array();
    var aNames = new Array();
    var aDets = new Array();
    var aMembers = new Array();
    var aMaxMembers = new Array();
    var dates = new Array();
    var host = new Array();
    var times = new Array();
    var userId = new Array();
    var hostId = new Array();
    var distance = new Array();
    $.get("https://api.mlab.com/api/1/databases/match-me/collections/activities?apiKey=FlY86WNOknPst39LZNGGjnG7yXnZrXLP", function (data, status) {
        //console.log(data);
        for (var i = 0; i < data.length; i++) {
            postList[i] = data[i].location;
            aNames[i] = data[i].activityName;
            aDets[i] = data[i].activityDescription;
            aMembers[i] = data[i].currentMaxMembers;
            aMaxMembers[i] = data[i].maxMembers;
            dates[i] = moment(data[i].datentime).format("MMM D, YYYY");
            times[i] = moment(data[i].datentime).format("hh:mm A");
            host[i] = data[i].host;
            userId[i] = data[i]._id.$oid;
            hostId[i] = data[i].host_id;
        }
        //console.log(postList[3]);
        var map = L.map('map', {
            doubleClickZoom: false
        }).locate({
            setView: true,
            maxZoom: 12
        });
        var geocoder;
        var marker;
        var counter = 0;
        geocoder = new google.maps.Geocoder();

        // Get current location
        if (navigator.geolocation) { //check if geolocation is available
            navigator.geolocation.getCurrentPosition(function(position){
                var icon = L.icon({
                iconUrl: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                iconSize:     [30, 30], // size of the icon
                });
                var marker = L.marker([position.coords.latitude,position.coords.longitude],{icon : icon});


                marker.bindPopup("You are here.").addTo(map);
                
                // Save to DB user location
                localStorage.setItem("latitude", position.coords.latitude);
                localStorage.setItem("longitude", position.coords.longitude)

            });   
        } else {
                $('#result').html('Geocode was not successful for the following reason: ' + status);
        }

        var lat = localStorage.latitude;
        var lng = localStorage.longitude;

        for (var i = 0; i < postList.length; i++) {

            var address = postList[i];

            //console.log(postList[i]);
            //console.log(aNames[i]);
            //console.log(aDets[i]);
            //console.log(aMembers[i]);
            //console.log(aMaxMembers[i]);

            geocoder.geocode({
                'address': postList[i],
            }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
     
                    var marker = L.marker([results[0].geometry.location.lat(), results[0].geometry.location.lng()]);
                    marker.bindPopup("Location: " + postList[counter] + '<br>' + '<br>' + "Name: " + aNames[counter] + '<br>' + '<br>' + "Date: " + dates[counter] + '<br>' + '<br>' + "Time: " + times[counter] + '<br>' + '<br>' + "Description: " + aDets[counter] + '<br>' + '<br>' + "Host: " + host[counter] + '<br>' + '<br>' +"Slots Left: " + aMembers[counter] ).addTo(map);
                    
                    
                    var dis = DistanceBetween(results[0].geometry.location.lat(), results[0].geometry.location.lng(), lat, lng);

                    data[counter].distance = dis;

                    id = data[counter]._id.$oid;
                    //console.log("https://api.mlab.com/api/1/databases/match-me/collections/activities/"+id+"?apiKey=FlY86WNOknPst39LZNGGjnG7yXnZrXLP");

                    $.ajax({
                        url: "https://api.mlab.com/api/1/databases/match-me/collections/activities/"+id+"?apiKey=FlY86WNOknPst39LZNGGjnG7yXnZrXLP",
                        type: "PUT",
                        data: JSON.stringify(data[counter]),
                        contentType: 'application/json'
                    }).done(function(data) {
                        //console.log(data);
                    });

                } else {
                    $('#result').html('Geocode was not successful for the following reason: ' + status);
                }
                counter++;
            });

        }


        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

    });

});


function DistanceBetween(lat1, lng1, lat2, lng2){
    var R = 6371;
    var dLat = (lat2-lat1) * Math.PI / 180;
    var dLng = (lng2-lng1) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
}



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
            $("#distance").val(Math.round(res.activity.distance * 1000) / 1000 + ' km');

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