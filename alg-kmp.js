
function create_kmp(text, pattern) {
    /*
    [0,-1,false] ==>

    0 is location of pattern,
    -1 comparison length of pattern.
    false if pattern doesn't match with text. Otherwise it is true.
    */

    var failure_function = create_border_array(text,pattern);

    //Based on Trivial algorithm
    var states = [[0, -1, false]];
    var chapters = [0];

    for(var position = 0; position < text.length - pattern.length + 1; position++) {
        var ok = true;
        var jump_by;
        for(var i = 0; i < pattern.length; i++) {
            jump_by = i-failure_function.border_array[i-1]-1;
            states.push([position, i, false]);
            if(text.charAt(position + i) != pattern.charAt(i)) {
                ok = false;
                if(i>0){
                    position += jump_by;
            	}
                break;

            }
        }
        if(ok) {
            states.push([position, pattern.length - 1, true]);
            position += jump_by;
        }
        chapters.push(states.length - 1);
    }
    return {
        "id":"kmp",
        "name": "KMP",
        "text": text,
        "pattern": pattern,

        "supports": [failure_function],
        "failure_function" : failure_function,

        "states": states,
        "chapters": chapters,
        "current": 0,
        "current_chapter": 0,

        "next_chapter": generic_next_chapter,
        "prev_chapter": generic_prev_chapter,
        "next_step": generic_next_step,
        "prev_step": generic_prev_step,
        "start" : generic_start,
        "end" : generic_end,

        "render": function(area_target) {
            var area = $(area_target);
            area.empty();

            // construct renderable version of text and pattern
            var text_array = expand_string(this.text);
            var pat_array = expand_string(this.pattern);

            // select the current state
            var state = this.states[this.current];
            var shift = state[0];
            var compare_length = state[1];
            var is_match = state[2];

            // reconstruct the state
            if(is_match) {
                for(var i = 0; i < compare_length + 1; i++) {
                    text_array[shift + i].cls = "found";
                    pat_array[i].cls = "found";
                }
            } else {
                var compare = [];
                for(var i = 0; i < compare_length + 1; i++) {
                    compare.push(shift + i);
                }
                add_match_classes(text_array, pat_array, shift, compare);
            }

            // render text and pattern
            render({
                "array": text_array,
                "pad": pad_info(0),
            }, "#monospace-string", area);
            render({
                "array": pat_array,
                "pad": pad_info(shift),
            }, "#monospace-string", area);


            render({},"#horizontal-rule",area);
            render({
                "string": "Border Array / Failure Function",
            }, "#auxiliary-string", area);

            if (compare_length>=0 && pat_array[compare_length].cls=="mismatch"){
                pat_array[compare_length].index_cls = "cursor";
            }

            render({
                "array": pat_array,
                "pad": pad_info(0),
            }, "#monospace-string", area);

            var bor_array = [];
            for(var i = 0; i < this.pattern.length; i++){
                var cls = (i == compare_length-1) ? "cursor" : "";
                bor_array.push({
                    "index": i,
                    "letter": this.failure_function.border_array[i],
                    "cls": cls,
                    "index_cls": "",
                });
            }
            render({
                "array": bor_array,
                "pad": pad_info(0),
            }, "#monospace-string", area);


            if (is_match || compare_length>=0 && pat_array[compare_length].cls=="mismatch"){
                if (compare_length == 0){
                    render({
                        "string": "Jump by 1",
                        }, "#auxiliary-string", area);
                    }
                else{
                    render({
                        "string": "Jump by " + (compare_length - this.failure_function.border_array[compare_length-1]) + " (" + compare_length+ " - " + this.failure_function.border_array[compare_length-1] + ")" ,
                    }, "#auxiliary-string", area);
                }
            }
        },
    };
}
stralg.story_inits["kmp"] = {
    "constructor": create_kmp,
    "name": "KMP",
    "long_name": "Knuth-Morris-Pratt (KMP)",
    "type": "exact",
};
