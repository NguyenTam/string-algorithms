/**
 * The code uses MIT license, included in the license.txt.
 */

/***
 * Structure:
 *   index.html     - initial html and templates for handlebare
 *   stralg.css     - custom styles for elements
 *   stralg.js      - this file. Included at the end. Binds actions to user
 *                    interface and uses algorithm objects through a generic
 *                    interface.
 *   stalg-init.js  - Included in the beginning. Defines functions for use in
 *                    algorithm files and explains the interface for algorithm
 *                    objects.
 *   alg-xx.js      - Algorithm file containing an implementation and
 *                    visualisation for an algorithm.
 * plus files for third party libraries: handlebars, bootstrap and jquery
 ***/


/**
 * Redraws the current state of the current algorithm
 */
function redraw() {
    if(stralg["main_story"] == null)
        return;
    stralg["main_story"].render("#story-area");
    // keep the longest height
    var height = $("#story-area").height();
    var minheight = $("#story-area").css("min-height");
    minheight = minheight.substring(0, minheight.length - 2);
    $("#story-area").css("min-height", Math.max(height, minheight) + "px");
}

/**
 * Draws the header for the current algorithm containing the algorithm name and
 * links for required support algorithms. Also, binds the links to the
 * corresponding actions.
 */
function draw_support_links(alg_obj) {
    var target = $("#support-links");
    target.empty();
    render({
        "name": stralg["story_inits"][alg_obj.id].long_name,
    }, "#alg-header", target);
    if(contains_key(alg_obj, "supports")) {
        for(var i = 0; i < alg_obj.supports.length; i++) {
            var sup_obj = alg_obj.supports[i];
            render({
                "prefix": "Support: ",
                "name": sup_obj.name,
                "i": i,
            }, "#support-link", target);
        }
    }
    if(contains_key(alg_obj, "parent_story")) {
        render({
            "prefix": "Back to: ",
            "name": alg_obj.parent_story.name,
            "i": -1,
        }, "#support-link", target);
    }
    $(".support-link").click(function() {
        /**
         * Switches the current algorithm to its support algorithm or parent
         * algorithm depending on the link.
         */
        var i = $(this).attr("data-support-idx");
        if(i == -1) {
            var next_story = stralg["main_story"].parent_story;
            stralg["main_story"] = next_story;
        } else {
            var next_story = stralg["main_story"].supports[i];
            next_story.parent_story = stralg["main_story"];
            stralg["main_story"] = next_story;
        }
        draw_support_links(stralg["main_story"]);
        redraw();
		if(typeof intervalId != 'undefined' ){
			$("#play-pause").trigger("click");
		}
    });
}

/**
 * Initializes the selected algorithm with the input written to the fields.
 * Creates an algorithm object for further processing.
 */
function select_story(algorithm, text, pattern) {
    // check that there is some input TODO
    if(contains_key(stralg["story_inits"], algorithm)) {
        var info = stralg["story_inits"][algorithm];
        stralg["main_story"] = info.constructor(text, pattern);
        draw_support_links(stralg["main_story"]);
        redraw();
		if(typeof intervalId != 'undefined' ){
			$("#play-pause").trigger("click");
		}
    } else {
    }
}

/**
 * Calls the corresponding function from the current algorithm object.
 *      next/prev step      - short step
 *      next/prev chapter   - long step
 *      start               - to the beginning of the simulation
 *      end                 - to the end of the simulation
 */
function next_step() {
    if(stralg["main_story"] == null)
        return;
    stralg["main_story"].next_step();
    redraw();
}
function prev_step() {
    if(stralg["main_story"] == null)
        return;
    stralg["main_story"].prev_step();
    redraw();
}
function next_chapter() {
    if(stralg["main_story"] == null)
        return;
    stralg["main_story"].next_chapter();
    redraw();
}
function prev_chapter() {
    if(stralg["main_story"] == null)
        return;
    stralg["main_story"].prev_chapter();
    redraw();
}
function start() {
    if(stralg["main_story"] == null)
        return;
    stralg["main_story"].start();
    redraw();   
}
function end() {
    if(stralg["main_story"] == null)
        return;
    stralg["main_story"].end();
    redraw();   
}

/**
 * Toggles the timer for simulation on and off.
 */
var intervalId = undefined;
var speed_scale = 1;
function play_pause(){
	
	if($("#play-pause").hasClass("glyphicon-play")){
		if(typeof intervalId == 'undefined' && stralg["main_story"] != null){
			intervalId = setInterval(next_step,1000/speed_scale);
			$("#play-pause").removeClass("glyphicon-play");
			$("#play-pause").addClass("glyphicon-pause");
		}
	}
	else{
		if(typeof intervalId != 'undefined'){
			clearInterval(intervalId);
			intervalId = undefined;
			$("#play-pause").removeClass("glyphicon-pause");
			$("#play-pause").addClass("glyphicon-play");
		}
	}
}

/**
 * Sets the timer speed for play/pause
 */
function speed(new_scale){
    speed_scale = parseFloat(new_scale);
    if($("#play-pause").hasClass("glyphicon-pause")){
		clearInterval(intervalId);
		intervalId = setInterval(next_step,1000/speed_scale);
    }
}

/**
 * Debug view for rendering all the different colorings for monospace string
 * slots.
 */
function test_render_monospace_string(area) {
    var classes = ["", "match", "mismatch", "found", "cursor"];
    for(var i = 0; i < classes.length; i++) {
        var arr = [];
        for(var j = 0; j < classes.length; j++) {
            for(var k = 0; k < classes.length; k++) {
                arr.push({
                    "letter": "X",
                    "index": j*classes.length + k,
                    "cls": classes[i],
                    "index_cls": classes[k],
                    "letter_cls": classes[j],
                });
            }
        }
        render({
            "array": arr,
            "pad": pad_info(0),
        }, "#monospace-string", area);
    }
}

/**
 * Debug view for rendering some rendering tests
 */
function render_secret_tests() {
    var area = $("#story-area");
    area.empty();
	render({
        "foo": "bar",
        "bar": "aaaa",
    }, "#table-template", area);
    render({
        "arr": [[1,2,3],[4,5,6]],
    }, "#example-for-2d", area);
    // prints monospace string test rendering
    test_render_monospace_string(area);
}


/**
 * Populates the second select box according to the choice on the first one.
 */
function create_algorithm_options() {
    var type = $("#algorithm-type").val();
    var algs = [];
    for(var key in stralg.story_inits) {
        var alg = stralg.story_inits[key];
        if(alg.type == type)
            algs.push({
                "name": alg.long_name,
                "key": key,
            });
    }
    $("#algorithm-select").empty();
    render({
        "algorithms": algs,
    }, "#algorithm-option-template", "#algorithm-select");
}



$(document).ready(function() {

    speed_scale = $("#speed").val();

    $("#text-field, #pattern-field").keypress(function(e){
        if(e.keyCode == 13){
            // at least for me, the focus was enough and the enter somehow
            // activated the button after that.
//            $("#select-story").trigger("click").focus();
            $("#select-story").focus();
        }
    });


    $("#select-story").click(function(event) {
        var algorithm = $("#algorithm-select").val();
        var text = $("#text-field").val();
        var pattern = $("#pattern-field").val();
        if(text == "debug" && pattern == "") {
            render_secret_tests();
        } else {
            select_story(algorithm, text, pattern);
		}
        event.stopPropagation();
    });
    $("#next_step").click(function(event) {
        next_step();
		event.stopPropagation();
    });
    $("#next_chapter").click(function(event) {
        next_chapter();
		event.stopPropagation();
    });
	
    $("#prev_step").click(function(event) {
        prev_step();
		event.stopPropagation();
    });
    $("#prev_chapter").click(function(event) {
        prev_chapter();
		event.stopPropagation();
    });
    $("#end").click(function(event){
        end();
		event.stopPropagation();
    });
	
    $("#start").click(function(event){
        start();
		event.stopPropagation();
    });
	
    $("#play-pause").click(function(event){
        play_pause();
		event.stopPropagation();
    });
	
    var alg_before_refresh = $("#algorithm-select").val();
    create_algorithm_options();
    if($("#algorithm-select option[value="+alg_before_refresh + "]"))
        $("#algorithm-select").val(alg_before_refresh);
    $("#algorithm-type").change(function(){
        create_algorithm_options();
    });
	
    $("#clear-all").click(function(event){
        $("#pattern-field").val("");
        $("#text-field").val("");
		event.stopPropagation();
    });
	
    $("#controller").click(function(event){
		if($(this).hasClass("controller_activated")){
			$(this).removeClass("controller_activated");
			$(this).addClass("controller_deactivated");
		}
		else{
			$(this).removeClass("controller_deactivated")
			$(this).addClass("controller_activated");
		}
		
    });
	
	/*Only prevent from changing controller mode*/
	$("#speed").click(function(event){
		event.stopPropagation();
	});


    $("#speed").change(function (event){
		var value = $(this).val();
        console.log($(this).val());
		speed(value);
		event.stopPropagation();
    });

    $(document).keypress(function(e){
        if($("input[type=text]:focus").length == 0){
    		switch(e.which){
    		case(57): 
    			$("#select-story").trigger("click").focus();
    			break;

    		case(48): 
    			$("#clear-all").trigger("click").focus();
    			break;

    		case(49): //'1'
    			$("#start").trigger("click").focus();
    			break;

    		case(50): //'2'
    			$("#prev_chapter").trigger("click").focus();
    			break;

    		case( 51)://'3'
    			$("#prev_step").trigger("click").focus();
    			break;

    		case(52)://'4'
    			$("#play-pause").trigger("click").focus();
    			break;

    		case(53)://'5'
    			$("#next_step").trigger("click").focus();
    			break;

    		case(54)://'6'
    			$("#next_chapter").trigger("click").focus();
    			break;

    		case(55)://'7'
    			$("#end").trigger("click").focus();
    			break;

    		case(43)://'+'
    			console.log($('#speed option:selected').val());
                if($('#speed option:selected').next().length > 0) {
                    $('#speed').val($('#speed option:selected').next().val());
                    $("#speed").trigger("change").focus();
                }
    			break;

    		case(45)://'-'
    			console.log($('#speed option:selected').val());
                if($('#speed option:selected').prev().length > 0) {
                    $('#speed').val($('#speed option:selected').prev().val());
                    $("#speed").trigger("change").focus();
                }
    			break;
    		}
    	}
    });

    $(".help-button.open-help").click(function() {
        $("#HelpContainer").removeClass("hidden");
        $(".help-button.open-help").addClass("hidden");
        $("#shade").removeClass("hidden");
    });
    $(".help-button.close-help").click(function() {
        $("#HelpContainer").addClass("hidden");
        $(".help-button.open-help").removeClass("hidden");
        $("#shade").addClass("hidden");
    });

});
