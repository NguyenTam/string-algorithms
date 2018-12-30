function create_trivial(text, pattern) {
    /*
    [0,-1,false] ==>

    0 is location of pattern,
    -1 comparison length of pattern.
    false if pattern doesn't match with text. Otherwise it is true.
    */
    var states = [[0, -1, false]];
    var chapters = [0];
    for(var position = 0; position < text.length - pattern.length + 1; position++) {
        var ok = true;
        for(var i = 0; i < pattern.length; i++) {
            states.push([position, i, false]);
            if(text.charAt(position + i) != pattern.charAt(i)) {
                ok = false;
                break;
            }
        }
        if(ok) {
            states.push([position, pattern.length - 1, true]);
        }
        chapters.push(states.length - 1);
    }
    return {
        "id" : "trivial",
        "name": "Trivial",
        "text": text,
        "pattern": pattern,

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
        },
    };
}
stralg.story_inits["trivial"] = {
    "constructor": create_trivial,
    "name": "Trivial",
    "long_name": "Trivial",
    "type": "exact",
};
