/*global $ */
$( "#draggable" ).draggable({ containment: "#simulator" });

$( "input" ).change(() => {
	$( "#draggable" ).animate({height: $( "input" ).val() + "px"}, 500);
} );